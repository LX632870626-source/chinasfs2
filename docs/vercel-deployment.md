# Vercel Deployment

This project now has a Web/Vercel target in `apps/web`.

## GitHub

Use the repository:

`https://github.com/LX632870626-source/chinasfs2`

## Vercel Project

Create a new Vercel project from the GitHub repository.

Recommended settings:

- Framework Preset: `Next.js`
- Root Directory: `apps/web`
- Install Command: `pnpm install`
- Build Command: `pnpm build`

The Web app build script runs `prisma generate` before `next build`.

## Neon Postgres

Create a Neon Postgres database and copy the connection string.

Set this Vercel environment variable:

- `DATABASE_URL`: Neon Postgres connection string

## Admin Environment Variables

Set these Vercel environment variables:

- `ADMIN_USERNAME`: admin username, for example `admin`
- `ADMIN_PASSWORD_HASH`: bcrypt hash for the admin password
- `SESSION_SECRET`: long random string for signing login cookies

Do not use a plain password in `ADMIN_PASSWORD_HASH`.

For local development, if `ADMIN_PASSWORD_HASH` is missing, the seed script creates the default password `future-stars-admin`. Production should always use an explicit hash.

## Database Migration

After connecting Neon, run Prisma migration from a machine with pnpm installed:

```powershell
cd apps/web
pnpm db:generate
pnpm db:migrate --name init
pnpm db:seed
```

## Local Web Development

From the repository root:

```powershell
pnpm install
pnpm --filter @future-stars/web db:generate
pnpm --filter @future-stars/web db:migrate --name init
pnpm --filter @future-stars/web db:seed
pnpm dev:web
```

Open `http://localhost:3000`.

## Important Notes

- `apps/web` is the Vercel deployment target.
- `apps/api`, `apps/admin`, and `apps/miniapp` are kept as the earlier mini-app version reference.
- Public APIs must not return minor-player sensitive fields such as birthday, contact phone, school, source, or admin notes.
