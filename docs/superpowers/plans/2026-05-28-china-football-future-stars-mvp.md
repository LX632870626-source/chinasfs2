# 中国足球未来之星 MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a usable MVP with a public future-stars mini-app frontend, an admin web console, backend APIs, seeded data, submission review, and privacy-safe public responses.

**Architecture:** Use a TypeScript monorepo with shared domain types, an Express API backed by SQLite/Prisma, a React admin app, and a Taro/React mini-app frontend that can target Douyin later. The backend owns sensitive fields and exposes separate public and admin serializers so minor-player private data never leaks to public endpoints.

**Tech Stack:** pnpm workspaces, TypeScript, Express, Prisma, SQLite, Vitest, Supertest, React, Vite, Taro React.

---

## File Structure

- Create `package.json`: root workspace scripts.
- Create `pnpm-workspace.yaml`: workspace package list.
- Create `tsconfig.base.json`: shared TypeScript compiler settings.
- Create `apps/api`: backend API, Prisma schema, seed data, tests.
- Create `apps/admin`: administrator web UI.
- Create `apps/miniapp`: public mini-app UI.
- Create `packages/shared`: shared enums, public DTOs, admin DTOs, validation helpers.
- Create `docs/privacy-public-fields.md`: privacy boundary for public data.

The implementation is split by deployable surface: API, admin, mini-app, and shared domain package. Shared types are intentionally small and stable; API serializers are the hard boundary for sensitive fields.

## Task 1: Monorepo Foundation

**Files:**
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `tsconfig.base.json`
- Create: `.gitignore`
- Create: `packages/shared/package.json`
- Create: `packages/shared/tsconfig.json`
- Create: `packages/shared/src/index.ts`
- Create: `packages/shared/src/domain.ts`
- Create: `packages/shared/src/privacy.ts`
- Test: `packages/shared/src/privacy.test.ts`

- [ ] **Step 1: Create the root workspace files**

Create `package.json`:

```json
{
  "name": "china-football-future-stars",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "pnpm -r build",
    "test": "pnpm -r test",
    "lint": "pnpm -r lint",
    "dev:api": "pnpm --filter @future-stars/api dev",
    "dev:admin": "pnpm --filter @future-stars/admin dev",
    "dev:miniapp": "pnpm --filter @future-stars/miniapp dev:tt"
  },
  "devDependencies": {
    "@types/node": "^22.15.24",
    "typescript": "^5.8.3",
    "vitest": "^3.1.4"
  },
  "packageManager": "pnpm@10.11.0"
}
```

Create `pnpm-workspace.yaml`:

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

Create `tsconfig.base.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "noUncheckedIndexedAccess": true
  }
}
```

Create `.gitignore`:

```gitignore
node_modules
dist
.env
.env.*
*.db
*.db-journal
apps/api/prisma/dev.db
```

- [ ] **Step 2: Create shared package metadata**

Create `packages/shared/package.json`:

```json
{
  "name": "@future-stars/shared",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "test": "vitest run",
    "lint": "tsc -p tsconfig.json --noEmit"
  },
  "devDependencies": {
    "typescript": "^5.8.3",
    "vitest": "^3.1.4"
  }
}
```

Create `packages/shared/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src",
    "declaration": true
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Write shared domain types**

Create `packages/shared/src/domain.ts`:

```ts
export const positions = ["门将", "后卫", "中场", "前锋"] as const;
export type Position = (typeof positions)[number];

export const playerPublicLevels = ["PUBLIC", "PRIVATE"] as const;
export type PlayerPublicLevel = (typeof playerPublicLevels)[number];

export const matchStatuses = ["SCHEDULED", "LIVE", "FINISHED", "CANCELLED"] as const;
export type MatchStatus = (typeof matchStatuses)[number];

export const submissionStatuses = ["PENDING", "ADOPTED", "REJECTED"] as const;
export type SubmissionStatus = (typeof submissionStatuses)[number];

export type PublicPlayer = {
  id: string;
  name: string;
  ageGroup: string;
  position: Position;
  teamName: string;
  region: string;
  traits: string[];
  bio: string;
  coverUrl: string | null;
  publicVideoUrl: string | null;
  isFeatured: boolean;
  featureOrder: number;
};

export type AdminPlayer = PublicPlayer & {
  birthday: string | null;
  heightCm: number | null;
  weightKg: number | null;
  dominantFoot: string | null;
  schoolOrOrg: string | null;
  contactName: string | null;
  contactPhone: string | null;
  source: string | null;
  adminNotes: string | null;
  publicLevel: PlayerPublicLevel;
  isPublished: boolean;
};

export type PublicEvent = {
  id: string;
  name: string;
  ageGroup: string;
  region: string;
  location: string;
  startsAt: string;
  endsAt: string | null;
  status: string;
  summary: string;
  coverUrl: string | null;
  officialUrl: string | null;
};

export type PublicMatch = {
  id: string;
  eventId: string;
  startsAt: string;
  homeTeam: string;
  awayTeam: string;
  score: string | null;
  status: MatchStatus;
  officialUrl: string | null;
  featuredPlayerIds: string[];
};
```

Create `packages/shared/src/privacy.ts`:

```ts
import type { AdminPlayer, PublicPlayer } from "./domain";

export const sensitivePlayerFields = [
  "birthday",
  "heightCm",
  "weightKg",
  "dominantFoot",
  "schoolOrOrg",
  "contactName",
  "contactPhone",
  "source",
  "adminNotes",
  "publicLevel",
  "isPublished"
] as const;

