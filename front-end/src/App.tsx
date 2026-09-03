import { lazy, Suspense } from 'react'
import './App.css'
import { Route, Routes, BrowserRouter } from 'react-router-dom'
import AppLayout from "./layout/AppLayout";
import Home from './pages/Home'

// Home is the landing route, so it stays in the initial bundle. Every other page
// is split out - the games in particular drag in three.js and their own canvas
// code, which nobody needs just to look at the home page.
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const BlackJack = lazy(() => import('./pages/Blackjack'));
const Games = lazy(() => import('./pages/Games'));
const Dice = lazy(() => import('./pages/Dice'));
const Promotions = lazy(() => import('./pages/promotion'));
const Wallet = lazy(() => import('./pages/wallet'));
const Cat = lazy(() => import('./pages/games/catGame/Cat'));
const PlinkoGame = lazy(() => import('./pages/Plinko'));
const Treat = lazy(() => import('./pages/games/treatGame/Treat'));
const Roulette = lazy(() => import('./pages/Roulette'));
const Sponsor = lazy(() => import('./pages/Sponsor'));

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="route-fallback" role="status" aria-live="polite">Loading…</div>}>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/games" element={<Games />} />
            <Route path="/games/dice" element={<Dice />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/games/meow-jack" element={<BlackJack />} />
            <Route path="/promotions" element={<Promotions />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/games/cat" element={<Cat/>}/>
            <Route path="/games/plinko" element={<PlinkoGame/>}/>
            <Route path="/games/treat" element={<Treat />} />
            <Route path="/games/roulette" element={<Roulette/>} />
            <Route path="/about" element={<Sponsor />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;
