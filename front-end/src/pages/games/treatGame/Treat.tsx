import { useCallback, useEffect, useMemo, useState } from 'react';
import TreatBettingPanel from '../../../components/TreatBettingPanel';
import TreatBoard from './TreatBoard';
import type { TreatCellData } from './TreatCell';
import './Treat.css';
import Login from "../../Login";
import Register from "../../Register";
import { useNavigate, useSearchParams } from 'react-router-dom';
import { updateWalletBalance } from "../../../api/auth";
import logo from "../../../assets/LOGO.svg";
import treat from "../../../assets/games/game-treat.png";

const GRID_SIZE = 5;
const TOTAL_CELLS = GRID_SIZE * GRID_SIZE;
const DEFAULT_MINES = 3;

const createGrid = (mineCount: number): { grid: TreatCellData[][]; safeCells: number } => {
  const clampedMines = Math.min(Math.max(mineCount, 1), TOTAL_CELLS - 1);
  const minePositions = new Set<number>();

  while (minePositions.size < clampedMines) {
    minePositions.add(Math.floor(Math.random() * TOTAL_CELLS));
  }

  const grid: TreatCellData[][] = [];

  for (let row = 0; row < GRID_SIZE; row += 1) {
    const rowData: TreatCellData[] = [];
    for (let column = 0; column < GRID_SIZE; column += 1) {
      const index = row * GRID_SIZE + column;
      const isMine = minePositions.has(index);
      rowData.push({ value: isMine ? 0 : 1, isOpened: false });
    }
    grid.push(rowData);
  }

  return { grid, safeCells: TOTAL_CELLS - clampedMines };
};

