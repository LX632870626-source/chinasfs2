# Local Development

## Install

Run from the workspace root:

```powershell
pnpm install
```

## Database

The local Prisma environment file is `apps/api/prisma/.env`, and it provides:

```dotenv
DATABASE_URL="file:./dev.db"
```

Run these commands from `apps/api`:

```powershell
pnpm db:generate
pnpm db:migrate --name init
pnpm db:seed
```

## Run API

Run from the workspace root:

```powershell
pnpm dev:api
```

This command builds `@future-stars/shared` automatically before starting the API.

Health check:

```powershell
Invoke-WebRequest http://127.0.0.1:4000/health
```

## Run Admin

Run from the workspace root:

```powershell
pnpm dev:admin
```

Open:

```text
http://127.0.0.1:5173
```

The local admin token defaults to `dev-admin-token` only in `development` and
`test`. Production must set `ADMIN_SESSION_TOKEN`; the API rejects production
admin requests if the token is missing or still set to the development default.

## Run Mini-App

Run from the workspace root:

```powershell
pnpm dev:miniapp
```

For a non-local backend or request-domain deployment, set `TARO_APP_API_BASE`
when building or running the mini-app so requests target the deployed API base.

Open the generated `apps/miniapp/dist` directory in the Douyin mini-app
developer tool.

## Test And Build

Run from the workspace root:

```powershell
pnpm test
pnpm build
```

## Current Verification Limitation

In the current execution environment, `pnpm` and `git` are unavailable, so
runtime test/build commands and git status/commit verification were not run
here. Verification for this documentation task was performed statically with
PowerShell and `rg`.
