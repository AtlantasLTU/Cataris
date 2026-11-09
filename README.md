# Cataris

A cat-themed online casino that uses play money only. Originally a group project, forked from
[Cataris/Front-end-back-end](https://github.com/Cataris/Front-end-back-end).

- **`front-end/`**: React 19 + TypeScript + Vite + Tailwind. All the games run in the browser.
- **`API/`**: ASP.NET Core (.NET 10) Web API with ASP.NET Identity on MySQL. Handles accounts,
  JWT login and the wallet balance.

> The `static-guest-mode` branch is a version with no accounts and no backend, for hosting on Netlify.
> See that branch's README.

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
