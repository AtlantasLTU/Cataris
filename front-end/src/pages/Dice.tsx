import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import BettingPanelDice from '../components/BettingPanelDice';
import sliderBase from '../assets/Dice/Rectangle 62.svg';
import sliderHandle from '../assets/Dice/btn.svg';
import './Dice.css';
import logo from "../assets/LOGO.svg";
import Login from "./Login";
import Register from "./Register";
import { updateWalletBalance } from "../api/auth";
import mice from '../assets/games/game-mice.png';
import { useAuthModal } from '../hooks/useAuthModal';
import { useIsAuthenticated } from '../hooks/useAuth';
import { useBalance } from '../hooks/useBalance';

const Dice = () => {
  const [chance, setChance] = useState(50);
  const [markerValue, setMarkerValue] = useState(50);
  const [finalValue, setFinalValue] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [outcome, setOutcome] = useState<'win' | 'loss' | null>(null);
  const [payoutAmount, setPayoutAmount] = useState<number | null>(null);
  const [betAmount, setBetAmount] = useState<number | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const { showLogin, showRegister, closeAuthModal } = useAuthModal("/games/dice");
  const isAuthenticated = useIsAuthenticated();
  const { balance: accountBalance } = useBalance();

  const HOUSE_EDGE = 0.05;
  const multiplier = useMemo(
    () => (chance > 0 ? Number(((100 / chance) * (1 - HOUSE_EDGE)).toFixed(2)) : Infinity),
    [chance]
  );
  const clampToRange = (value: number) => Math.min(100, Math.max(1, Math.round(value)));
  const markerPercent = useMemo(() => Math.min(99, Math.max(1, markerValue)), [markerValue]);

  useEffect(() => {
    if (!isRolling && finalValue === null) {
      setMarkerValue(clampToRange(chance));
    }
  }, [chance, finalValue, isRolling]);

  const handleRoll = (): Promise<'win' | 'loss'> => {
    if (isRolling) return Promise.resolve(outcome ?? 'loss');
    const wager = betAmount ?? 0;
    setGameStarted(true);
    setGameOver(false);
    setIsRolling(true);
    setOutcome(null);
    setPayoutAmount(null);
    setFinalValue(null);
    setMarkerValue(clampToRange(chance));
    console.log(accountBalance);
    const animationSteps = 14;
    let step = 0;

    return new Promise((resolve) => {
      const interval = window.setInterval(async () => {
        step += 1;
        const tempValue = clampToRange(Math.floor(Math.random() * 100) + 1);
        setMarkerValue(tempValue);
        if (step >= animationSteps) {
          window.clearInterval(interval);
          const roundedFinal = clampToRange(Math.floor(Math.random() * 100) + 1);
          const didWin = roundedFinal <= chance;

          setMarkerValue(roundedFinal);
          setFinalValue(roundedFinal);
          setOutcome(didWin ? 'win' : 'loss');

          const payout = didWin && wager > 0 ? Number((wager * multiplier).toFixed(2)) : 0;
          setPayoutAmount(payout);
          setIsRolling(false);
          setGameStarted(false);
          setGameOver(true);
          resolve(didWin ? 'win' : 'loss');
          if (didWin) {
            const finalValue = payout - betAmount!;
            await updateWalletBalance(finalValue.toString(), "win");
            console.log("WIN update wallet balance called");
            window.dispatchEvent(new Event("balance:refresh"));
          } else {
            await updateWalletBalance(wager.toFixed(2).toString(), "loss");
            console.log("LOSS update wallet balance called");
            window.dispatchEvent(new Event("balance:refresh"));
          }
        }
      }, 70);
    });
  };

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
      <div className="dice-page">
        <div className="flex w-screen min-h-screen justify-center items-start ">
          <div className="w-full flex justify-center">
            <BettingPanelDice betAmount={betAmount} setBetAmount={setBetAmount} startGame={handleRoll} gameOver={gameOver} gameStarted={gameStarted} multiplier={multiplier}>
              <div className="dice-panel">
                <section className="dice-slider">
                  <div
                    className="chance-visual"
                    style={{ '--chance-stop': `${chance}` } as CSSProperties}
                  >
                    <div
                      className="chance-track"
                      style={{ backgroundImage: `url(${sliderBase})` }}
                    >
                      <div
                        className="chance-track-inner"
                        style={{

                          '--chance-stop': `${chance}`,
                        } as CSSProperties}
                      >
                        <div className="chance-value">
                          <span>{chance}%</span>
                        </div>
                        <div className="chance-lane">
                          <div
                            className={`chance-marker ${isRolling ? 'rolling' : outcome ?? ''}`}
                            style={{ '--marker-position': `${markerPercent}` } as CSSProperties}
                          >
                            <span>{markerValue}%</span>
                          </div>
                        </div>
                        <div className={`chance-handle ${isRolling ? 'rolling' : ''}`}>
                          <img src={sliderHandle} alt="Chance handle" draggable={false} />
                        </div>
                      </div>
                    </div>
                    <input
                      type="range"
                      min={5}
                      max={95}
                      value={chance}
                      onChange={(event) => setChance(Number(event.target.value))}
                      onInput={(event) => setChance(Number(event.currentTarget.value))}
                      className="chance-input"
                      aria-label="Adjust win probability"
                    />
                  </div>
                  <div className="chance-labels">
                    <span>
                      Winning chances <strong>{chance}%</strong>
                    </span>
                  </div>
                </section>

                <section className="dice-result">
                  <div className="dice-actions">
                    <div className={`dice-roll-value ${outcome ?? ''}`}>
                      <div className="dice-roll-value-header">
                        <span>Roll landed at</span>
                        <span className="dice-roll-value-number">
                          {finalValue !== null
                            ? `${finalValue}%`
                            : isRolling
                              ? 'Rolling…'
                              : '—'}
                        </span>
                      </div>
                      <div className="dice-roll-value-outcome">
                        {isRolling
                          ? ''
                          : finalValue !== null
                            ? outcome === 'win'
                              ? `Win! Payout ${payoutAmount !== null ? payoutAmount : '—'}`
                              : 'Lost...'
                            : 'Set your odds and roll the dice.'}
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </BettingPanelDice>
          </div>
        </div>
      </div>
      {/* DESCRIPTION CARD UNDER GAME */}
      <section className="mt-8 w-full max-w-300 mx-auto px-4 pb-10">
        <div className="rounded-2xl bg-[#0f2f57]/80 shadow-xl border border-white/10 p-6">
          <div className="flex items-center gap-6">
            <h2 className="text-white text-2xl font-extrabold tracking-wide">
              MICE
            </h2>
            <span className="text-white/60 font-semibold text-sm">
              CATARIS ORIGINAL
            </span>
          </div>

          <div className="mt-4 text-white/90 font-semibold">Description</div>

          <div className="mt-3 flex gap-6 flex-col md:flex-row">
            {/* LEFT IMAGE */}
            <img
              src={mice}
              alt="Logo"
              className="w-35 md:w-35 h-auto rounded-xl shadow-lg"
            />

            {/* TEXT */}
            <p className="text-white/80 leading-8 text-lg">
              MICE is a precision-based dice game where probability is fully in the player’s hands. Adjust your winning chances, place your bet, and roll the dice to see where it lands. With a clean interface and real-time feedback, MICE delivers a fast and transparent experience built around calculated risk and strategic control.
            </p>
          </div>

          {/* SECTIONS */}
          <div className="mt-6 space-y-5">
            <div>
              <h3 className="text-white font-bold">GamePlay</h3>
              <p className="mt-2 text-white/75 leading-6 text-md">
                Players select a bet amount and set their desired winning chance using the probability slider. Higher chances offer safer outcomes with lower multipliers, while lower chances increase potential rewards at higher risk. Once the odds are set, roll the dice and compare the result against your chosen threshold.
              </p>
            </div>

            <div>
              <h3 className="text-white font-bold">Probability & Control</h3>
              <p className="mt-2 text-white/75 leading-6 text-md">
                The core of MICE lies in its adjustable odds system. Every change to the winning chance directly impacts the multiplier, allowing players to fine-tune their strategy in real time. This dynamic balance between risk and reward ensures that each roll is a deliberate decision rather than a random guess.
              </p>
            </div>

            <div>
              <h3 className="text-white font-bold">Cataris Original</h3>
              <p className="mt-2 text-white/75 leading-6 text-md">
                As a Cataris original title, MICE focuses on speed, clarity, and player agency. No hidden variables, no unnecessary complexity - just a refined dice game designed for modern online play.
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
};

export default Dice;