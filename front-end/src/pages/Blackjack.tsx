import { useState } from "react";
import "./Home.css";
import Login from "./Login";
import Register from "./Register";
import { useAuthModal } from "../hooks/useAuthModal";
import { combinations, type Card } from "../assets/CardDeck";
import Hand from "../components/Hand";
import BettingPanel from "../components/BettingPanelBlackJack";
import banner from "../assets/BANNER.svg";
import cardDeck from "../assets/DECK-CARDS.svg";
import logo from "../assets/LOGO.svg";
import { updateWalletBalance } from "../api/auth";
import meowJack from "../assets/games/game-meowjack.webp";
import { useIsAuthenticated } from "../hooks/useAuth";


export default function Home() {
  const { showLogin, showRegister, closeAuthModal } = useAuthModal("/games/meow-jack");
  const isAuthenticated = useIsAuthenticated();
  const [gameDeck, setGameDeck] = useState<Card[]>(combinations);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [betAmount, setBetAmount] = useState<number | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [result, setResult] = useState<{ type: string; message: string }>({
    type: "",
    message: "",
  });
  const [dealerRevealed, setDealerRevealed] = useState(false);

  const getCardValue = (card: Card) => {
    if (card.rank === "D" || card.rank === "J" || card.rank === "K") {
      return 10;
    } else if (card.rank === "A") {
      return 11;
    } else {
      return parseInt(card.rank, 10);
    }
  };

  const drawFrom = (deck: Card[]): [Card, Card[]] => {
    const i = Math.floor(Math.random() * deck.length);
    return [deck[i], deck.filter((_, index) => index !== i)];
  };

  const handleDeposit = async (outcome: "win" | "loss", amount: number) => {
  try {
    await updateWalletBalance(amount.toFixed(2), outcome);
    window.dispatchEvent(new Event("balance:refresh"));
  } catch (error) {
    console.error("Failed to update wallet balance: ", error);
  }
};

  const settle = (type: string, message: string, outcome?: "win" | "loss", payout?: string) => {
    const wager = betAmount;

    setResult({ type, message });
    setGameOver(true);
    setGameStarted(false);
    setDealerRevealed(true);
    if (payout) {
      void updateWalletBalance(payout, "win");
    } else if (outcome && wager !== null) {
      void handleDeposit(outcome, wager);
    }
    setBetAmount(null);
    window.dispatchEvent(new Event("balance:refresh"));
    setTimeout(() => window.dispatchEvent(new Event("balance:refresh")), 500);
  };

  const calculateHandValue = (hand: Card[]) => {
    let value = 0;
    let aceCount = 0;
    hand.forEach((card: Card) => {
      value += getCardValue(card);
      if (card.rank === "A") {
        aceCount += 1;
      }
    });
    while (value > 21 && aceCount > 0) {
      value -= 10;
      aceCount -= 1;
    }
    return value;
  };

  const dealCardToPlayer = () => {
    const [card, rest] = drawFrom(gameDeck);
    const newHand = [...playerHand, card];
    setPlayerHand(newHand);
    setGameDeck(rest);

    const value = calculateHandValue(newHand);
    if (value === 21 && betAmount !== null) {
      settle("player", "BlackJack! Player won", undefined, (betAmount * 1.5).toFixed(2));
    } else if (value > 21) {
      settle("dealer", "Dealer wins", "loss");
    }
  };

  const playerStand = () => {
    let deck = gameDeck;
    let hand = dealerHand;

    // dealer draws to 17, standard blackjack rule
    while (calculateHandValue(hand) < 17 && deck.length > 0) {
      const [card, rest] = drawFrom(deck);
      hand = [...hand, card];
      deck = rest;
    }

    setDealerHand(hand);
    setGameDeck(deck);

    const dValue = calculateHandValue(hand);
    const pValue = calculateHandValue(playerHand);

    if (dValue > 21 || pValue > dValue) {
      settle("player", "Player wins", "win");
    } else if (dValue === pValue) {
      settle("", "Draw");
    } else {
      settle("dealer", "Dealer Wins", "loss");
    }
  };

  const resetGame = () => {
    const deck = [...combinations];
    const draw = () => {
      const i = Math.floor(Math.random() * deck.length);
      return deck.splice(i, 1)[0];
    };

    const newPlayerHand = [draw(), draw()];
    const newDealerHand = [draw(), draw()];

    setPlayerHand(newPlayerHand);
    setDealerHand(newDealerHand);
    setGameDeck(deck);
    setResult({ type: "", message: "" });

    const playerNatural = calculateHandValue(newPlayerHand) === 21;
    const dealerNatural = calculateHandValue(newDealerHand) === 21;

    if (playerNatural || dealerNatural) {
      if (playerNatural && dealerNatural) {
        settle("", "Draw");
      } else if (playerNatural) {
        settle(
          "player",
          "BlackJack! Player won",
          undefined,
          betAmount !== null ? (betAmount * 1.5).toFixed(2) : undefined
        );
      } else {
        settle("dealer", "Dealer Wins", "loss");
      }
      return;
    }

    setGameOver(false);
    setGameStarted(true);
    setDealerRevealed(false);
  };

  const playerValue = calculateHandValue(playerHand);
  const dealerValue = calculateHandValue(dealerHand);

  const dealerVisibleValue = dealerRevealed
    ? dealerValue
    : calculateHandValue(dealerHand.slice(1));

  const playerStatus: "win" | "lose" | "neutral" | "tie" =
    gameOver
      ? result.type === "player"
        ? "win"
        : result.type === "dealer"
          ? "lose"
          : result.message === "Draw"
            ? "tie"
            : "neutral"
      : "neutral";

  // *** LOGIKA AKTYWNOŚCI PRZYCISKÓW ***
  const canHit = !gameOver;
  const canStand = !gameOver;

  return (
    <main className="home min-h-screen bg-linear-to-b from-[#102c56] via-[#0b3a6f] to-[#081c36]">
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
      <div className="flex w-screen min-h-screen justify-center items-start">
        <div className="w-full flex justify-center">
          <BettingPanel betAmount={betAmount} setBetAmount={setBetAmount} startGame={resetGame} gameOver={gameOver} gameStarted={gameStarted}>
            <div className="w-full h-full flex">
              <div className="w-full h-full sm:rounded-none md:rounded-tr-2xl relative flex justify-center">
                <img
                  src={cardDeck}
                  alt="Card deck"
                  className="absolute top-0 right-4 w-35 h-auto"
                />
                {gameOver}
                <div className="flex justify-center items-center">
                  <div className="flex flex-col justify-center items-center mt-6 mb-6">
                    <Hand
                      cards={dealerHand}
                      title="Dealer's Hand"
                      handValue={dealerVisibleValue}
                      hideFirstCard={!dealerRevealed}
                    />
                    <img
                      src={banner}
                      alt="Blackjack banner"
                      className="w-65 my-4 drop-shadow-lg"
                    />
                    <Hand
                      cards={playerHand}
                      title="Players's Hand"
                      handValue={playerValue}
                      status={playerStatus}
                    />
                    {/*Button panel blet*/}
                    <div className="flex justify-center mt-6">
                      <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-[#003366] border border-[#0a1a2f]">
                        {/* HIT */}
                        <button
                          className={`w-24 h-12 flex items-center justify-center text-white font-semibold rounded-lg shadow-md
      bg-green-500 ${!canHit ? "opacity-40 cursor-not-allowed" : ""}`}
                          onClick={dealCardToPlayer}
                          disabled={!canHit}
                        >
                          Hit
                        </button>
                        {/* STAND */}
                        <button
                          className={`w-24 h-12 flex items-center justify-center text-white font-semibold rounded-lg shadow-md
      bg-red-500 ${!canStand ? "opacity-40 cursor-not-allowed" : ""}`}
                          onClick={playerStand}
                          disabled={!canStand}
                        >
                          Stand
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </BettingPanel>
        </div>
      </div>
      {/* DESCRIPTION CARD UNDER GAME */}
      <section className="mt-8 w-full max-w-300 mx-auto px-4 pb-10">
        <div className="rounded-2xl bg-[#0f2f57]/80 shadow-xl border border-white/10 p-6">
          <div className="flex items-center gap-6">
            <h2 className="text-white text-2xl font-extrabold tracking-wide">
              MEOW-JACK
            </h2>
            <span className="text-white/60 font-semibold text-sm">
              CATARIS ORIGINAL
            </span>
          </div>

          <div className="mt-4 text-white/90 font-semibold">Description</div>

          <div className="mt-3 flex gap-6 flex-col md:flex-row">
            {/* LEFT IMAGE */}
            <img
              src={meowJack}
              alt="Logo"
              className="w-35 md:w-35 h-auto rounded-xl shadow-lg"
            />

            {/* TEXT */}
            <p className="text-white/80 leading-8 text-lg">
              MEOW-JACK is Cataris Casino’s modern take on the classic blackjack experience, blending familiar rules with a clean, intuitive interface and fast-paced gameplay. Designed for both casual players and seasoned strategists, the game delivers a smooth, responsive flow where every decision matters. Clear visuals, balanced odds, and instant feedback ensure an engaging experience from the first hand to the last card.
            </p>
          </div>

          {/* SECTIONS */}
          <div className="mt-6 space-y-5">
            <div>
              <h3 className="text-white font-bold">GamePlay</h3>
              <p className="mt-2 text-white/75 leading-6 text-md">
                The objective is simple: beat the dealer by reaching a hand value closer to 21 without exceeding it. Players can hit, stand, and strategically manage their moves based on probability and risk. MEOW-JACK follows traditional blackjack mechanics while maintaining a streamlined structure that keeps rounds efficient and immersive.
              </p>
            </div>

            <div>
              <h3 className="text-white font-bold">Strategy & Fairness</h3>
              <p className="mt-2 text-white/75 leading-6 text-md">
                MEOW-JACK is built around transparent mechanics and predictable rules, allowing players to rely on strategy rather than chance alone. Card values, dealer behavior, and payouts are clearly defined, giving players full control over their decisions. The game logic ensures fair outcomes while rewarding smart play and calculated risk.
              </p>
            </div>

            <div>
              <h3 className="text-white font-bold">Cataris Original</h3>
              <p className="mt-2 text-white/75 leading-6 text-md">
                As a Cataris original title, MEOW-JACK reflects our commitment to clean design, reliable performance, and player-first mechanics. No unnecessary complexity - just a refined blackjack experience built for modern online play.
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
