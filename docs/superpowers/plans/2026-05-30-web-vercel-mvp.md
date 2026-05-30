# Web/Vercel MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the current mini-app MVP into a single Next.js Web app deployable on Vercel with Neon Postgres, public pages, admin login, admin management, and privacy-safe APIs.

**Architecture:** Add `apps/web` as the deployable app and leave `apps/api`, `apps/admin`, and `apps/miniapp` as the archived mini-app implementation. `apps/web` owns Next.js pages, route handlers, Prisma client, auth cookies, and web UI while reusing `packages/shared` privacy helpers.

**Tech Stack:** Next.js App Router, React, TypeScript, Prisma, Postgres/Neon, bcryptjs, jose, pnpm workspaces, Vitest.

---

## File Structure

- Create `apps/web`: Next.js application deployed to Vercel.
- Create `apps/web/prisma/schema.prisma`: Postgres Prisma schema for Web deployment.
- Create `apps/web/src/lib`: database, serializers, auth, and validation helpers.
- Create `apps/web/src/app`: public pages, admin pages, and API route handlers.
- Modify root `package.json`: add Web scripts.
- Modify `pnpm-workspace.yaml`: already includes `apps/*`, no change expected.
- Modify docs: add Vercel/Neon deployment guide.

## Task 1: Web App Foundation

**Files:**
- Create: `apps/web/package.json`
- Create: `apps/web/tsconfig.json`
- Create: `apps/web/next.config.mjs`
- Create: `apps/web/src/app/layout.tsx`
- Create: `apps/web/src/app/globals.css`
- Create: `apps/web/src/app/page.tsx`
- Modify: `package.json`

- [ ] **Step 1: Create the Next.js package metadata**

Create `apps/web/package.json`:

```json
{
  "name": "@future-stars/web",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "next dev",
    "build": "prisma generate && next build",
    "start": "next start",
    "lint": "tsc -p tsconfig.json --noEmit",
    "test": "vitest run --passWithNoTests",
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:seed": "tsx prisma/seed.ts"
  },
  "dependencies": {
    "@future-stars/shared": "workspace:*",
    "@prisma/client": "^6.8.2",
    "bcryptjs": "^3.0.2",
    "jose": "^5.10.0",
    "next": "^15.3.3",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "zod": "^3.25.28"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/node": "^22.15.24",
    "@types/react": "^19.1.6",
    "@types/react-dom": "^19.1.5",
    "prisma": "^6.8.2",
    "tsx": "^4.19.4",
    "typescript": "^5.8.3",
    "vitest": "^3.1.4"
  }
}
```

- [ ] **Step 2: Create TypeScript and Next config**

Create `apps/web/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "jsx": "preserve",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "allowJs": true,
    "noEmit": true,
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "types": ["node"]
  },
  "include": ["next-env.d.ts", "src/**/*.ts", "src/**/*.tsx", ".next/types/**/*.ts", "prisma/**/*.ts"],
  "exclude": ["node_modules"]
}
```

Create `apps/web/next.config.mjs`:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  typedRoutes: true
};

export default nextConfig;
```

- [ ] **Step 3: Add root Web scripts**

Modify root `package.json` scripts:

```json
{
  "dev:web": "pnpm --filter @future-stars/web dev",
  "build:web": "pnpm --filter @future-stars/web build"
}
```

Keep existing scripts intact.

- [ ] **Step 4: Create base layout and global styles**

Create `apps/web/src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "中国足球未来之星",
  description: "发现小球员，追踪青少年赛程。"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
