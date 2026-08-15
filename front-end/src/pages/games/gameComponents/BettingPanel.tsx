import { useEffect, type ReactNode } from "react";
import { startRun } from "../catGame/catGameComponents/runState";
import { useIsAuthenticated } from "../../../hooks/useAuth";
import { useBalance } from "../../../hooks/useBalance";

interface BettingPanelProps {
  children?: ReactNode;
  betAmount: number | null;
  setBetAmount: (amount: number | null) => void;
  startGame: () => void;
  gameOver: boolean;
  gameStarted: boolean;
}


export default function BettingPanel({ children, betAmount, setBetAmount, startGame, gameOver, gameStarted}: BettingPanelProps) {
  const isAuthenticated = useIsAuthenticated();
  const { balance: accountBalance } = useBalance();

  const isGoButtonActive = betAmount !== null && betAmount > 0 && !gameStarted && betAmount < (accountBalance ?? 0)/3-1;

  const handleGoButtonClick = () => {
    if (gameOver || isAuthenticated) {
      startGame();
      startRun(betAmount ?? 0);
    }
  };

  useEffect(() => {
    if (gameOver) {
      setBetAmount(null); // Optionally reset bet amount
      
    }
  } , [gameOver, setBetAmount]);

  return (
    <div className="w-[95%] md:ml-0 xl:w-6xl relative mt-20 md:mt-0 flex flex-col drop-shadow-2xl ">
      <div className="grid grid-cols-1 grid-rows-auto md:grid-cols-[16rem_1fr] grid-rows-[35rem_1fr]">
        {/* LEFT PANEL */}
        <div className="w-full md:w-64 h-75 md:h-auto mt-65 md:mt-0 bg-[#1c5ec3] text-white rounded-t-4xl md:rounded-tl-4xl md:rounded-tr-none p-4 space-y-3 shrink-0 border-l border-t border-white/10">
          {/* Toggle Manual / Auto */}
{/*           <div className="flex bg-[#102c56] rounded-4xl overflow-hidden h-12 w-full items-center pl-1 pr-1">
            <button
              className={`flex-1 rounded-4xl h-[82%] ${
                mode === "manual" ? "bg-[#184fa2]" : ""
              }`}
              onClick={() => setMode("manual")}
            >
              Manual
            </button>
            <button
              className={`flex-1 rounded-4xl h-[82%] ${
                mode === "auto" ? "bg-[#184fa2]" : ""
              }`}
              onClick={() => setMode("auto")}
            >
              Auto
            </button>
          </div>   */}

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
                    "0", "1", "2", "3", "4", "5", "6", "7", "8", "9",
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

          {/* Go */}
          <div className="flex flex-row gap-2 mt-3">

            <button className={`flex-1 py-2 rounded-lg text-black shadow-md font-semibold transition duration-300 ease-in-out ${
                isGoButtonActive
                  ? "bg-[#2cbf2a] hover:bg-[#33de30]" // Active: Brighter on hover
                  : "bg-[#2cbf2a] opacity-50 cursor-not-allowed" // Disabled: Darker, not clickable
              }`}
              onClick={handleGoButtonClick}
              disabled={!isGoButtonActive}>
              Go
            </button>
          </div>

          {/* Profit */}
          <div className="mt-3">
            <p className="text-xs text-white">Total profit (1.00x)</p>
            <input
              type="number"
              readOnly
              value={0.0}
              className="w-full bg-[#2f6ed0] p-2 rounded-lg text-left text-white mt-1 shadow-md"
            />
          </div>
        </div>

        {/* RIGHT PANEL – STÓŁ */}
        <div className={`bg-[#184890] relative w-full md:rounded-tr-4xl flex items-center justify-center border-r border-t border-white/10 ${!gameStarted ? 'pointer-events-none' : ''}`}>
          {!gameStarted && (
            <div
              className="absolute w-full h-full flex items-center justify-center text-2xl font-bold text-white md:rounded-tr-4xl bg-[#184890] z-20 pointer-none"
            >
              <div>Please place your bet to start the game.</div>
            </div>
          )}
          {children}
        </div>
        {/* BOTTOM PANEL */}
        <div className="w-full bg-[#10305f] h-24 rounded-b-4xl flex items-center justify-center text-gray-300 text-sm relative md:col-span-2 border-b border-l border-r border-white/10">
          Cataris
        </div>
      </div>

      
    </div>
  );
}