const Treat = () => {
  const [betAmount, setBetAmount] = useState<number | null>(null);
  const [mineCount, setMineCount] = useState(DEFAULT_MINES);
  const [autoCashout, setAutoCashout] = useState(0);
  const [{ grid, safeCells }, setGridState] = useState(() => createGrid(DEFAULT_MINES));
  const [revealedSafes, setRevealedSafes] = useState(0);
  const [roundFinished, setRoundFinished] = useState(false);
  const [outcome, setOutcome] = useState<'win' | 'lose' | 'stopped' | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [settled, setSettled] = useState(false);

  const gameActive = gameStarted && !roundFinished;
  const hasBet = betAmount !== null && betAmount > 0;

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);

  }, []);
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
    const auth = searchParams.get("auth");
    setShowLogin(auth === "login");
    setShowRegister(auth === "register");
  }, [searchParams]);

  const startGame = useCallback(() => {
    if (!hasBet) {
      setWarning('Please enter a bet to start playing.');
      return;
    }

    const clampedMines = Math.min(Math.max(mineCount, 1), TOTAL_CELLS - 1);
    setMineCount(clampedMines);
    setGridState(createGrid(clampedMines));
    setRevealedSafes(0);
    setOutcome(null);
    setRoundFinished(false);
    setGameStarted(true);
    setWarning(null);
    setSettled(false);
  }, [hasBet, mineCount]);
  const closeAuthModal = () => {
    setShowLogin(false);
    setShowRegister(false);
    void navigate("/games/treat", { replace: true }); // clears ?auth=...
  };

  const disableReveals = useMemo(
    () => roundFinished,
    [roundFinished]
  );



  const handleReveal = useCallback(
    (rowIndex: number, columnIndex: number) => {
      if (roundFinished) return;

      if (!hasBet) {
        setWarning('Please enter a bet to play.');
        return;
      }

      if (!gameStarted) {
        setWarning('Press Play to start the round.');
        return;
      }

      setGridState((previous) => {
        const targetCell = previous.grid[rowIndex][columnIndex];
        if (targetCell.isOpened) return previous;

        const nextGrid = previous.grid.map((row, rIndex) =>
          row.map((cell, cIndex) => (rIndex === rowIndex && cIndex === columnIndex ? { ...cell, isOpened: true } : cell))
        );

        const openedSafes = nextGrid.flat().filter((cell) => cell.isOpened && cell.value === 1).length;

        if (targetCell.value === 0) {
          setOutcome('lose');
          setRoundFinished(true);
          setGameStarted(false);
          const revealedGrid = nextGrid.map((row) => row.map((cell) => ({ ...cell, isOpened: true })));
          return { grid: revealedGrid, safeCells: previous.safeCells };
        } else {
          setRevealedSafes(openedSafes);
          setWarning(null);

          const autoTarget = autoCashout > 0 ? Math.min(autoCashout, previous.safeCells) : null;
          const clearedBoard = openedSafes >= previous.safeCells;
          const shouldAutoCash = autoTarget !== null && openedSafes >= autoTarget;

          if (shouldAutoCash || (clearedBoard && autoTarget !== null)) {
            setOutcome('win');
            setRoundFinished(true);
            setGameStarted(false);
            const revealedGrid = nextGrid.map((row) => row.map((cell) => ({ ...cell, isOpened: true })));
            return { grid: revealedGrid, safeCells: previous.safeCells };
          }
        }

        return { grid: nextGrid, safeCells: previous.safeCells };
      });
    },
    [autoCashout, gameStarted, hasBet, roundFinished]
  );

  const handleCashOut = useCallback(() => {
    if (!gameActive) return;

    setOutcome(revealedSafes === 0 ? 'stopped' : 'win');
    setRoundFinished(true);
    setGameStarted(false);
    setGridState((previous) => ({
      grid: previous.grid.map((row) => row.map((cell) => ({ ...cell, isOpened: true }))),
      safeCells: previous.safeCells,
    }));
  }, [gameActive, revealedSafes]);

  const multiplier = useMemo(() => {
    if (!hasBet) return 1;
    if (outcome === 'lose') return 0;
    if (outcome === 'stopped') return 1;

    const ratio = safeCells > 0 ? revealedSafes / safeCells : 0;
    const computed = 1 + ratio;
    return Number.isFinite(computed) ? computed : 1;
  }, [hasBet, outcome, revealedSafes, safeCells]);

  const profit = useMemo(() => {
    if (!hasBet) return 0;
    if (outcome === 'lose') {
      return 0;
    }
    if (outcome === 'stopped') {
      return 0;
    }
    const baseBet = betAmount ?? 0;
    const value = baseBet * multiplier - baseBet;
    return Number.isFinite(value) ? Number(value.toFixed(2)) : 0;
  }, [betAmount, hasBet, multiplier, outcome]);

  useEffect(() => {
    if (!roundFinished) return;
    if (settled) return;
    if (!hasBet || betAmount == null || outcome == null) return;

    setSettled(true);
    if (outcome === 'lose') {
      const finalValue = betAmount.toFixed(2).toString();
      updateWalletBalance(finalValue!, "loss");
      console.log("Final Value on Lose:", finalValue);
      setTimeout(() => {
        window.dispatchEvent(new Event("balance:refresh"));
      }, 50);
      return;
    }
    if (outcome === 'win') {
      const finalValue = (betAmount * multiplier - betAmount).toFixed(2).toString();
      console.log("Final Value on Win:", finalValue);
      updateWalletBalance(finalValue!, "win");
      setTimeout(() => {
        window.dispatchEvent(new Event("balance:refresh"));
      }, 50);
      return;
    }
  }, [roundFinished, settled, hasBet, betAmount, outcome, multiplier]);

  return (
    <main className="home flow">
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
      <div className='flex w-screen min-h-screen justify-center items-start'>
        <div className='w-full flex justify-center'>
          <TreatBettingPanel
            betAmount={betAmount}
            setBetAmount={setBetAmount}
            startGame={startGame}
            gameOver={roundFinished}
            gameStarted={gameStarted}
            gameActive={gameActive}
            onCashOut={handleCashOut}
            autoCashout={autoCashout}
            setAutoCashout={(value) => setAutoCashout(Math.max(0, Math.min(value, TOTAL_CELLS)))}
            mineCount={mineCount}
            setMineCount={setMineCount}
            profit={profit}
            multiplier={multiplier}
          >
            <div className="treat-layout">
              <div className="treat-controls">
              </div>

              <div className="treat-content">
                <TreatBoard grid={grid} onReveal={handleReveal} disabled={disableReveals} />

                {warning && (
                  <p className="treat-warning">{warning}</p>
                )}

                <div className="treat-stats">
                  <p>
                    Safe picks: {revealedSafes}/{safeCells}
                  </p>
                  {outcome && (
                    <p className={`treat-outcome treat-outcome--${outcome}`}>
                      {outcome === 'win' ? 'You win!' : outcome === 'stopped' ? 'Game was stopped.' : 'You hit a trap!'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </TreatBettingPanel>
        </div>
      </div>
      {/* DESCRIPTION CARD UNDER GAME */}
      <section className="mt-8 w-full max-w-300 mx-auto px-4 pb-10">
        <div className="rounded-2xl bg-[#0f2f57]/80 shadow-xl border border-white/10 p-6">
          <div className="flex items-center gap-6">
            <h2 className="text-white text-2xl font-extrabold tracking-wide">
              TREAT
            </h2>
            <span className="text-white/60 font-semibold text-sm">
              CATARIS ORIGINAL
            </span>
          </div>

          <div className="mt-4 text-white/90 font-semibold">Description</div>

          <div className="mt-3 flex gap-6 flex-col md:flex-row">
            {/* LEFT IMAGE */}
            <img
              src={treat}
              alt="Logo"
              className="w-35 md:w-35 h-auto rounded-xl shadow-lg"
            />

            {/* TEXT */}
            <p className="text-white/80 leading-8 text-lg">
              TREAT is a fast-paced risk-and-reward grid game where every move counts. Reveal safe tiles, build your progress, and decide when to secure your winnings before hitting a trap. Designed for players who enjoy strategic control and calculated risk, TREAT delivers a clean, responsive experience with instant feedback on every action.
            </p>
          </div>

          {/* SECTIONS */}
          <div className="mt-6 space-y-5">
            <div>
              <h3 className="text-white font-bold">GamePlay</h3>
              <p className="mt-2 text-white/75 leading-6 text-md">
                At the start of each round, players choose a bet amount and the number of traps hidden on the board. Revealing a safe tile increases progress and potential profit, while uncovering a trap immediately ends the round. Players can cash out at any time to lock in their winnings based on their current progress.
              </p>
            </div>

            <div>
              <h3 className="text-white font-bold">Auto Cashout</h3>
              <p className="mt-2 text-white/75 leading-6 text-md">
                The auto cashout feature allows players to automatically secure a win after reaching a selected number of safe picks. This option is ideal for maintaining consistent strategies, managing risk, and reducing emotional decision-making during fast sessions.
              </p>
            </div>

            <div>
              <h3 className="text-white font-bold">Cataris Original</h3>
              <p className="mt-2 text-white/75 leading-6 text-md">
                As a Cataris original title, TREAT focuses on transparency, smooth performance, and player-driven outcomes. No hidden mechanics, no unnecessary complexity - just a refined grid game built for modern online play.
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
    </main >
  );
};

export default Treat;