export function toPublicPlayer(player: AdminPlayer): PublicPlayer {
  return {
    id: player.id,
    name: player.name,
    ageGroup: player.ageGroup,
    position: player.position,
    teamName: player.teamName,
    region: player.region,
    traits: player.traits,
    bio: player.bio,
    coverUrl: player.coverUrl,
    publicVideoUrl: player.publicVideoUrl,
    isFeatured: player.isFeatured,
    featureOrder: player.featureOrder
  };
}
```

Create `packages/shared/src/index.ts`:

```ts
export * from "./domain";
export * from "./privacy";
```

- [ ] **Step 4: Write the privacy boundary test**

Create `packages/shared/src/privacy.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import type { AdminPlayer } from "./domain";
import { sensitivePlayerFields, toPublicPlayer } from "./privacy";

describe("toPublicPlayer", () => {
  it("removes all backend-only sensitive player fields", () => {
    const adminPlayer: AdminPlayer = {
      id: "p1",
      name: "李明",
      ageGroup: "U12",
      position: "中场",
      teamName: "未来之星梯队",
      region: "上海",
      traits: ["传球", "视野"],
      bio: "中场组织者。",
      coverUrl: null,
      publicVideoUrl: "https://example.com/video",
      isFeatured: true,
      featureOrder: 1,
      birthday: "2014-05-01",
      heightCm: 150,
      weightKg: 42,
      dominantFoot: "右脚",
      schoolOrOrg: "某学校",
      contactName: "家长",
      contactPhone: "13800000000",
      source: "家长提交",
      adminNotes: "后台备注",
      publicLevel: "PUBLIC",
      isPublished: true
    };

    const publicPlayer = toPublicPlayer(adminPlayer);

    for (const field of sensitivePlayerFields) {
      expect(publicPlayer).not.toHaveProperty(field);
    }
    expect(publicPlayer.name).toBe("李明");
    expect(publicPlayer.traits).toEqual(["传球", "视野"]);
  });
});
```

- [ ] **Step 5: Install dependencies**

Run: `pnpm install`

Expected: packages install successfully and `pnpm-lock.yaml` is created.

- [ ] **Step 6: Run shared tests**

Run: `pnpm --filter @future-stars/shared test`

Expected: PASS, including `toPublicPlayer removes all backend-only sensitive player fields`.

- [ ] **Step 7: Commit**

```bash
git add package.json pnpm-workspace.yaml tsconfig.base.json .gitignore packages/shared pnpm-lock.yaml
git commit -m "chore: initialize future stars monorepo"
```

## Task 2: API Database And Seed Data

**Files:**
- Create: `apps/api/package.json`
- Create: `apps/api/tsconfig.json`
- Create: `apps/api/prisma/schema.prisma`
- Create: `apps/api/prisma/seed.ts`
- Create: `apps/api/src/db.ts`
- Create: `apps/api/src/env.ts`

- [ ] **Step 1: Create API package metadata**

Create `apps/api/package.json`:

```json
{
  "name": "@future-stars/api",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc -p tsconfig.json",
    "start": "node dist/server.js",
    "test": "vitest run",
    "lint": "tsc -p tsconfig.json --noEmit",
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:seed": "tsx prisma/seed.ts"
  },
  "dependencies": {
    "@future-stars/shared": "workspace:*",
    "@prisma/client": "^6.8.2",
    "bcryptjs": "^3.0.2",
    "cors": "^2.8.5",
    "express": "^5.1.0",
    "zod": "^3.25.28"
  },
  "devDependencies": {
    "@types/cors": "^2.8.18",
    "@types/express": "^5.0.2",
    "@types/supertest": "^6.0.3",
    "prisma": "^6.8.2",
    "supertest": "^7.1.1",
    "tsx": "^4.19.4",
    "typescript": "^5.8.3",
    "vitest": "^3.1.4"
  },
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

Create `apps/api/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": ".",
    "types": ["node", "vitest"]
  },
  "include": ["src", "prisma"]
}
```

- [ ] **Step 2: Create the Prisma schema**

Create `apps/api/prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
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
  id             String   @id @default(cuid())
  type           String
  contactName    String
  contactPhone   String
  content        String
  attachmentUrl  String?
  status         String   @default("PENDING")
  adminNotes     String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}

model AdminUser {
  id           String   @id @default(cuid())
  username     String   @unique
  passwordHash String
  status       String   @default("ACTIVE")
  lastLoginAt  DateTime?
  createdAt    DateTime @default(now())
}
```

- [ ] **Step 3: Add database helpers**

Create `apps/api/src/env.ts`:

```ts
export const env = {
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: process.env.DATABASE_URL ?? "file:./dev.db",
  adminSessionToken: process.env.ADMIN_SESSION_TOKEN ?? "dev-admin-token"
};
```

Create `apps/api/src/db.ts`:

```ts
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();
```

- [ ] **Step 4: Seed example data**

Create `apps/api/prisma/seed.ts`:

