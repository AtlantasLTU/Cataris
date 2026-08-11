# Cataris API

ASP.NET Core API backing the `front-end/` app. Replaces the prebuilt `mysql/server.exe`.

Uses ASP.NET Identity (users, password hashing, roles) on MySQL via Pomelo + EF Core.

## Setup

Config lives in [user secrets](https://learn.microsoft.com/aspnet/core/security/app-secrets), not
`appsettings.json`, so the MySQL password never lands in git. Run both from this directory:

```bash
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "server=localhost;port=3306;database=cataris;user=root;password=YOUR_MYSQL_PASSWORD"
dotnet user-secrets set "AppSettings:TokenKey" "any-long-random-dev-string-at-least-32-chars"
```

Then:

```bash
dotnet run
```

On first start the app creates the `cataris` schema, applies migrations, seeds the `Admin`/`User`
roles, and creates an admin account: **`admin` / `Admin123!`** (balance 1000).

Listens on <http://localhost:5054>. Swagger UI at <http://localhost:5054/swagger>.

## Endpoints

All under `/api`, matching what `front-end/src/api/auth.ts` calls.

| Method | Route | Auth | Body / Returns |
|---|---|---|---|
| POST | `/api/user/register` | – | `{username, email, password, confirmPassword}` → 201 |
| POST | `/api/user/login` | – | `{username, password}` → bare JWT string |
| GET | `/api/user/user_info` | Bearer | → `{username, email, balance}` |
| POST | `/api/user/update_user` | Bearer | `{username?, email?}` → `{message}` |
| GET | `/api/wallet/balance` | Bearer | → balance (number) |
| POST | `/api/wallet/wager` | Bearer | `{wager, outcome:"win"\|"loss"}` → `{balance}` |

Tokens are HMAC-SHA256, valid 60 minutes.

## Known issue: the wager endpoint is client-authoritative

`POST /api/wallet/wager` takes the outcome *from the client*. Anyone with a token can run

```bash
curl -X POST http://localhost:5054/api/wallet/wager \
  -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \
  -d '{"wager":"1000000","outcome":"win"}'
```

and credit themselves a million. The endpoint validates the amount and blocks overdrafts, but it
cannot tell a real win from a fabricated one — the browser is the only witness.

Fixing it properly means moving the game server-side: the client posts a *stake*, the server runs
the drop and returns the result. That changes the front-end contract, so it was left as-is rather
than silently half-fixed.