```

Create `apps/web/src/app/globals.css`:

```css
:root {
  color: #111827;
  background: #f6f7f9;
  font-family: "Microsoft YaHei", system-ui, sans-serif;
}
* {
  box-sizing: border-box;
}
body {
  margin: 0;
  background: #f6f7f9;
}
a {
  color: inherit;
  text-decoration: none;
}
button,
input,
textarea,
select {
  font: inherit;
}
.page {
  max-width: 1120px;
  margin: 0 auto;
  padding: 24px;
}
.hero {
  min-height: 320px;
  display: grid;
  align-content: end;
  gap: 16px;
  padding: 48px;
  color: white;
  background: linear-gradient(135deg, #0c1116, #0f7b5f);
}
.hero h1 {
  margin: 0;
  font-size: 48px;
  line-height: 1.1;
}
.section {
  margin-top: 28px;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
}
.card,
.panel {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 18px;
}
.muted {
  color: #6b7280;
}
@media (max-width: 640px) {
  .page {
    padding: 16px;
  }
  .hero {
    min-height: 260px;
    padding: 28px;
  }
  .hero h1 {
    font-size: 34px;
  }
}
```

- [ ] **Step 5: Create a placeholder home page**

Create `apps/web/src/app/page.tsx`:

```tsx
export default function HomePage() {
  return (
    <main>
      <section className="hero">
        <h1>中国足球未来之星</h1>
        <p>发现小球员，追踪青少年赛程。</p>
      </section>
    </main>
  );
}
```

- [ ] **Step 6: Static verification**

Run: `pnpm --filter @future-stars/web lint`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add package.json apps/web
git commit -m "feat: add web app foundation"
```

## Task 2: Prisma Postgres Data Layer

**Files:**
- Create: `apps/web/prisma/schema.prisma`
- Create: `apps/web/prisma/seed.ts`
- Create: `apps/web/src/lib/env.ts`
- Create: `apps/web/src/lib/db.ts`
- Create: `apps/web/src/lib/serializers.ts`
- Create: `apps/web/src/lib/validators.ts`

- [ ] **Step 1: Create Postgres Prisma schema**

Create `apps/web/prisma/schema.prisma` using the existing data model, but with Postgres datasource:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Player {
  id             String   @id @default(cuid())
  name           String
  ageGroup       String
  position       String
  teamName       String
  region         String
  traitsJson     String
  bio            String
  coverUrl       String?
  publicVideoUrl String?
  isFeatured     Boolean  @default(false)
  featureOrder   Int      @default(0)
  birthday       String?
  heightCm       Int?
  weightKg       Int?
  dominantFoot   String?
  schoolOrOrg    String?
  contactName    String?
  contactPhone   String?
  source         String?
  adminNotes     String?
  publicLevel    String   @default("PUBLIC")
  isPublished    Boolean  @default(false)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}

model Event {
  id          String   @id @default(cuid())
  name        String
  ageGroup    String
  region      String
  location    String
  startsAt    DateTime
  endsAt      DateTime?
  status      String
  summary     String
  coverUrl    String?
  officialUrl String?
  isPublished Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  matches     Match[]
}

model Match {
  id                    String   @id @default(cuid())
  eventId               String
  startsAt              DateTime
  homeTeam              String
  awayTeam              String
  score                 String?
  status                String
  officialUrl           String?
  featuredPlayerIdsJson String   @default("[]")
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  event                 Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)
}