```ts
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.match.deleteMany();
  await prisma.event.deleteMany();
  await prisma.player.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.adminUser.deleteMany();

  await prisma.adminUser.create({
    data: {
      username: "admin",
      passwordHash: await bcrypt.hash("future-stars-admin", 10)
    }
  });

  const player = await prisma.player.create({
    data: {
      name: "李明",
      ageGroup: "U12",
      position: "中场",
      teamName: "未来之星梯队",
      region: "上海",
      traitsJson: JSON.stringify(["传球", "视野", "节奏控制"]),
      bio: "善于在中场接应和转移球，比赛阅读能力突出。",
      coverUrl: null,
      publicVideoUrl: "https://example.com/official-video",
      isFeatured: true,
      featureOrder: 1,
      birthday: "2014-05-01",
      heightCm: 150,
      weightKg: 42,
      dominantFoot: "右脚",
      schoolOrOrg: "后台可见训练机构",
      contactName: "后台联系人",
      contactPhone: "13800000000",
      source: "示例数据",
      adminNotes: "仅后台可见",
      publicLevel: "PUBLIC",
      isPublished: true
    }
  });

  const event = await prisma.event.create({
    data: {
      name: "长三角青少年足球邀请赛",
      ageGroup: "U12",
      region: "上海",
      location: "浦东足球公园",
      startsAt: new Date("2026-06-08T09:00:00+08:00"),
      endsAt: new Date("2026-06-10T18:00:00+08:00"),
      status: "SCHEDULED",
      summary: "面向 U12 年龄段的区域邀请赛。",
      officialUrl: "https://example.com/event",
      isPublished: true
    }
  });

  await prisma.match.create({
    data: {
      eventId: event.id,
      startsAt: new Date("2026-06-08T10:00:00+08:00"),
      homeTeam: "未来之星梯队",
      awayTeam: "江南青训队",
      status: "SCHEDULED",
      officialUrl: "https://example.com/match",
      featuredPlayerIdsJson: JSON.stringify([player.id])
    }
  });
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  });
```

- [ ] **Step 5: Generate and migrate database**

Run:

```bash
cd apps/api
pnpm db:generate
pnpm db:migrate --name init
pnpm db:seed
```

Expected: Prisma client is generated, SQLite database is created, and seed completes without errors.

- [ ] **Step 6: Commit**

```bash
git add apps/api package.json pnpm-lock.yaml
git commit -m "feat: add api database schema and seed data"
```

## Task 3: Public API And Privacy Tests

**Files:**
- Create: `apps/api/src/serializers.ts`
- Create: `apps/api/src/publicRoutes.ts`
- Create: `apps/api/src/app.ts`
- Create: `apps/api/src/server.ts`
- Test: `apps/api/src/publicRoutes.test.ts`

- [ ] **Step 1: Add serializers**

Create `apps/api/src/serializers.ts`:

```ts
import { toPublicPlayer, type AdminPlayer, type PublicEvent, type PublicMatch } from "@future-stars/shared";

type DbPlayer = {
  id: string;
  name: string;
  ageGroup: string;
  position: string;
  teamName: string;
  region: string;
  traitsJson: string;
  bio: string;
  coverUrl: string | null;
  publicVideoUrl: string | null;
  isFeatured: boolean;
  featureOrder: number;
  birthday: string | null;
  heightCm: number | null;
  weightKg: number | null;
  dominantFoot: string | null;
  schoolOrOrg: string | null;
  contactName: string | null;
  contactPhone: string | null;
  source: string | null;
  adminNotes: string | null;
  publicLevel: string;
  isPublished: boolean;
};

export function serializePublicPlayer(player: DbPlayer) {
  const adminPlayer: AdminPlayer = {
    ...player,
    position: player.position as AdminPlayer["position"],
    traits: JSON.parse(player.traitsJson) as string[],
    publicLevel: player.publicLevel as AdminPlayer["publicLevel"]
  };
  return toPublicPlayer(adminPlayer);
}

export function serializePublicEvent(event: {
  id: string;
  name: string;
  ageGroup: string;
  region: string;
  location: string;
  startsAt: Date;
  endsAt: Date | null;
  status: string;
  summary: string;
  coverUrl: string | null;
  officialUrl: string | null;
}): PublicEvent {
  return {
    id: event.id,
    name: event.name,
    ageGroup: event.ageGroup,
    region: event.region,
    location: event.location,
    startsAt: event.startsAt.toISOString(),
    endsAt: event.endsAt?.toISOString() ?? null,
    status: event.status,
    summary: event.summary,
    coverUrl: event.coverUrl,
    officialUrl: event.officialUrl
  };
}

export function serializePublicMatch(match: {
  id: string;
  eventId: string;
  startsAt: Date;
  homeTeam: string;
  awayTeam: string;
  score: string | null;
  status: string;
  officialUrl: string | null;
  featuredPlayerIdsJson: string;
}): PublicMatch {
  return {
    id: match.id,
    eventId: match.eventId,
    startsAt: match.startsAt.toISOString(),
    homeTeam: match.homeTeam,
    awayTeam: match.awayTeam,
    score: match.score,
    status: match.status as PublicMatch["status"],
    officialUrl: match.officialUrl,
    featuredPlayerIds: JSON.parse(match.featuredPlayerIdsJson) as string[]
  };
}
```

- [ ] **Step 2: Add public routes**

Create `apps/api/src/publicRoutes.ts`:

