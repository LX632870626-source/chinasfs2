import { Router } from "express";
import { z } from "zod";
import { prisma } from "./db.js";
import {
  parseFeaturedPlayerIds,
  serializePublicEvent,
  serializePublicMatch,
  serializePublicPlayer
} from "./serializers.js";

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
  const player = await prisma.player.findFirst({
    where: { id: req.params.id, isPublished: true }
  });

  if (!player) {
    res.status(404).json({ error: "PLAYER_NOT_FOUND" });
    return;
  }

  const matches = await prisma.match.findMany({
    where: { event: { isPublished: true } },
    orderBy: { startsAt: "desc" }
  });
  const relatedMatches = matches
    .filter((match) => parseFeaturedPlayerIds(match.featuredPlayerIdsJson).includes(player.id))
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
  contactName: z.string().trim().min(1),
  contactPhone: z.string().trim().min(5),
  content: z.string().trim().min(10),
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
