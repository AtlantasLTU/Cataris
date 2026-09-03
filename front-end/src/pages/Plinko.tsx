import { useEffect, useRef, useState } from "react";
import { BallManager } from "./plinko/classes/BallManager";
import { WIDTH, HEIGHT } from "./plinko/constants";
import { pad } from "./plinko/padding";
//import axios from "axios";
import BettingPanel from "../components/BettingPanelPlinko";
import Login from "./Login";
import Register from "./Register";
import logo from "../assets/LOGO.svg";
//import { baseURL } from "../utils/index";
import { updateWalletBalance } from "../api/auth";
import plinko from "../assets/games/Plinko.webp"
import { useAuthModal } from "../hooks/useAuthModal";
import { useIsAuthenticated } from "../hooks/useAuth";
//import yarnBall from "../assets/ball.svg"; // <- tu podmień ścieżkę

const multipliers = [16, 9, 2, 1.4, 1.4, 1.2, 1.1, 1, 0.5, 1, 1.1, 1.2, 1.4, 1.4, 2, 9, 16];

export default function PlinkoGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);;
  const { showLogin, showRegister, closeAuthModal } = useAuthModal("/games/plinko");
  const [betAmount, setBetAmount] = useState<number | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const isAuthenticated = useIsAuthenticated();
  const lastBetRef = useRef<number | null>(null);
  const ballManagerRef = useRef<BallManager | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d')!;
    const parent = canvas.parentElement ?? canvas;
    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      // Get the actual available width from the parent container
      const parentWidth = parent.clientWidth;
      if (!parentWidth || parentWidth < 100) return;
      
      // Calculate scale to fit within parent with minimal margin
      const marginWidth = 2; // Very small margin
      const availableWidth = Math.max(parentWidth - marginWidth, 300);
      const scale = Math.min(1, availableWidth / WIDTH);
      const displayWidth = WIDTH * scale;
      const displayHeight = HEIGHT * scale;

      // Set CSS display size
      canvas.style.width = `${displayWidth}px`;
      canvas.style.height = `${displayHeight}px`;

      // Set internal pixel buffer according to scale and devicePixelRatio
      canvas.width = Math.round(displayWidth * dpr);
      canvas.height = Math.round(displayHeight * dpr);

      // Map logical drawing coordinates to the scaled canvas
      ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);
      ctx.clearRect(0, 0, WIDTH, HEIGHT);
    };

    // Initial sizing
    resize();

    // Observe parent size changes to keep canvas in sync
    const ro = new ResizeObserver(resize);
    ro.observe(parent);
    window.addEventListener('resize', resize);
    
    const manager = new BallManager(canvas, (sinkIndex) => {
      const wager = lastBetRef.current;
      if (wager === null || sinkIndex === undefined || sinkIndex < 0 || sinkIndex >= multipliers.length) return;
      
      const settle = async () => {
        const multiplier = multipliers[sinkIndex];
        const payout = (wager * multiplier).toFixed(2).toString();
        await updateWalletBalance(payout, "win");
        window.dispatchEvent(new Event("balance:refresh"));
      };

      void settle();
    });
    ballManagerRef.current = manager;

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', resize);
      ballManagerRef.current = null;
      manager.stop();
    };
  }, [canvasRef]);

  const resetGame = () => {
    setGameOver(false);
    // Additional reset logic if needed
  }

  const dropBall = async () => {
    const ballManager = ballManagerRef.current;
    if (!ballManager || betAmount === null || betAmount <= 0) return;

    // Deduct wager upfront
    lastBetRef.current = betAmount;
    await updateWalletBalance(betAmount.toFixed(2), "loss");
    window.dispatchEvent(new Event("balance:refresh"));

    // Use WIDTH / 2.055 for both obstacles and sinks to keep perfect alignment
    const spacing = 50;
    const centerBase = WIDTH / 2.07; // align with createSinks()
    const sinkCenters = Array.from({ length: 17 }, (_, i) => centerBase + spacing * (i - 8));
    const halfSpan = spacing * 8;
    const minX = centerBase - halfSpan + 5;
    const maxX = centerBase + halfSpan - 5;

    // Per-sink weights (left to right) based on requested drop chances.
    // Multipliers order: [16, 9, 2, 1.4, 1.4, 1.2, 1.1, 1, 0.5, 1, 1.1, 1.2, 1.4, 1.4, 2, 9, 16]
    // Requested percents: 0.5x 19.638, 1x 17.456, 1.2x 6.665, 1.4x first 2.777, second 0.854, 2x 0.183, 9x 0.024, 16x 0.002
    // Weights mirror requested percentages, split across duplicated multipliers
    const weights = [
      0.002,    // 16x
      0.024,    // 9x
      0.183,   // 2x
      0.854,    // 1.4x (outer)
      2.777,   // 1.4x (inner)
      6.665,   // 1.2x
      12.219,     // 1.1x (small)
      17.456,    // 1x
      19.638,   // 0.5x (most common)
      17.456,    // 1x
      12.219,     // 1.1x (small)
      6.665,   // 1.2x
      2.777,   // 1.4x (inner)
      0.854,    // 1.4x (outer)
      0.183,   // 2x
      0.024,    // 9x
      0.002     // 16x
    ];

    const total = weights.reduce((sum, w) => sum + w, 0);
    const r = Math.random() * total;
    let acc = 0;
    let chosen = sinkCenters[0];
    let chosenIndex = 0;
    for (let i = 0; i < weights.length; i++) {
      acc += weights[i];
      if (r < acc) {
        chosen = sinkCenters[i];
        chosenIndex = i;
        break;
      }
    }

    const clamped = Math.max(minX, Math.min(maxX, chosen));

    // Debug: log which sink is being targeted
    console.log(`Targeting sink ${chosenIndex} (${multipliers[chosenIndex]}x), weight: ${weights[chosenIndex]}`);
    console.log(`All sink positions: ${sinkCenters.map((x, i) => `[${i}]=${x.toFixed(1)}`).join(', ')}`);
    // BallManager expects padded coordinates; pad the chosen center and pass target index
    ballManager.addBall(pad(clamped), chosenIndex);
  };

  return (
    <main className="home flow">
    {!isAuthenticated && (
        <div className="fixed inset-0 bg-linear-to-b from-[#102c56] via-[#0b3a6f] to-[#081c36] bg-opacity-100 z-10 flex justify-center items-center">
          <div className="bg-white p-4 sm:p-6 rounded-lg w-11/12 sm:w-96 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-4">
                <img
                  src={logo}
                  alt="Logo"
                  className="w-12 sm:w-16 h-auto"
                />
                <p className="text-base sm:text-xl text-gray-700">Please log in to play the game!</p>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="w-full flex items-center justify-center py-4">
        <div className="flex items-center justify-center w-full max-w-7xl px-2 sm:px-4">
          <BettingPanel betAmount={betAmount} setBetAmount={setBetAmount} startGame={resetGame} dropBall={() => void dropBall()} gameOver={gameOver}>
            {/* <div className="w-full h-full sm:rounded-none md:rounded-tr-2xl flex justify-center items-center relative"> */}
            <canvas
              ref={canvasRef}
              className="plinko-canvas"
              style={{
                backgroundColor: 'transparent',
                cursor: 'default',
                display: 'block',
                maxWidth: '100%',
                height: 'auto',
                margin: '0 auto'
              }}
            />
            {/* //</div> */}
          </BettingPanel>
        </div>
      </div>
      {/* DESCRIPTION CARD UNDER GAME */}
      <section className="mt-8 w-full max-w-300 mx-auto px-4 pb-10">
        <div className="rounded-2xl bg-[#0f2f57]/80 shadow-xl border border-white/10 p-6">
          <div className="flex items-center gap-6">
            <h2 className="text-white text-2xl font-extrabold tracking-wide">
              BALL OF YARN
            </h2>
            <span className="text-white/60 font-semibold text-sm">
              CATARIS ORIGINAL
            </span>
          </div>

          <div className="mt-4 text-white/90 font-semibold">Description</div>

          <div className="mt-3 flex gap-6 flex-col md:flex-row">
            {/* LEFT IMAGE */}
            <img
              src={plinko}
              alt="Logo"
              className="w-35 md:w-35 h-auto rounded-xl shadow-lg"
            />

            {/* TEXT */}
            <p className="text-white/80 leading-8 text-lg">
              BALL OF YARN is a probability-driven drop game where outcomes unfold through controlled randomness. Release the ball from the top of the board and watch it bounce through a field of pins before landing in a multiplier zone. Simple to play yet rich in strategy, the game combines anticipation, distribution logic, and risk management in a clean, visually focused experience.
            </p>
          </div>

          {/* SECTIONS */}
          <div className="mt-6 space-y-5">
            <div>
              <h3 className="text-white font-bold">GamePlay</h3>
              <p className="mt-2 text-white/75 leading-6 text-md">
                Players start by placing a bet and releasing the ball of yarn onto the board. As the ball descends, it interacts with fixed pins that influence its path. The final payout is determined by the multiplier slot where the ball lands, ranging from low-risk central zones to high-reward edges.
              </p>
            </div>

            <div>
              <h3 className="text-white font-bold">Risk & Distribution</h3>
              <p className="mt-2 text-white/75 leading-6 text-md">
                BALL OF YARN is built around statistical distribution. Central slots offer more frequent, lower multipliers, while outer slots provide higher payouts at reduced probability. Players can choose how much risk they are willing to take by understanding the board layout and expected outcomes.
              </p>
            </div>

            <div>
              <h3 className="text-white font-bold">Cataris Original</h3>
              <p className="mt-2 text-white/75 leading-6 text-md">
                As a Cataris original title, BALL OF YARN emphasizes transparency, balance, and modern design. All multipliers are visible upfront, outcomes follow consistent logic, and players remain in full control of their decisions from drop to result.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* LOGIN MODAL */}
      {showLogin && (
        <div className="modal" role="dialog" aria-modal="true" aria-labelledby="login-title">
          <div className="modal__backdrop" onClick={closeAuthModal} />
          <div className="modal__panel">
            <button className="modal__close" onClick={closeAuthModal} aria-label="Close">
              ×
            </button>
            <Login />
          </div>
        </div>
      )}

      {/* REGISTER MODAL */}
      {showRegister && (
        <div className="modal" role="dialog" aria-modal="true" aria-labelledby="register-title">
          <div className="modal__backdrop" onClick={closeAuthModal} />
          <div className="modal__panel">
            <button className="modal__close" onClick={closeAuthModal} aria-label="Close">
              ×
            </button>
            <Register />
          </div>
        </div>
      )}
    </main>

  );
}