```ts
import { Router } from "express";
import { z } from "zod";
import { prisma } from "./db";
import { serializePublicEvent, serializePublicMatch, serializePublicPlayer } from "./serializers";

export const publicRoutes = Router();

publicRoutes.get("/home", async (_req, res) => {
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

  res.json({
    featuredPlayers: featuredPlayers.map(serializePublicPlayer),
    upcomingEvents: upcomingEvents.map(serializePublicEvent)
  });
});

publicRoutes.get("/players", async (req, res) => {
  const search = String(req.query.search ?? "");
  const position = String(req.query.position ?? "");
  const region = String(req.query.region ?? "");

  const players = await prisma.player.findMany({
    where: {
      isPublished: true,
      ...(search ? { name: { contains: search } } : {}),
      ...(position ? { position } : {}),
      ...(region ? { region } : {})
    },
    orderBy: [{ isFeatured: "desc" }, { featureOrder: "asc" }, { updatedAt: "desc" }]
  });

  res.json({ players: players.map(serializePublicPlayer) });
});

publicRoutes.get("/players/:id", async (req, res) => {
  const player = await prisma.player.findFirst({ where: { id: req.params.id, isPublished: true } });
  if (!player) {
    res.status(404).json({ error: "PLAYER_NOT_FOUND" });
    return;
  }
  const matches = await prisma.match.findMany({ orderBy: { startsAt: "desc" } });
  const relatedMatches = matches
    .filter((match) => (JSON.parse(match.featuredPlayerIdsJson) as string[]).includes(player.id))
    .map(serializePublicMatch);
  res.json({ player: serializePublicPlayer(player), relatedMatches });
});

publicRoutes.get("/events", async (_req, res) => {
  const events = await prisma.event.findMany({
    where: { isPublished: true },
    orderBy: { startsAt: "asc" }
  });
  res.json({ events: events.map(serializePublicEvent) });
});

publicRoutes.get("/events/:id", async (req, res) => {
  const event = await prisma.event.findFirst({
    where: { id: req.params.id, isPublished: true },
    include: { matches: { orderBy: { startsAt: "asc" } } }
  });
  if (!event) {
    res.status(404).json({ error: "EVENT_NOT_FOUND" });
    return;
  }
  res.json({
    event: serializePublicEvent(event),
    matches: event.matches.map(serializePublicMatch)
  });
});

const submissionSchema = z.object({
  type: z.enum(["PLAYER", "EVENT"]),
  contactName: z.string().min(1),
  contactPhone: z.string().min(5),
  content: z.string().min(10),
  attachmentUrl: z.string().url().optional().or(z.literal(""))
});

publicRoutes.post("/submissions", async (req, res) => {
  const parsed = submissionSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "INVALID_SUBMISSION", issues: parsed.error.flatten() });
    return;
  }

  const submission = await prisma.submission.create({
    data: {
      ...parsed.data,
      attachmentUrl: parsed.data.attachmentUrl || null,
      status: "PENDING"
    }
  });
  res.status(201).json({ id: submission.id, status: submission.status });
});
```

- [ ] **Step 3: Add Express app and server**

Create `apps/api/src/app.ts`:

```ts
import cors from "cors";
import express from "express";
import { publicRoutes } from "./publicRoutes";

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.get("/health", (_req, res) => res.json({ ok: true }));
  app.use("/api/public", publicRoutes);
  return app;
}
```

Create `apps/api/src/server.ts`:

```ts
import { createApp } from "./app";
import { env } from "./env";

createApp().listen(env.port, () => {
  console.log(`API listening on http://localhost:${env.port}`);
});
```

- [ ] **Step 4: Write public API tests**

Create `apps/api/src/publicRoutes.test.ts`:

```ts
import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";
import { createApp } from "./app";

describe("public routes", () => {
  const app = createApp();

  beforeAll(() => {
    process.env.DATABASE_URL = "file:./dev.db";
  });

  it("returns featured players without sensitive fields", async () => {
    const response = await request(app).get("/api/public/home").expect(200);
    const player = response.body.featuredPlayers[0];

    expect(player).toHaveProperty("name");
    expect(player).not.toHaveProperty("birthday");
    expect(player).not.toHaveProperty("contactPhone");
    expect(player).not.toHaveProperty("schoolOrOrg");
    expect(player).not.toHaveProperty("adminNotes");
  });

  it("rejects incomplete submissions", async () => {
    const response = await request(app)
      .post("/api/public/submissions")
      .send({ type: "PLAYER", contactName: "", contactPhone: "", content: "短" })
      .expect(400);

    expect(response.body.error).toBe("INVALID_SUBMISSION");
  });
});
```

- [ ] **Step 5: Run API tests**

Run: `pnpm --filter @future-stars/api test`

Expected: PASS for public routes after database seed exists.

- [ ] **Step 6: Commit**

```bash
git add apps/api/src apps/api/package.json pnpm-lock.yaml
git commit -m "feat: expose privacy-safe public api"
```

## Task 4: Admin API

**Files:**
- Create: `apps/api/src/adminAuth.ts`
- Create: `apps/api/src/adminRoutes.ts`
- Modify: `apps/api/src/app.ts`
- Test: `apps/api/src/adminRoutes.test.ts`

- [ ] **Step 1: Add simple admin authentication middleware**

Create `apps/api/src/adminAuth.ts`:

```ts
import type { NextFunction, Request, Response } from "express";
import { env } from "./env";

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const token = req.header("x-admin-token");
  if (token !== env.adminSessionToken) {
    res.status(401).json({ error: "UNAUTHORIZED" });
    return;
  }
  next();
}
```

- [ ] **Step 2: Add admin CRUD and review routes**

Create `apps/api/src/adminRoutes.ts`:

```ts
import { Router } from "express";
import { z } from "zod";
import { requireAdmin } from "./adminAuth";
import { prisma } from "./db";

export const adminRoutes = Router();
adminRoutes.use(requireAdmin);

const playerSchema = z.object({
  name: z.string().min(1),
  ageGroup: z.string().min(1),
  position: z.string().min(1),
  teamName: z.string().min(1),
  region: z.string().min(1),
  traits: z.array(z.string()).default([]),
  bio: z.string().default(""),
  coverUrl: z.string().url().nullable().optional(),
  publicVideoUrl: z.string().url().nullable().optional(),
  isFeatured: z.boolean().default(false),
  featureOrder: z.number().int().default(0),
  birthday: z.string().nullable().optional(),
  heightCm: z.number().int().nullable().optional(),
  weightKg: z.number().int().nullable().optional(),
  dominantFoot: z.string().nullable().optional(),
  schoolOrOrg: z.string().nullable().optional(),
  contactName: z.string().nullable().optional(),
  contactPhone: z.string().nullable().optional(),
  source: z.string().nullable().optional(),
  adminNotes: z.string().nullable().optional(),
  publicLevel: z.enum(["PUBLIC", "PRIVATE"]).default("PUBLIC"),
  isPublished: z.boolean().default(false)
});

