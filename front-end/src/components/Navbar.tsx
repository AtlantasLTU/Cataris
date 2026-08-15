import { useState } from "react";
import { NavLink, Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import "./Navbar.css";
import icHome from "../assets/house.png";
import icGame from "../assets/game.png";
import icTrophy from "../assets/trophy.png";
import icWallet from "../assets/wallet.png";
import icSettings from "../assets/settings.png";
import icAccount from "../assets/account.png";
import Cataris_coin from "../assets/Cataris_coin.svg";
import { useIsAuthenticated } from "../hooks/useAuth";
import { useBalance } from "../hooks/useBalance";
import { clearToken } from "../auth/tokenStore";


export default function Navbar() {
  const [open, setOpen] = useState(false);
  const isAuthenticated = useIsAuthenticated();
  const { balance: accountBalance } = useBalance();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearToken();
    void navigate("/");
  };

  const authLink = (value: "login" | "register") => {
    const params = new URLSearchParams(location.search);
    params.set("auth", value);
    return `${location.pathname}?${params.toString()}`;
  };

  return (
    <nav className="nvb">
      <div className="nvb__inner">
        {/* Left */}
        <div className="nvb__left">
          <button
            className={`nvb__burger ${open ? "is-open" : ""}`}
            aria-label="Toggle menu"
            onClick={() => setOpen(v => !v)}
          >
            <span />
          </button>

          <Link to="/" className="nvb__brand">
            <img src={logo} alt="Cataris logo" />
          </Link>
        </div>

        {/* Center */}
        <ul className="nvb__links">
          <li><NavLink to="/" end className="navlink">HOME</NavLink></li>
          <li><NavLink to="/games" className="navlink">GAMES</NavLink></li>
          <li><NavLink to="/promotions" className="navlink">PROMOTIONS</NavLink></li>
        </ul>

        {/* Right */}
        {!isAuthenticated ?(
          <>
          </>
        ) : (
          <>
          <label className="flex items-center space-x-2 bg-blue-950 text-white w-auto font-bold px-3 py-1.5 rounded-lg shadow-md hover:shadow-lg">
          <span className="flex-1 text-sm">
            {accountBalance !== null ? `$${accountBalance.toFixed(2)}` : 'Loading...'}
          </span>
          <img src={Cataris_coin} alt="Coin" className="h-6 w-6" />
        </label>
          </>
        )}
        {/* Example for Account and Logout (Responsive) */}
        <div className="nvb__actions">
          {!isAuthenticated ? (
            <>
              <Link to={authLink("login")} className="btn btn--ghost hidden sm:block">LOGIN</Link>
              <Link to={authLink("register")} className="btn btn--primary hidden sm:block">REGISTER</Link>
            </>
          ) : (
            <>
              {/* Balance always visible */}
              <Link to="/wallet" className="btn btn--primary hidden sm:block">
                ACCOUNT
              </Link>
              <button onClick={handleLogout} className="btn btn--ghost ml-4 hidden sm:block">
                LOGOUT
              </button>
            </>
          )}
        </div>
      </div>

      {/* Side menu (only visible when open) */}
      <aside className={`sideMenu ${open ? "show" : ""}`}>
        <div className="sideMenu__group">
          <NavLink to="/" end className="slink" onClick={() => setOpen(false)}>
            <i className="sicon"><img src={icHome} alt="Home" /></i> HOME
          </NavLink>
          <NavLink to="/games" className="slink" onClick={() => setOpen(false)}>
            <i className="sicon"><img src={icGame} alt="Games" /></i> GAMES
          </NavLink>
          <NavLink to="/promotions" className="slink" onClick={() => setOpen(false)}>
            <i className="sicon"><img src={icTrophy} alt="Promotions" /></i> PROMOTIONS
          </NavLink>
        </div>

        <div className="sideMenu__divider" />

        <div className="sideMenu__group">
          <NavLink to="/wallet" className="slink btnlike" onClick={() => setOpen(false)}>
            <i className="sicon"><img src={icWallet} alt="Wallet" /></i> WALLET
          </NavLink>
          <button className="slink btnlike" onClick={() => setOpen(false)}>
            <i className="sicon"><img src={icSettings} alt="Settings" /></i> SETTINGS
          </button>
          <button className="slink btnlike" onClick={() => setOpen(false)}>
            <i className="sicon"><img src={icAccount} alt="Account" /></i> ACCOUNT
          </button>
          <div className="sideMenu__divider" />
          {!isAuthenticated ? (
            <>
              <NavLink to="/?auth=login" className="slink btnlike bg-white! text-black! hover:bg-gray-400! p-2 rounded" onClick={() => setOpen(false)}>
                LOGIN
              </NavLink>
              <NavLink to="/?auth=register" className="slink btnlike bg-blue-500! text-white! hover:bg-blue-700! p-2 rounded" onClick={() => setOpen(false)}>
                REGISTER
              </NavLink>
            </>
          ) : (
            <>
              <button className="slink btnlike bg-red-500! text-white hover:bg-red-700! p-2 rounded" onClick={handleLogout}>
                LOGOUT
              </button>
            </>
          )}
        </div>
      </aside>

      {open && <div className="sideMenu__backdrop" onClick={() => setOpen(false)} />}
    </nav>
  );
}
