
import './Games.css';
import Login from "./Login";
import Register from "./Register";
import { Link } from "react-router-dom";

// Import game images
import gameCat from '../assets/games/game-cat.webp';
import gameMice from '../assets/games/game-mice.webp';
import gameTreat from '../assets/games/game-treat.webp';
import gameMeowJack from '../assets/games/game-meowjack.webp';
import gamePlinko from '../assets/games/Plinko.webp';
import gameRoulette from '../assets/games/Roulette.webp';
import { useAuthModal } from '../hooks/useAuthModal';


interface Game {
  id: number;
  image: string;
  link: string;
}

const games: Game[] = [
    {
      id: 1,
      image: gameCat,
      link: "/games/cat"
    },
    {
      id: 2,
      image: gameMice,
      link: "/games/dice"
    },
    {
      id: 3,
      image: gameTreat,
      link: "/games/treat"
    },
    {
      id: 4,
      image: gameMeowJack,
      link: "/games/meow-jack"
    },
    {
      id: 5,
      image: gamePlinko,
      link: "/games/plinko"
    },
    {
      id: 6,
      image: gameRoulette,
      link: "/games/roulette"
    }
  ];



export default function Games() {
  const { showLogin, showRegister, closeAuthModal } = useAuthModal("/games");
  return (
    <div className="games-container pt-5">
      <div className="games-header">
        <h1 className="games-title pl-100">CATARIS ORIGINAL GAMES</h1>
      </div>

      <div className="games-grid">
        {games.map((game) => (
            <Link to={game.link} key={game.id} className="game-card">
            <div className="game-image-wrapper">
                <img src={game.image}className="game-image" />
            </div>
            </Link>
        ))}
        </div>
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
    </div>
    
  );
};