adminRoutes.get("/players", async (_req, res) => {
  const players = await prisma.player.findMany({ orderBy: { updatedAt: "desc" } });
  res.json({ players: players.map((player) => ({ ...player, traits: JSON.parse(player.traitsJson) })) });
});

adminRoutes.post("/players", async (req, res) => {
  const parsed = playerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "INVALID_PLAYER", issues: parsed.error.flatten() });
    return;
  }
  const { traits, ...data } = parsed.data;
  const player = await prisma.player.create({ data: { ...data, traitsJson: JSON.stringify(traits) } });
  res.status(201).json({ player });
});

adminRoutes.patch("/players/:id", async (req, res) => {
  const parsed = playerSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "INVALID_PLAYER", issues: parsed.error.flatten() });
    return;
  }
  const { traits, ...data } = parsed.data;
  const player = await prisma.player.update({
    where: { id: req.params.id },
    data: { ...data, ...(traits ? { traitsJson: JSON.stringify(traits) } : {}) }
  });
  res.json({ player });
});

adminRoutes.get("/events", async (_req, res) => {
  const events = await prisma.event.findMany({ include: { matches: true }, orderBy: { startsAt: "asc" } });
  res.json({ events });
});

adminRoutes.get("/submissions", async (_req, res) => {
  const submissions = await prisma.submission.findMany({ orderBy: { createdAt: "desc" } });
  res.json({ submissions });
});

adminRoutes.patch("/submissions/:id", async (req, res) => {
  const parsed = z.object({
    status: z.enum(["PENDING", "ADOPTED", "REJECTED"]),
    adminNotes: z.string().nullable().optional()
  }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "INVALID_REVIEW", issues: parsed.error.flatten() });
    return;
  }
  const submission = await prisma.submission.update({ where: { id: req.params.id }, data: parsed.data });
  res.json({ submission });
});
```

- [ ] **Step 3: Mount admin routes**

Modify `apps/api/src/app.ts`:

```ts
import cors from "cors";
import express from "express";
import { adminRoutes } from "./adminRoutes";
import { publicRoutes } from "./publicRoutes";

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.get("/health", (_req, res) => res.json({ ok: true }));
  app.use("/api/public", publicRoutes);
  app.use("/api/admin", adminRoutes);
  return app;
}
```

- [ ] **Step 4: Write admin auth tests**

Create `apps/api/src/adminRoutes.test.ts`:

```ts
import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "./app";

describe("admin routes", () => {
  const app = createApp();

  it("requires an admin token", async () => {
    const response = await request(app).get("/api/admin/players").expect(401);
    expect(response.body.error).toBe("UNAUTHORIZED");
  });

  it("allows admin player listing with token", async () => {
    const response = await request(app)
      .get("/api/admin/players")
      .set("x-admin-token", "dev-admin-token")
      .expect(200);

    expect(Array.isArray(response.body.players)).toBe(true);
  });
});
```

- [ ] **Step 5: Run API tests**

Run: `pnpm --filter @future-stars/api test`

Expected: PASS for public and admin route tests.

- [ ] **Step 6: Commit**

```bash
git add apps/api/src
git commit -m "feat: add admin management api"
```

## Task 5: Admin Web App

**Files:**
- Create: `apps/admin/package.json`
- Create: `apps/admin/tsconfig.json`
- Create: `apps/admin/index.html`
- Create: `apps/admin/src/main.tsx`
- Create: `apps/admin/src/App.tsx`
- Create: `apps/admin/src/api.ts`
- Create: `apps/admin/src/styles.css`

- [ ] **Step 1: Create admin app metadata**

Create `apps/admin/package.json`:

```json
{
  "name": "@future-stars/admin",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite --host 127.0.0.1 --port 5173",
    "build": "tsc -p tsconfig.json && vite build",
    "test": "vitest run",
    "lint": "tsc -p tsconfig.json --noEmit"
  },
  "dependencies": {
    "@vitejs/plugin-react": "^4.5.0",
    "vite": "^6.3.5",
    "react": "^19.1.0",
    "react-dom": "^19.1.0"
  },
  "devDependencies": {
    "@types/react": "^19.1.6",
    "@types/react-dom": "^19.1.5",
    "typescript": "^5.8.3",
    "vitest": "^3.1.4"
  }
}
```

Create `apps/admin/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "jsx": "react-jsx",
    "types": ["vite/client"]
  },
  "include": ["src"]
}
```

Create `apps/admin/index.html`:

```html
<div id="root"></div>
<script type="module" src="/src/main.tsx"></script>
```

- [ ] **Step 2: Add admin API client**

Create `apps/admin/src/api.ts`:

```ts
const API_BASE = import.meta.env.VITE_API_BASE ?? "http://127.0.0.1:4000";
const ADMIN_TOKEN = import.meta.env.VITE_ADMIN_TOKEN ?? "dev-admin-token";

export async function adminGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}/api/admin${path}`, {
    headers: { "x-admin-token": ADMIN_TOKEN }
  });
  if (!response.ok) throw new Error(`Admin request failed: ${response.status}`);
  return response.json() as Promise<T>;
}

export async function adminPatch<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE}/api/admin${path}`, {
    method: "PATCH",
    headers: { "content-type": "application/json", "x-admin-token": ADMIN_TOKEN },
    body: JSON.stringify(body)
  });
  if (!response.ok) throw new Error(`Admin request failed: ${response.status}`);
  return response.json() as Promise<T>;
}
```

- [ ] **Step 3: Build the admin shell**

Create `apps/admin/src/main.tsx`:

```tsx
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./styles.css";