model Submission {
  id            String   @id @default(cuid())
  type          String
  contactName   String
  contactPhone  String
  content       String
  attachmentUrl String?
  status        String   @default("PENDING")
  adminNotes    String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model AdminUser {
  id           String    @id @default(cuid())
  username     String    @unique
  passwordHash String
  status       String    @default("ACTIVE")
  lastLoginAt  DateTime?
  createdAt    DateTime  @default(now())
}
```

- [ ] **Step 2: Create environment helper**

Create `apps/web/src/lib/env.ts`:

```ts
export const env = {
  databaseUrl: process.env.DATABASE_URL,
  adminUsername: process.env.ADMIN_USERNAME ?? "admin",
  adminPasswordHash: process.env.ADMIN_PASSWORD_HASH,
  sessionSecret: process.env.SESSION_SECRET,
  nodeEnv: process.env.NODE_ENV ?? "development"
};

export function requireEnv(name: "DATABASE_URL" | "SESSION_SECRET") {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required`);
  }
  return value;
}
```

- [ ] **Step 3: Create Prisma client helper**

Create `apps/web/src/lib/db.ts`:

```ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"]
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

- [ ] **Step 4: Create serializers and validators**

Create `apps/web/src/lib/serializers.ts` by adapting `apps/api/src/serializers.ts` for Next.js.

Create `apps/web/src/lib/validators.ts`:

```ts
import { z } from "zod";

export const submissionSchema = z.object({
  type: z.enum(["PLAYER", "EVENT"]),
  contactName: z.string().trim().min(1),
  contactPhone: z.string().trim().min(5),
  content: z.string().trim().min(10),
  attachmentUrl: z.string().trim().url().optional().or(z.literal(""))
});

export const loginSchema = z.object({
  username: z.string().trim().min(1),
  password: z.string().min(1)
});
```

- [ ] **Step 5: Create seed script**

Create `apps/web/prisma/seed.ts` using current `apps/api/prisma/seed.ts`, but reading `ADMIN_USERNAME` and `ADMIN_PASSWORD_HASH` if provided. If no hash is provided locally, hash `future-stars-admin`.

- [ ] **Step 6: Verify Prisma generation**

Run: `pnpm --filter @future-stars/web db:generate`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add apps/web/prisma apps/web/src/lib
git commit -m "feat: add web prisma data layer"
```

## Task 3: Public API Routes

**Files:**
- Create: `apps/web/src/app/api/public/home/route.ts`
- Create: `apps/web/src/app/api/public/players/route.ts`
- Create: `apps/web/src/app/api/public/players/[id]/route.ts`
- Create: `apps/web/src/app/api/public/events/route.ts`
- Create: `apps/web/src/app/api/public/events/[id]/route.ts`
- Create: `apps/web/src/app/api/public/submissions/route.ts`

- [ ] **Step 1: Implement public home route**

Create `apps/web/src/app/api/public/home/route.ts`:

```ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { serializePublicEvent, serializePublicPlayer } from "@/lib/serializers";

export async function GET() {
  const [featuredPlayers, upcomingEvents] = await Promise.all([
    prisma.player.findMany({
      where: { isPublished: true, isFeatured: true },
      orderBy: [{ featureOrder: "asc" }, { updatedAt: "desc" }],
      take: 8
    }),
    prisma.event.findMany({
      where: { isPublished: true, startsAt: { gte: new Date() } },
      orderBy: { startsAt: "asc" },
      take: 5
    })
  ]);

  return NextResponse.json({
    featuredPlayers: featuredPlayers.map(serializePublicPlayer),
    upcomingEvents: upcomingEvents.map(serializePublicEvent)
  });
}
```

- [ ] **Step 2: Implement player and event routes**

Create list/detail routes matching current Express behavior. Detail routes must only return published records and only related matches whose parent event is published.

- [ ] **Step 3: Implement submission route**

Create `apps/web/src/app/api/public/submissions/route.ts` with `POST`, `submissionSchema`, and `PENDING` creation.

- [ ] **Step 4: Verify privacy by source**

Run: `rg "birthday|contactPhone|schoolOrOrg|adminNotes" apps/web/src/app/api/public apps/web/src/lib/serializers.ts`

Expected: sensitive field names only appear inside serializer input/type definitions or explicit privacy exclusion code, not in returned public JSON objects.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/app/api/public apps/web/src/lib
git commit -m "feat: add web public api routes"
```

## Task 4: Admin Auth And Admin API Routes

**Files:**
- Create: `apps/web/src/lib/auth.ts`
- Create: `apps/web/src/app/api/admin/login/route.ts`
- Create: `apps/web/src/app/api/admin/logout/route.ts`
- Create: `apps/web/src/app/api/admin/me/route.ts`
- Create: `apps/web/src/app/api/admin/players/route.ts`
- Create: `apps/web/src/app/api/admin/players/[id]/route.ts`
- Create: `apps/web/src/app/api/admin/events/route.ts`
- Create: `apps/web/src/app/api/admin/submissions/route.ts`
- Create: `apps/web/src/app/api/admin/submissions/[id]/route.ts`

- [ ] **Step 1: Implement cookie session helper**

Create `apps/web/src/lib/auth.ts` using `jose` to sign/verify an HTTP-only cookie named `future_stars_session`. Include `requireAdminSession()` for API routes.

- [ ] **Step 2: Implement login/logout/me routes**

Login validates username/password, compares with `AdminUser.passwordHash`, sets cookie. Logout clears cookie. Me returns current admin session.

- [ ] **Step 3: Implement admin data routes**

Admin routes require session. They provide player list/create/update, event list, submission list/review.

- [ ] **Step 4: Add auth regression checks**

Run source check:

```bash
rg "requireAdminSession" apps/web/src/app/api/admin
```

Expected: every admin route except login calls auth guard.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/lib/auth.ts apps/web/src/app/api/admin
git commit -m "feat: add web admin auth and api"
```

## Task 5: Public Web Pages

**Files:**
- Modify: `apps/web/src/app/page.tsx`
- Create: `apps/web/src/app/players/page.tsx`
- Create: `apps/web/src/app/players/[id]/page.tsx`
- Create: `apps/web/src/app/events/page.tsx`
- Create: `apps/web/src/app/events/[id]/page.tsx`
- Create: `apps/web/src/app/submit/page.tsx`
- Create: `apps/web/src/app/submit/SubmitForm.tsx`
- Create: `apps/web/src/components/PublicNav.tsx`

- [ ] **Step 1: Add public nav**

Create a simple navigation with links to 首页, 未来之星, 赛程, 提交资料.

- [ ] **Step 2: Build home page from database**

Home page queries Prisma directly on the server and displays featured players and upcoming events.

- [ ] **Step 3: Build players/events pages**

List pages support query params for search/filter. Detail pages show public fields and related matches.

- [ ] **Step 4: Build submit form**

Client component posts to `/api/public/submissions`, validates fields, and shows success/error states.

- [ ] **Step 5: Verify public pages build**

Run: `pnpm --filter @future-stars/web lint`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/app apps/web/src/components
git commit -m "feat: add public web pages"
```

## Task 6: Admin Web Pages

**Files:**
- Create: `apps/web/src/app/admin/login/page.tsx`
- Create: `apps/web/src/app/admin/login/LoginForm.tsx`
- Create: `apps/web/src/app/admin/layout.tsx`
- Create: `apps/web/src/app/admin/page.tsx`
- Create: `apps/web/src/app/admin/players/page.tsx`
- Create: `apps/web/src/app/admin/events/page.tsx`
- Create: `apps/web/src/app/admin/submissions/page.tsx`
- Create: `apps/web/src/components/AdminNav.tsx`

- [ ] **Step 1: Build login page**

Client form posts to `/api/admin/login` and redirects to `/admin`.

- [ ] **Step 2: Protect admin layout**

Admin layout checks session server-side and redirects to `/admin/login` when missing.

- [ ] **Step 3: Build admin overview and lists**

Show current players, events, submissions. Provide review buttons for submissions.

- [ ] **Step 4: Verify admin path guards**

Source check: admin layout must call auth session helper or equivalent guard.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/app/admin apps/web/src/components/AdminNav.tsx
git commit -m "feat: add admin web pages"
```

## Task 7: Vercel Deployment Documentation

**Files:**
- Create: `docs/vercel-deployment.md`
- Modify: `docs/local-development.md`
- Modify: `package.json`

- [ ] **Step 1: Add deployment guide**

Create `docs/vercel-deployment.md` documenting:

- GitHub repository import into Vercel.
- Root directory: `apps/web`.
- Install command: `pnpm install`.
- Build command: `pnpm build`.
- Neon database creation.
- Environment variables: `DATABASE_URL`, `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH`, `SESSION_SECRET`.
- Prisma migration command.
- First admin login.

- [ ] **Step 2: Update local development docs**

Add Web commands:

- `pnpm dev:web`
- `pnpm --filter @future-stars/web db:generate`
- `pnpm --filter @future-stars/web db:migrate --name init`
- `pnpm --filter @future-stars/web db:seed`

- [ ] **Step 3: Final verification**

Run:

```bash
pnpm --filter @future-stars/web lint
pnpm --filter @future-stars/web build
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add docs package.json
git commit -m "docs: add vercel deployment guide"
```

## Self-Review Notes

- Spec coverage: This plan covers Next.js Web app, public pages, admin pages, public/admin APIs, Postgres/Neon Prisma, Cookie admin login, Vercel deployment docs, and privacy boundaries.
- Deferred by spec: global youth academy data, video replay aggregation, community features, user accounts, and image storage.
- Privacy boundary: public serializers remain the enforcement point and are checked by source search and planned tests.
- Current environment note: this machine previously lacked `pnpm`, `git`, and local Node tooling. Runtime verification may need to happen after installing Node/pnpm or through Vercel CI.
