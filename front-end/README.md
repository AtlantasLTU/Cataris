# Cataris front-end

React 19 + TypeScript + Vite + Tailwind 4. For setup and the full-stack overview, see the
[root README](../README.md).

## Layout

```
src/
  App.tsx              routes; every page except Home is lazy-loaded
  api/auth.ts          every call to the API (axios, base URL http://localhost:5054/api)
  auth/tokenStore.ts   the JWT in localStorage, exposed to useSyncExternalStore
  hooks/
    useAuth.ts         useToken / useIsAuthenticated
    useBalance.ts      wallet balance; refreshBalance() makes every mounted copy re-fetch
    useAuthModal.ts    login/register modal state, taken from the ?auth= URL parameter
  layout/AppLayout.tsx Navbar + page + AuthModal
  components/          Navbar, AuthModal, the betting panels for each game, cards
  pages/               one file per page or game
    games/catGame/     CAT (three.js scene, vehicles, hit detection, run state)
    games/treatGame/   Treat
    plinko/            Plinko physics and board constants
```

## How the games handle money

The games are played entirely in the browser. When a round ends, the game reports the result
through `updateWalletBalance(amount, "win" | "loss")` in `api/auth.ts`. That call posts to
`/api/wallet/wager`, and then `refreshBalance()` updates the balance shown in the navbar and
betting panels.

The server trusts whatever result the client sends. See "Known issue" in
[`API/README.md`](../API/README.md).

## Changing the API address

The API address is hard-coded as `API_URL` at the top of `src/api/auth.ts`. If the API runs
somewhere other than `localhost:5054`, change it there. Also add the front-end's address to the CORS
policy in `API/Program.cs`.