createRoot(document.getElementById("root")!).render(<App />);
```

Create `apps/admin/src/App.tsx`:

```tsx
import { useEffect, useState } from "react";
import { adminGet, adminPatch } from "./api";

type Player = { id: string; name: string; ageGroup: string; position: string; isPublished: boolean; isFeatured: boolean };
type EventItem = { id: string; name: string; ageGroup: string; region: string; startsAt: string; isPublished: boolean };
type Submission = { id: string; type: string; contactName: string; contactPhone: string; content: string; status: string };

export function App() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  async function load() {
    const [playerData, eventData, submissionData] = await Promise.all([
      adminGet<{ players: Player[] }>("/players"),
      adminGet<{ events: EventItem[] }>("/events"),
      adminGet<{ submissions: Submission[] }>("/submissions")
    ]);
    setPlayers(playerData.players);
    setEvents(eventData.events);
    setSubmissions(submissionData.submissions);
  }

  useEffect(() => {
    void load();
  }, []);

  async function reviewSubmission(id: string, status: "ADOPTED" | "REJECTED") {
    await adminPatch(`/submissions/${id}`, { status });
    await load();
  }

  return (
    <main className="layout">
      <header className="topbar">
        <h1>中国足球未来之星后台</h1>
        <span>轻量运营台</span>
      </header>

      <section className="grid">
        <div className="panel">
          <h2>球员管理</h2>
          {players.map((player) => (
            <article className="row" key={player.id}>
              <strong>{player.name}</strong>
              <span>{player.ageGroup} · {player.position}</span>
              <span>{player.isPublished ? "已上架" : "未上架"} · {player.isFeatured ? "首页推荐" : "普通"}</span>
            </article>
          ))}
        </div>

        <div className="panel">
          <h2>赛事管理</h2>
          {events.map((event) => (
            <article className="row" key={event.id}>
              <strong>{event.name}</strong>
              <span>{event.ageGroup} · {event.region}</span>
              <span>{new Date(event.startsAt).toLocaleString()}</span>
            </article>
          ))}
        </div>

        <div className="panel wide">
          <h2>提交审核</h2>
          {submissions.map((submission) => (
            <article className="submission" key={submission.id}>
              <div>
                <strong>{submission.type}</strong>
                <p>{submission.content}</p>
                <span>{submission.contactName} · {submission.contactPhone} · {submission.status}</span>
              </div>
              <div className="actions">
                <button onClick={() => reviewSubmission(submission.id, "ADOPTED")}>采纳</button>
                <button onClick={() => reviewSubmission(submission.id, "REJECTED")}>拒绝</button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
```

Create `apps/admin/src/styles.css`:

```css
body {
  margin: 0;
  font-family: "Microsoft YaHei", system-ui, sans-serif;
  background: #f4f6f8;
  color: #17202a;
}
.layout {
  padding: 24px;
}
.topbar {
  display: flex;
  align-items: end;
  justify-content: space-between;
  margin-bottom: 20px;
}
h1, h2 {
  margin: 0;
}
.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}
.panel {
  background: white;
  border: 1px solid #dde3ea;
  border-radius: 8px;
  padding: 16px;
}
.wide {
  grid-column: 1 / -1;
}
.row, .submission {
  display: grid;
  gap: 6px;
  padding: 12px 0;
  border-top: 1px solid #edf1f5;
}
.submission {
  grid-template-columns: 1fr auto;
  align-items: center;
}
.actions {
  display: flex;
  gap: 8px;
}
button {
  border: 0;
  border-radius: 6px;
  padding: 8px 12px;
  background: #0f7b5f;
  color: white;
  cursor: pointer;
}
```

- [ ] **Step 4: Build admin app**

Run: `pnpm --filter @future-stars/admin build`

Expected: TypeScript and Vite build complete successfully.

- [ ] **Step 5: Commit**

```bash
git add apps/admin package.json pnpm-lock.yaml
git commit -m "feat: add lightweight admin console"
```

## Task 6: Mini-App Frontend

**Files:**
- Create: `apps/miniapp/package.json`
- Create: `apps/miniapp/tsconfig.json`
- Create: `apps/miniapp/config/index.ts`
- Create: `apps/miniapp/src/app.config.ts`
- Create: `apps/miniapp/src/app.tsx`
- Create: `apps/miniapp/src/app.css`
- Create: `apps/miniapp/src/lib/api.ts`
- Create: `apps/miniapp/src/pages/home/index.tsx`
- Create: `apps/miniapp/src/pages/players/index.tsx`
- Create: `apps/miniapp/src/pages/events/index.tsx`
- Create: `apps/miniapp/src/pages/submit/index.tsx`

- [ ] **Step 1: Create mini-app metadata**

Create `apps/miniapp/package.json`:

```json
{
  "name": "@future-stars/miniapp",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev:tt": "taro build --type tt --watch",
    "build:tt": "taro build --type tt",
    "test": "vitest run",
    "lint": "tsc -p tsconfig.json --noEmit"
  },
  "dependencies": {
    "@future-stars/shared": "workspace:*",
    "@tarojs/components": "^4.1.0",
    "@tarojs/helper": "^4.1.0",
    "@tarojs/plugin-framework-react": "^4.1.0",
    "@tarojs/plugin-platform-tt": "^4.1.0",
    "@tarojs/react": "^4.1.0",
    "@tarojs/runtime": "^4.1.0",
    "@tarojs/taro": "^4.1.0",
    "react": "^19.1.0"
  },
  "devDependencies": {
    "@tarojs/cli": "^4.1.0",
    "typescript": "^5.8.3",
    "vitest": "^3.1.4"
  }
}
```

Create `apps/miniapp/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "jsx": "react-jsx",
    "types": ["@tarojs/taro"]
  },
  "include": ["src", "config"]
}
```

Create `apps/miniapp/config/index.ts`:

```ts
export default {
  projectName: "china-football-future-stars",
  date: "2026-05-28",
  designWidth: 750,
  deviceRatio: {
    640: 2.34 / 2,
    750: 1,
    828: 1.81 / 2
  },
  sourceRoot: "src",
  outputRoot: "dist",
  framework: "react",
  compiler: "webpack5",
  mini: {},
  h5: {}
};
```

- [ ] **Step 2: Create app shell**

Create `apps/miniapp/src/app.config.ts`:

```ts
export default defineAppConfig({
  pages: [
    "pages/home/index",
    "pages/players/index",
    "pages/events/index",
    "pages/submit/index"
  ],
  window: {
    backgroundTextStyle: "light",
    navigationBarBackgroundColor: "#0c1116",
    navigationBarTitleText: "中国足球未来之星",
    navigationBarTextStyle: "white"
  },
  tabBar: {
    color: "#718096",
    selectedColor: "#0f7b5f",
    list: [
      { pagePath: "pages/home/index", text: "首页" },
      { pagePath: "pages/players/index", text: "未来之星" },
      { pagePath: "pages/events/index", text: "赛程" }
    ]
  }
});
```

Create `apps/miniapp/src/app.tsx`:

```tsx
import "./app.css";

