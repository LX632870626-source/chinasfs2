import { Router } from "express";
import { z } from "zod";
import { requireAdmin } from "./adminAuth.js";
import { prisma } from "./db.js";

export const adminRoutes = Router();

adminRoutes.use(requireAdmin);

const nullableUrl = z.string().url().nullable().optional();

const playerSchema = z.object({
  name: z.string().trim().min(1),
  ageGroup: z.string().trim().min(1),
  position: z.string().trim().min(1),
  teamName: z.string().trim().min(1),
  region: z.string().trim().min(1),
  traits: z.array(z.string()).default([]),
  bio: z.string().default(""),
  coverUrl: nullableUrl,
  publicVideoUrl: nullableUrl,
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

const reviewSchema = z.object({
  status: z.enum(["PENDING", "ADOPTED", "REJECTED"]),
  adminNotes: z.string().nullable().optional()
});

type PlayerWithTraitsJson = {
  traitsJson: string;
};

function parseTraitsJson(traitsJson: string): string[] {
  try {
    const parsed: unknown = JSON.parse(traitsJson);
    return Array.isArray(parsed) ? parsed.filter((trait): trait is string => typeof trait === "string") : [];
  } catch {
    return [];
  }
}

function serializeAdminPlayer<T extends PlayerWithTraitsJson>(player: T) {
  return {
    ...player,
    traits: parseTraitsJson(player.traitsJson)
  };
}

function isPrismaNotFoundError(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2025";
}

adminRoutes.get("/players", async (_req, res) => {
  const players = await prisma.player.findMany({ orderBy: { updatedAt: "desc" } });

  res.json({ players: players.map(serializeAdminPlayer) });
});

adminRoutes.post("/players", async (req, res) => {
  const parsed = playerSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: "INVALID_PLAYER", issues: parsed.error.flatten() });
    return;
  }

  const { traits, ...data } = parsed.data;
  const player = await prisma.player.create({
    data: { ...data, traitsJson: JSON.stringify(traits) }
  });

  res.status(201).json({ player: serializeAdminPlayer(player) });
});

adminRoutes.patch("/players/:id", async (req, res) => {
  const parsed = playerSchema.partial().safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: "INVALID_PLAYER", issues: parsed.error.flatten() });
    return;
  }

  try {
    const { traits, ...data } = parsed.data;
    const player = await prisma.player.update({
      where: { id: req.params.id },
      data: {
        ...data,
        ...(traits !== undefined ? { traitsJson: JSON.stringify(traits) } : {})
      }
    });

    res.json({ player: serializeAdminPlayer(player) });
  } catch (error) {
    if (isPrismaNotFoundError(error)) {
      res.status(404).json({ error: "PLAYER_NOT_FOUND" });
      return;
    }

    throw error;
  }
});

adminRoutes.get("/events", async (_req, res) => {
  const events = await prisma.event.findMany({
    include: { matches: { orderBy: { startsAt: "asc" } } },
    orderBy: { startsAt: "asc" }
  });

  res.json({ events });
});

adminRoutes.get("/submissions", async (_req, res) => {
  const submissions = await prisma.submission.findMany({ orderBy: { createdAt: "desc" } });

  res.json({ submissions });
});

adminRoutes.patch("/submissions/:id", async (req, res) => {
  const parsed = reviewSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: "INVALID_REVIEW", issues: parsed.error.flatten() });
    return;
  }

  try {
    const submission = await prisma.submission.update({
      where: { id: req.params.id },
      data: parsed.data
    });

    res.json({ submission });
  } catch (error) {
    if (isPrismaNotFoundError(error)) {
      res.status(404).json({ error: "SUBMISSION_NOT_FOUND" });
      return;
    }

    throw error;
  }
});
