import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import "./Home.css";
import Login from "./Login";
import Register from "./Register";


// Paveiksliukai (keisk kelius/pavadinimus pagal save)
import hero from "../assets/home/hero.svg";
import gameCat from '../assets/games/game-cat.png';
import gameMice from '../assets/games/game-mice.png';
import gameTreat from '../assets/games/game-treat.png';
import gameMeowJack from '../assets/games/game-meowjack.png';
import sponsorLogo from '../assets/LOGO.svg'; // Using existing logo as sponsor logo


export default function Home() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  useEffect(() => {
    const auth = searchParams.get("auth");
    setShowLogin(auth === "login");
    setShowRegister(auth === "register");
  }, [searchParams]);
  const closeAuthModal = () => {
    setShowLogin(false);
    setShowRegister(false);
    navigate("/", { replace: true }); // clears ?auth=...
  };
  return (
    <main className="home">

      {/* HERO */}
      <Link to="/games" className="hero hero--clickable" aria-label="Play now – go to Games">
        <img src={hero} alt="" />
      </Link>

      {/* FEATURED GAMES */}
      <section className="featured">
        <div className="featured__hdr">
          <h2>FEATURED GAMES</h2>
        </div>

        <div className="games grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          <Link to="/games/cat" className="gamecard" aria-label="Play CAT">
            <img src={gameCat} alt="CAT game" className="w-full h-auto" />
          </Link>

          <Link to="/games/dice" className="gamecard" aria-label="Play MICE">
            <img src={gameMice} alt="MICE game" />
          </Link>

          <Link to="/games/treat" className="gamecard" aria-label="Play TREAT">
            <img src={gameTreat} alt="TREAT game" className="w-full h-auto" />
          </Link>

          <Link to="/games/meow-jack" className="gamecard" aria-label="Play MEOW-JACK">
            <img src={gameMeowJack} alt="MEOW-JACK game" className="w-full h-auto" />
          </Link>
        </div>
      </section>

      {/* SPONSOR SECTION */}
      <section className="sponsor">
        <div className="sponsor__container">
          <h3 className="sponsor__title">Credits:</h3>
          <button
            className="sponsor__button"
            onClick={() => navigate('/about')}
            aria-label="Visit our sponsor"
          >
            <img src={sponsorLogo} alt="Sponsor Logo" className="sponsor__logo" />
            <span className="sponsor__text">About Us</span>
          </button>
        </div>
      </section>
      {/* SUPPORT WARNING */}
      <section
        role="alert"
        aria-live="polite"
        className="mx-auto mt-6 max-w-5xl rounded-2xl border border-amber-400/25 bg-amber-400/10 px-4 py-3 text-amber-50 backdrop-blur"
      >
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="mt-0.5 inline-flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-amber-400/15 ring-1 ring-amber-400/25">
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5 text-amber-200"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v4m0 4h.01M10.29 3.86l-8.4 14.52A2 2 0 003.62 21h16.76a2 2 0 001.73-2.62l-8.4-14.52a2 2 0 00-3.42 0z"
              />
            </svg>
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <p className="text-sm font-medium text-amber-50">
                Having issues with this website?
              </p>
            </div>

            <p className="mt-1 text-sm leading-relaxed text-amber-100/90">
              Please contact{" "}
              <a
                href="mailto:atlantasalisauskas2014@gmail.com"
                className="font-semibold text-amber-100 underline decoration-amber-300/40 underline-offset-4 hover:text-amber-50 hover:decoration-amber-200/70"
              >
                atlantasalisauskas2014@gmail.com
              </a>{" "}
              or{" "}
              <a
                href="https://www.linkedin.com/in/atlantas-ali%C5%A1auskas/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-amber-50 underline decoration-amber-300/40 underline-offset-4 hover:text-white hover:decoration-amber-200/70"
              >
                Atlantas Ališauskas on LinkedIn
              </a>{" "}
               to solve the problem.
            </p>
          </div>
        </div>
      </section>

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
