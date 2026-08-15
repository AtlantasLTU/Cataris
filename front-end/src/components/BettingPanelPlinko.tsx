import { useEffect, useState, type ReactNode } from "react";
import { useIsAuthenticated } from "../hooks/useAuth";
import { useBalance } from "../hooks/useBalance";

interface BettingPanelProps {
  children?: ReactNode;
  betAmount: number | null;
  setBetAmount: (amount: number | null) => void;
  startGame: () => void;
  dropBall: () => void;
  gameOver: boolean;
}


export default function BettingPanel({ children, betAmount, setBetAmount, startGame, dropBall, gameOver }: BettingPanelProps) {
  const isAuthenticated = useIsAuthenticated();
  const { balance: accountBalance } = useBalance();
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [mode, setMode] = useState("manual");

  const isGoButtonActive = betAmount !== null && betAmount > 0 && !gameOver && betAmount <= (accountBalance ?? 0);
  const hasEnoughBalance =
    isAuthenticated &&
    betAmount !== null &&
    betAmount > 0 &&
    betAmount <= (accountBalance ?? 0);

  const handleGoButtonClick = () => {
    if(!hasEnoughBalance || gameOver || isButtonDisabled) return;

    setIsButtonDisabled(true);
    setTimeout(() => setIsButtonDisabled(false), 300);

    startGame();
    // Align ball drop with balance refresh timing
    setTimeout(() => dropBall(), 300);
  };

  useEffect(() => {
    if (gameOver) {
      //setBetPlaced(true); // Reset bet placed status when game is over
      setBetAmount(null); // Optionally reset bet amount

    }
  }, [gameOver, setBetAmount]);

  const shouldShowOverlay = betAmount === null;
  

  return (
    <div className="w-full max-w-full relative mt-5 md:mt-10 flex flex-col drop-shadow-2xl">
      <div className="flex flex-col md:flex-row h-auto">
        {/* LEFT PANEL */}
        <div className="w-full md:w-56 lg:w-64 bg-[#1c5ec3] text-white rounded-t-4xl md:rounded-tl-4xl md:rounded-tr-none p-3 md:p-4 space-y-3 shrink-0">
          {/* Toggle Manual / Auto */}
          <div className="flex bg-[#102c56] rounded-4xl overflow-hidden h-10 md:h-12 w-full items-center pl-1 pr-1">
            <button
              className={`flex-1 rounded-4xl h-[82%] text-sm md:text-base cursor-pointer transition-colors ${mode === "manual" ? "bg-[#184fa2]" : ""
                }`}
              onClick={() => setMode("manual")}
            >
              Manual
            </button>
            <button
              className={`flex-1 rounded-4xl h-[82%] text-sm md:text-base cursor-pointer transition-colors ${mode === "auto" ? "bg-[#184fa2]" : ""
                }`}
              onClick={() => setMode("auto")}
            >
              Auto
            </button>
          </div>

          {/* Bet Amount */}
          <div>
            <label className="text-xs md:text-sm text-gray-200">Bet Amount</label>
            <div className="flex mt-1 p-0.5 bg-[#184890] rounded-md">
              <input
                type="number"
                value={betAmount ?? ""}
                onChange={(e) =>
                  setBetAmount(
                    e.target.value === "" ? null : Number(e.target.value)
                  )
                }
                className="w-full bg-[#102c56] p-2 rounded-l-sm text-left text-sm md:text-base focus:outline-none cursor-text"
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
                  className="bg-[#184890] px-2 md:px-3 text-sm md:text-base cursor-pointer hover:bg-[#1a5299] transition-colors"
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
                  className="bg-[#184890] px-2 md:px-3 rounded-r-sm text-sm md:text-base cursor-pointer hover:bg-[#1a5299] transition-colors"
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

            <button className={`flex-1 py-2 rounded-lg bg-[#2cbf2a] text-black shadow-md font-semibold text-sm md:text-base transition duration-300 ease-in-out ${isGoButtonActive && !gameOver && !isButtonDisabled
              ? "bg-[#2cbf2a] hover:bg-[#33de30] cursor-pointer" // Active: Brighter on hover
              : "bg-[#2cbf2a] opacity-50 cursor-not-allowed" // Disabled: Darker, not clickable
              }`}
              onClick={handleGoButtonClick}
              disabled={!isGoButtonActive || gameOver || isButtonDisabled}>
              Go
            </button>
          </div>
        </div>
        
        {/* RIGHT PANEL – CANVAS */}
        <div className={`bg-[#184890] relative flex-1 min-w-0 md:rounded-tr-4xl flex items-center justify-center min-h-96 md:min-h-full ${shouldShowOverlay ? 'pointer-events-none' : ''}`}>
          {shouldShowOverlay && (
            <div
              className="absolute w-full inset-0 flex items-center justify-center text-lg md:text-2xl font-bold text-white md:rounded-tr-4xl bg-[#184890] px-4 text-center"
              style={{ pointerEvents: "auto", zIndex: 10 }}
            >
              <div>Please place your bet to start the game.</div>
            </div>
          )}
          {children}
        </div>
      </div>

      {/* BOTTOM PANEL */}
      <div className="w-full bg-[#10305f] h-20 md:h-24 rounded-b-4xl flex items-center justify-center text-gray-300 text-xs md:text-sm relative md:mt-0">
        Cataris
      </div>
    </div>
  );
}
