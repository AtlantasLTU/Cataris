import { useEffect, useState, type ReactNode } from "react";
import { fetchWalletBalance } from "../api/auth";

interface BettingPanelProps {
  children?: ReactNode;
  betAmount: number | null;
  setBetAmount: (amount: number | null) => void;
  startGame: () => void;
  gameOver: boolean;
  gameStarted: boolean;
  gameActive: boolean;
  onCashOut: () => void;
  autoCashout: number;
  setAutoCashout: (value: number) => void;
  mineCount: number;
  setMineCount: (value: number) => void;
  profit: number;
  multiplier: number;
}

export default function TreatBettingPanel({ children, betAmount, setBetAmount, startGame, gameOver: _gameOver, gameStarted, gameActive, onCashOut, autoCashout, setAutoCashout, mineCount, setMineCount, profit, multiplier }: BettingPanelProps) {
  const [balance, setBalance] = useState<number>(0);
  const [mode, setMode] = useState("manual");
  const [autoCashoutInput, setAutoCashoutInput] = useState(() => autoCashout.toString());

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      const getBalance = async () => {
        const result = await fetchWalletBalance();
        if ('balance' in result) {
          setBalance(result.balance);
          console.log('Account Balance in TreatBettingPanel:', result.balance);
        } else {
          console.error("Failed to fetch wallet balance:", result.message);
        }
      };
      const onRefresh = () => void getBalance();

      onRefresh();
      window.addEventListener("balance:refresh", onRefresh);
      return () => window.removeEventListener("balance:refresh", onRefresh);
    }
  }, []);

  const isGoButtonActive = betAmount !== null && betAmount > 0 && betAmount <= balance;

  const handleGoButtonClick = () => {
    if (gameActive) {
      onCashOut();
      return;
    }

    if (!gameStarted && isGoButtonActive) {
      startGame();
    }
  };
  useEffect(() => {
    if (_gameOver) {
      setBetAmount(null);
    }
  }, [_gameOver, setBetAmount]);
  return (
    <div className="w-[95%] sm:w-[95%] xl:w-6xl max-w-7xl mx-auto relative mt-30 flex flex-col drop-shadow-2xl ">
      <div className="flex flex-col md:flex-row h-140">
        {/* LEFT PANEL */}
        <div className="w-full md:w-64 bg-[#1c5ec3] text-white rounded-t-4xl md:rounded-tl-4xl md:rounded-tr-none p-4 space-y-3 shrink-0">
          {/* Toggle Manual / Auto */}
          <div className="flex bg-[#102c56] rounded-4xl overflow-hidden h-12 w-full items-center pl-1 pr-1">
            <button
              className={`flex-1 rounded-4xl h-[82%] ${mode === "manual" ? "bg-[#184fa2]" : ""
                }`}
              onClick={() => setMode("manual")}
            >
              Manual
            </button>
            <button
              className={`flex-1 rounded-4xl h-[82%] ${mode === "auto" ? "bg-[#184fa2]" : ""
                }`}
              onClick={() => setMode("auto")}
            >
              Auto
            </button>
          </div>

          {/* Bet Amount */}
          <div>
            <label className="text-sm text-gray-200">Bet Amount</label>
            <div className="flex mt-1 p-0.5 bg-[#184890] rounded-md">
              <input
                type="number"
                value={betAmount ?? ""}
                onChange={(e) =>
                  setBetAmount(
                    e.target.value === "" ? null : Number(e.target.value)
                  )
                }
                className="w-full bg-[#102c56] p-2 rounded-l-sm text-left focus:outline-none"
                disabled={gameStarted}
                placeholder=""
                onKeyDown={(e) => {
                  const allowedKeys = [
                    "Backspace",
                    "Delete",
                    "ArrowLeft",
                    "ArrowRight",
                    "Tab",
                    "Enter",
                    "Home",
                    "End",
                    ".", // allow decimals
                  ];
                  if (!/[0-9]/.test(e.key) && !allowedKeys.includes(e.key)) {
                    e.preventDefault();
                  }
                }}
              />
              <div className="flex items-center">
                <button
                  className="bg-[#184890] px-3"
                  onClick={() =>
                    setBetAmount(
                      betAmount === null || betAmount === 0
                        ? 0
                        : betAmount / 2
                    )
                  }
                >
                  ½
                </button>
                <div className="border-l-2 h-[67%] border-l-[#102c56]" />
                <button
                  className="bg-[#184890] px-3 rounded-r-sm"
                  onClick={() =>
                    setBetAmount(betAmount === null ? 0 : betAmount * 2)
                  }
                >
                  2x
                </button>
              </div>
            </div>
          </div>

          {/* Bet / Go / Cash Out */}
          <div className="flex flex-row gap-2 mt-3">

            <button className={`flex-1 py-2 rounded-lg text-black shadow-md font-semibold transition duration-300 ease-in-out ${gameActive
                ? "bg-[#ffb347] hover:bg-[#ffca7a]"
                : isGoButtonActive && !gameStarted
                  ? "bg-[#2cbf2a] hover:bg-[#33de30]"
                  : "bg-[#2cbf2a] opacity-50 cursor-not-allowed"
              }`}
              onClick={handleGoButtonClick}
              disabled={gameActive ? false : !isGoButtonActive || gameStarted}>
              {gameActive ? 'Cash out' : 'Go'}
            </button>
          </div>

          {/* Mines selector */}
          <div className="mt-3">
            <p className="text-xs text-white">Mines</p>
            <select
              value={mineCount}
              onChange={(e) => setMineCount(Number(e.target.value))}
              className="w-full bg-[#2f6ed0] p-2 rounded-lg text-left text-white mt-1 shadow-md"
            >
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
            </select>
          </div>

          {/* Auto cashout */}
          <div className="mt-3">
            <p className="text-xs text-white">Auto cashout (safe picks)</p>
            <input
              type="number"
              min={0}
              max={25}
              value={autoCashoutInput}
              onChange={(e) => {
                const next = e.target.value;
                setAutoCashoutInput(next);
                if (next === "") {
                  setAutoCashout(0);
                  return;
                }
                const parsed = Number(next);
                if (!Number.isNaN(parsed)) {
                  setAutoCashout(Math.max(0, Math.min(parsed, 25)));
                }
              }}
              className="w-full bg-[#2f6ed0] p-2 rounded-lg text-left text-white mt-1 shadow-md"
            />
            <small className="text-[11px] text-gray-200">Set to 0 to disable automatic cashout.</small>
          </div>

          {/* Profit */}
          <div className="mt-3">
            <p className="text-xs text-white">Total profit ({Number.isFinite(multiplier) ? multiplier.toFixed(2) : "—"}x)</p>
            <input
              type="number"
              readOnly
              value={Number.isFinite(profit) ? profit : 0}
              className="w-full bg-[#2f6ed0] p-2 rounded-lg text-left text-white mt-1 shadow-md"
            />
          </div>
        </div>

        {/* RIGHT PANEL – STÓŁ */}
        <div className="bg-[#184890] relative w-full md:rounded-tr-4xl flex items-center justify-center">
          {children}
        </div>
      </div>

      {/* BOTTOM PANEL */}
      <div className="w-full bg-[#10305f] h-24 rounded-b-4xl flex items-center justify-center text-gray-300 text-sm relative mt-82 md:mt-0">
        Cataris
      </div>
    </div>
  );
}
