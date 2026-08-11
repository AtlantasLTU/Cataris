import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./BettingPanel.css";
import Login from "../../Login";
import Register from "../../Register";
import BettingPanel from "../gameComponents/BettingPanel";
import Cat, { type CatHandle } from "./CatGame";
import logo from "../../../assets/LOGO.svg";
import cat from "../../../assets/games/game-cat.png";

// png imports
export default function Home() {
  const catRef = useRef<CatHandle | null>(null);

  const [betAmount, setBetAmount] = useState<number | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  useEffect(() => {
    const auth = searchParams.get("auth");
    setShowLogin(auth === "login");
    setShowRegister(auth === "register");
  }, [searchParams]);
  const closeAuthModal = () => {
    setShowLogin(false);
    setShowRegister(false);
    void navigate("/", { replace: true }); // clears ?auth=...
  };

  const startGame = () => {
    if (!isAuthenticated) return;
    if (!betAmount || betAmount <= 0) return;
    setGameStarted(true);
    setGameOver(false);
    catRef.current?.initializeGame();
    // Add your game starting logic here
  };
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);
  useEffect(() => {
      const handleGameOver = () => {
        console.log("over!");
        setGameOver(true);
        setGameStarted(false);
      }
      window.addEventListener("game:over", handleGameOver);
      return () => window.removeEventListener("game:over", handleGameOver);
  }, []);
  return (
    <main className="home">
      {!isAuthenticated && (
        <div className="fixed inset-0 bg-linear-to-b from-[#102c56] via-[#0b3a6f] to-[#081c36] bg-opacity-100 z-10 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-11/12 sm:w-96 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <img
                  src={logo}
                  alt="Logo"
                  className="w-16 h-auto" // Adjust the size of your logo
                />
                <p className="text-xl ml-4 text-gray-700">Please log in to play the game!</p>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="flex-col justify-center items-center w-screen mt-5 md:mt-15">
        <div className="w-full justify-center items-center flex h-150">
          <BettingPanel betAmount={betAmount} setBetAmount={setBetAmount} startGame={startGame} gameOver={gameOver} gameStarted={gameStarted}>
            <div id="game-container" className="w-full h-full sm:rounded-none md:rounded-tr-2xl">
              <Cat ref={catRef}/>
            </div>
          </BettingPanel>
        </div>
        <div className="w-full flex justify-center items-center relative mt-80 md:mt-5">
          <section className="mt-8 w-[95%] xl:w-6xl pb-10">
        <div className="rounded-2xl bg-[#10305f]/80 shadow-xl border border-white/10 p-6">
          <div className="flex items-center gap-6">
            <h2 className="text-white text-2xl font-extrabold tracking-wide">
              CAT
            </h2>
            <span className="text-white/60 font-semibold text-sm">
              CATARIS ORIGINAL
            </span>
          </div>

          <div className="mt-4 text-white/90 font-semibold">Description</div>

          <div className="mt-3 flex gap-6 flex-col md:flex-row">
            {/* LEFT IMAGE */}
            <img
              src={cat}
              alt="Logo"
              className="w-[140px] md:w-[140px] h-auto rounded-xl shadow-lg"
            />

            {/* TEXT */}
            <p className="text-white/80 leading-8 text-lg">
              CAT is a fast-paced arcade-style game where timing, positioning, and anticipation define success. Navigate through dynamic paths, avoid obstacles, and guide your character safely across the board. With a clear visual layout and immediate response to player actions, CAT delivers a focused and engaging experience built around precision and flow.
            </p>
          </div>

          {/* SECTIONS */}
          <div className="mt-6 space-y-5">
            <div>
              <h3 className="text-white font-bold">Gameplay</h3>
              <p className="mt-2 text-white/75 leading-6 text-md">
                Players control movement through a structured playfield filled with moving elements and hazards. Each step forward requires attention to timing and spatial awareness, as obstacles shift and paths change. Progress is earned through careful navigation rather than speed alone, rewarding players who read the board and act decisively.
              </p>
            </div>

            <div>
              <h3 className="text-white font-bold">Timing & Precision</h3>
              <p className="mt-2 text-white/75 leading-6 text-md">
                At the core of CAT lies precise decision-making. Movement windows are clearly defined, but mistakes are unforgiving. Success depends on understanding patterns, predicting motion, and committing at the right moment. Every move carries consequence, making each successful run feel earned and controlled.
              </p>
            </div>

            <div>
              <h3 className="text-white font-bold">Cataris Original</h3>
              <p className="mt-2 text-white/75 leading-6 text-md">
                As a Cataris original title, CAT emphasizes clean mechanics, visual clarity, and skill-based outcomes. No unnecessary systems, no hidden modifiers - just a refined arcade experience designed for players who value control, focus, and mastery.
              </p>
            </div>
          </div>
        </div>
      </section>
        </div>
      </div>
      {/* DESCRIPTION CARD UNDER GAME */}
      
      {/* LOGIN MODAL */}
      {showLogin && (
        <div className="modal" role="dialog" aria-modal="true" aria-labelledby="login-title">
          <div className="modal__backdrop" onClick={closeAuthModal} />
          <div className="modal__panel">
            <button className="modal__close" onClick={closeAuthModal} aria-label="Close">×</button>
            <Login />
          </div>
        </div>
      )}

      {/* REGISTER MODAL */}
      {showRegister && (
        <div className="modal" role="dialog" aria-modal="true" aria-labelledby="register-title">
          <div className="modal__backdrop" onClick={closeAuthModal} />
          <div className="modal__panel">
            <button className="modal__close" onClick={closeAuthModal} aria-label="Close">×</button>
            <Register />
          </div>
        </div>
      )}
    </main>
  );
}
