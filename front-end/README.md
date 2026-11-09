# Cataris front-end

React 19 + TypeScript + Vite + Tailwind 4. For setup and the full-stack overview, see the
[root README](../README.md).

## Layout

```
src/
  App.tsx              routes; every page except Home is lazy-loaded
  guestMode.ts         GUEST_MODE flag, read from VITE_GUEST_MODE at build time
  api/auth.ts          every call to the API (axios, base URL http://localhost:5054/api)
  api/guestWallet.ts   the localStorage wallet used in guest mode
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

## Guest mode

When `VITE_GUEST_MODE=true`, the app makes no API calls. This works through three switches, so the
game code itself doesn't change:

- `getToken()` always returns `'guest'`, so every `useIsAuthenticated()` check passes.
- `fetchWalletBalance` and `updateWalletBalance` in `api/auth.ts` use `api/guestWallet.ts` instead
  of axios.
- The Navbar, the wallet page, `AuthModal` and `useAuthModal` hide all account UI.

Anything new that reads the token should go through `getToken()` rather than reading
`localStorage` directly, or guest mode won't reach it. See the root README for how to run and deploy
guest mode.

## Changing the API address

The API address is hard-coded as `API_URL` at the top of `src/api/auth.ts`. If the API runs
somewhere other than `localhost:5054`, change it there. Also add the front-end's address to the CORS
policy in `API/Program.cs`.