export default function App({ children }: { children: React.ReactNode }) {
  return children;
}
```

Create `apps/miniapp/src/app.css`:

```css
page {
  background: #f5f7f9;
  color: #111827;
  font-family: "Microsoft YaHei", system-ui, sans-serif;
}
.page {
  padding: 24px;
}
.hero {
  background: #0c1116;
  color: white;
  padding: 28px;
  border-radius: 8px;
}
.section {
  margin-top: 24px;
}
.card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 18px;
  margin-top: 12px;
}
.muted {
  color: #6b7280;
}
```

- [ ] **Step 3: Create mini-app API client**

Create `apps/miniapp/src/lib/api.ts`:

```ts
import Taro from "@tarojs/taro";

const API_BASE = "http://127.0.0.1:4000";

export async function publicGet<T>(path: string): Promise<T> {
  const response = await Taro.request<T>({ url: `${API_BASE}/api/public${path}`, method: "GET" });
  if (response.statusCode >= 400) throw new Error(`Public request failed: ${response.statusCode}`);
  return response.data;
}

export async function publicPost<T>(path: string, data: unknown): Promise<T> {
  const response = await Taro.request<T>({
    url: `${API_BASE}/api/public${path}`,
    method: "POST",
    data,
    header: { "content-type": "application/json" }
  });
  if (response.statusCode >= 400) throw new Error(`Public request failed: ${response.statusCode}`);
  return response.data;
}
```

- [ ] **Step 4: Create home page**

Create `apps/miniapp/src/pages/home/index.tsx`:

```tsx
import { Button, Text, View } from "@tarojs/components";
import Taro, { useLoad } from "@tarojs/taro";
import { useState } from "react";
import type { PublicEvent, PublicPlayer } from "@future-stars/shared";
import { publicGet } from "../../lib/api";

export default function HomePage() {
  const [players, setPlayers] = useState<PublicPlayer[]>([]);
  const [events, setEvents] = useState<PublicEvent[]>([]);

  useLoad(async () => {
    const data = await publicGet<{ featuredPlayers: PublicPlayer[]; upcomingEvents: PublicEvent[] }>("/home");
    setPlayers(data.featuredPlayers);
    setEvents(data.upcomingEvents);
  });

  return (
    <View className="page">
      <View className="hero">
        <Text>中国足球未来之星</Text>
        <View>发现小球员，追踪青少年赛程。</View>
      </View>

      <View className="section">
        <Button onClick={() => Taro.navigateTo({ url: "/pages/submit/index" })}>提交球员或赛事线索</Button>
      </View>

      <View className="section">
        <Text>本周未来之星</Text>
        {players.map((player) => (
          <View className="card" key={player.id}>
            <Text>{player.name}</Text>
            <View className="muted">{player.ageGroup} · {player.position} · {player.teamName}</View>
          </View>
        ))}
        <Button onClick={() => Taro.switchTab({ url: "/pages/players/index" })}>查看更多</Button>
      </View>

      <View className="section">
        <Text>即将开赛</Text>
        {events.map((event) => (
          <View className="card" key={event.id}>
            <Text>{event.name}</Text>
            <View className="muted">{event.ageGroup} · {event.location}</View>
          </View>
        ))}
        <Button onClick={() => Taro.switchTab({ url: "/pages/events/index" })}>查看更多</Button>
      </View>
    </View>
  );
}
```

- [ ] **Step 5: Create list pages and submission page**

Create `apps/miniapp/src/pages/players/index.tsx`:

```tsx
import { Input, Text, View } from "@tarojs/components";
import { useLoad } from "@tarojs/taro";
import { useState } from "react";
import type { PublicPlayer } from "@future-stars/shared";
import { publicGet } from "../../lib/api";

