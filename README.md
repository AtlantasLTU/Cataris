# Cataris

A cat-themed online casino that uses play money only. Originally a group project, forked from
[Cataris/Front-end-back-end](https://github.com/Cataris/Front-end-back-end).

- **`front-end/`**: React 19 + TypeScript + Vite + Tailwind. All the games run in the browser.
- **`API/`**: ASP.NET Core (.NET 10) Web API with ASP.NET Identity on MySQL. Handles accounts,
  JWT login and the wallet balance.

> **This is the `static-guest-mode` branch.** It adds a guest mode, so the front-end can be hosted
> on Netlify without the API or a database. See [Guest mode](#guest-mode-static-hosting) below. The
> `main` branch is the version with accounts.

## Games

| Game | Route | What it is |
|---|---|---|
| CAT | `/games/cat` | 3D road-crossing game (three.js). Each row you cross raises the multiplier. |
| Mice (Dice) | `/games/dice` | Roll under the chance you set (0-100). A lower chance pays a higher multiplier. |
| Treat | `/games/treat` | Mines-style grid. Uncover fish, avoid the bad ones, cash out whenever you want. |
| MeowJack | `/games/meow-jack` | Blackjack. |
| Plinko | `/games/plinko` | Drop balls through a peg board into multiplier slots. |
| Roulette | `/games/roulette` | Placeholder ("Coming soon!"). |

Other pages: home `/`, game list `/games`, promotions `/promotions`, about `/about`, and the account
and wallet page `/wallet`, which has a deposit of 50 coins with a 5-minute cooldown.

## Running locally

Requirements: Node 20.19+ (22 recommended), the .NET 10 SDK, and a MySQL server on `localhost:3306`.

### 1. API

```bash
cd API
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "server=localhost;port=3306;database=cataris;user=root;password=YOUR_MYSQL_PASSWORD"
dotnet user-secrets set "AppSettings:TokenKey" "any-long-random-dev-string-at-least-32-chars"
dotnet run
```

On first start the API creates the `cataris` database and seeds an admin account:
**`admin` / `Admin123!`** with a balance of 1000. It listens on <http://localhost:5054>, and Swagger
is at `/swagger`. Endpoints and known issues are described in [`API/README.md`](API/README.md).

### 2. Front-end

```bash
cd front-end
npm install
npm run dev
```

Open <http://localhost:3000>. The port matters, because the API's CORS policy only allows
`localhost:3000`. Register a new account (it starts with a balance of 0, so use Deposit on the
wallet page), or log in as `admin`.

## Front-end scripts

Run these from `front-end/`:

| Command | Does |
|---|---|
| `npm run dev` | Dev server with hot reload on port 3000 |
| `npm run build` | Type-check (`tsc -b`) and production build into `dist/` |
| `npm run preview` | Serve the built `dist/` |
| `npm run lint` | ESLint with type-aware rules, `--max-warnings 0` |

See [`front-end/README.md`](front-end/README.md) for how the front-end is laid out.

## Guest mode (static hosting)

A build made with `VITE_GUEST_MODE=true` doesn't need the API at all:

- There are no accounts. Every visitor counts as logged in. Login, register, logout and profile
  editing are hidden.
- Each visitor's balance is saved in their own browser's `localStorage` and starts at **1000**.
  Wagers follow the same rules as the API: the amount must be positive, and a loss can't take the
  balance below zero. Deposit on the wallet page still adds 50, with a 5-minute cooldown.
- All the games work unchanged, because they call the same wallet functions as before.

Because the balance is stored in the browser, clearing site data or switching device or browser
resets it to 1000. Anyone can also edit it in dev tools, which is fine for play money.

### Running guest mode locally

```bash
cd front-end
npm install
VITE_GUEST_MODE=true npm run dev
```

You don't need the API or MySQL.

### Deploying to Netlify

`front-end/netlify.toml` already sets `VITE_GUEST_MODE=true` and Node 22. It also adds a rule that
sends every path to `index.html`, so reloading a page like `/games/plinko` doesn't 404. In
Netlify's build settings:

| Setting | Value |
|---|---|
| Branch to deploy | `static-guest-mode` |
| Base directory | `front-end` |
| Build command | `npm run build` |
| Publish directory | `front-end/dist` |

The base directory is what makes Netlify read `front-end/netlify.toml`. If the deployed site shows
Login/Register buttons instead of a $1000.00 balance, guest mode is off. Add `VITE_GUEST_MODE` =
`true` under *Site configuration → Environment variables* and deploy again.