export default function PlayersPage() {
  const [players, setPlayers] = useState<PublicPlayer[]>([]);
  const [search, setSearch] = useState("");

  async function load(keyword = "") {
    const data = await publicGet<{ players: PublicPlayer[] }>(`/players?search=${encodeURIComponent(keyword)}`);
    setPlayers(data.players);
  }

  useLoad(() => void load());

  return (
    <View className="page">
      <Input value={search} placeholder="搜索球员" onInput={(event) => setSearch(String(event.detail.value))} onConfirm={() => void load(search)} />
      {players.map((player) => (
        <View className="card" key={player.id}>
          <Text>{player.name}</Text>
          <View className="muted">{player.ageGroup} · {player.position} · {player.region}</View>
          <View>{player.traits.join(" / ")}</View>
        </View>
      ))}
    </View>
  );
}
```

Create `apps/miniapp/src/pages/events/index.tsx`:

```tsx
import { Text, View } from "@tarojs/components";
import { useLoad } from "@tarojs/taro";
import { useState } from "react";
import type { PublicEvent } from "@future-stars/shared";
import { publicGet } from "../../lib/api";

export default function EventsPage() {
  const [events, setEvents] = useState<PublicEvent[]>([]);

  useLoad(async () => {
    const data = await publicGet<{ events: PublicEvent[] }>("/events");
    setEvents(data.events);
  });

  return (
    <View className="page">
      {events.map((event) => (
        <View className="card" key={event.id}>
          <Text>{event.name}</Text>
          <View className="muted">{event.ageGroup} · {event.region} · {event.location}</View>
          <View>{new Date(event.startsAt).toLocaleString()}</View>
        </View>
      ))}
    </View>
  );
}
```

Create `apps/miniapp/src/pages/submit/index.tsx`:

```tsx
import { Button, Input, Picker, Textarea, View } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { useState } from "react";
import { publicPost } from "../../lib/api";

const types = ["PLAYER", "EVENT"];

export default function SubmitPage() {
  const [typeIndex, setTypeIndex] = useState(0);
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [content, setContent] = useState("");

  async function submit() {
    await publicPost("/submissions", {
      type: types[typeIndex],
      contactName,
      contactPhone,
      content
    });
    await Taro.showToast({ title: "已提交审核", icon: "success" });
    Taro.navigateBack();
  }

  return (
    <View className="page">
      <Picker mode="selector" range={types} value={typeIndex} onChange={(event) => setTypeIndex(Number(event.detail.value))}>
        <View className="card">提交类型：{types[typeIndex]}</View>
      </Picker>
      <Input placeholder="联系人" value={contactName} onInput={(event) => setContactName(String(event.detail.value))} />
      <Input placeholder="联系方式" value={contactPhone} onInput={(event) => setContactPhone(String(event.detail.value))} />
      <Textarea placeholder="请描述球员或赛事线索" value={content} onInput={(event) => setContent(String(event.detail.value))} />
      <Button onClick={() => void submit()}>提交审核</Button>
    </View>
  );
}
```

- [ ] **Step 6: Build mini-app**

Run: `pnpm --filter @future-stars/miniapp build:tt`

Expected: Taro builds a Douyin/tt mini-app output under `apps/miniapp/dist`.

- [ ] **Step 7: Commit**

```bash
git add apps/miniapp package.json pnpm-lock.yaml
git commit -m "feat: add public miniapp frontend"
```

## Task 7: Documentation And End-To-End Verification

**Files:**
- Create: `docs/privacy-public-fields.md`
- Create: `docs/local-development.md`

- [ ] **Step 1: Document public/private field rules**

Create `docs/privacy-public-fields.md`:

```md
# Public And Private Player Fields

Public endpoints may return:

- id
- name
- ageGroup
- position
- teamName
- region
- traits
- bio
- coverUrl
- publicVideoUrl
- isFeatured
- featureOrder

Public endpoints must not return:

- birthday
- heightCm
- weightKg
- dominantFoot
- schoolOrOrg
- contactName
- contactPhone
- source
- adminNotes
- publicLevel
- isPublished

All user-submitted player and event data starts as `PENDING` and is not displayed until an administrator creates or updates published records.
```

- [ ] **Step 2: Document local development**

Create `docs/local-development.md` with this content:

```md
# Local Development

## Install

Run `pnpm install`.

## Database

Run these commands from `apps/api`:

- `pnpm db:generate`
- `pnpm db:migrate --name init`
- `pnpm db:seed`

## Run API

Run `pnpm dev:api`.

API health check: `Invoke-WebRequest http://127.0.0.1:4000/health`

## Run Admin

Run `pnpm dev:admin`.

Open `http://127.0.0.1:5173`.

## Run Mini-App

Run `pnpm dev:miniapp`.

Open `apps/miniapp/dist` with the Douyin mini-app developer tool.

## Test

Run `pnpm test` and `pnpm build`.
```

- [ ] **Step 3: Run all tests**

Run: `pnpm test`

Expected: shared privacy tests and API route tests pass.

- [ ] **Step 4: Run all builds**

Run: `pnpm build`

Expected: shared package, API, admin, and mini-app build successfully.

- [ ] **Step 5: Verify public API does not leak private fields**

Run:

```powershell
Invoke-WebRequest http://127.0.0.1:4000/api/public/home | Select-Object -ExpandProperty Content
```

Expected: JSON contains `featuredPlayers`, and does not contain `birthday`, `contactPhone`, `schoolOrOrg`, or `adminNotes`.

- [ ] **Step 6: Commit**

```bash
git add docs
git commit -m "docs: add local development and privacy notes"
```

## Self-Review Notes

- Spec coverage: The plan covers the public homepage, future-stars list, schedule list, submission form, backend public/admin APIs, admin console, data model, seed data, privacy boundary, and verification.
- Deferred by spec: Global youth academy data, comments, rankings, player claiming, video replay aggregation, and complete Douyin account deployment are intentionally excluded.
- Privacy boundary: Public serialization is tested in both shared package and API route tests.
- Known execution note: The current environment previously reported `git` as unavailable, so commit steps may need to be skipped or run in a terminal where Git is installed.
