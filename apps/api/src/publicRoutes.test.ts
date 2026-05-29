import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import { sensitivePlayerFields } from "@future-stars/shared";
import { createApp } from "./app.js";
import { prisma } from "./db.js";

const fixtures = vi.hoisted(() => {
  const player = {
    id: "player-1",
    name: "Test Player",
    ageGroup: "U12",
    position: "涓満",
    teamName: "Future Stars",
    region: "Shanghai",
    traitsJson: JSON.stringify(["passing", "vision"]),
    bio: "A composed midfield prospect.",
    coverUrl: null,
    publicVideoUrl: "https://example.com/video",
    isFeatured: true,
    featureOrder: 1,
    birthday: "2014-05-01",
    heightCm: 150,
    weightKg: 42,
    dominantFoot: "right",
    schoolOrOrg: "Private School",
    contactName: "Guardian",
    contactPhone: "13800000000",
    source: "parent submission",
    adminNotes: "private note",
    publicLevel: "PUBLIC",
    isPublished: true,
    createdAt: new Date("2026-05-01T00:00:00.000Z"),
    updatedAt: new Date("2026-05-02T00:00:00.000Z")
  };

  const event = {
    id: "event-1",
    name: "Youth Invitational",
    ageGroup: "U12",
    region: "Shanghai",
    location: "Pudong Football Park",
    startsAt: new Date("2026-06-08T01:00:00.000Z"),
    endsAt: null,
    status: "SCHEDULED",
    summary: "A public event.",
    coverUrl: null,
    officialUrl: "https://example.com/event",
    isPublished: true,
    createdAt: new Date("2026-05-01T00:00:00.000Z"),
    updatedAt: new Date("2026-05-02T00:00:00.000Z")
  };

  const matches = [
    {
      id: "match-published",
      eventId: "event-1",
      startsAt: new Date("2026-06-08T02:00:00.000Z"),
      homeTeam: "Future Stars",
      awayTeam: "City Academy",
      score: null,
      status: "SCHEDULED",
      officialUrl: "https://example.com/match-published",
      featuredPlayerIdsJson: JSON.stringify(["player-1"]),
      event: { isPublished: true }
    },
    {
      id: "match-unpublished",
      eventId: "event-2",
      startsAt: new Date("2026-06-09T02:00:00.000Z"),
      homeTeam: "Future Stars",
      awayTeam: "Private Academy",
      score: null,
      status: "SCHEDULED",
      officialUrl: "https://example.com/match-unpublished",
      featuredPlayerIdsJson: JSON.stringify(["player-1"]),
      event: { isPublished: false }
    }
  ];

  return { event, matches, player };
});

vi.mock("./db.js", () => ({
  prisma: {
    player: {
      findMany: vi.fn(async () => [fixtures.player]),
      findFirst: vi.fn(async () => fixtures.player)
    },
    event: {
      findMany: vi.fn(async () => [fixtures.event]),
      findFirst: vi.fn(async () => ({ ...fixtures.event, matches: [] }))
    },
    match: {
      findMany: vi.fn(async (args?: { where?: { event?: { isPublished?: boolean } } }) => {
        if (args?.where?.event?.isPublished === true) {
          return fixtures.matches.filter((match) => match.event.isPublished);
        }

        return fixtures.matches;
      })
    },
    submission: {
      create: vi.fn(async () => ({ id: "submission-1", status: "PENDING" }))
    }
  }
}));

describe("public routes", () => {
  const app = createApp();

  it("returns featured players without sensitive fields", async () => {
    const response = await request(app).get("/api/public/home").expect(200);
    const publicPlayer = response.body.featuredPlayers[0];

    expect(publicPlayer).toHaveProperty("name", "Test Player");
    expect(publicPlayer).toHaveProperty("traits", ["passing", "vision"]);

    for (const field of sensitivePlayerFields) {
      expect(publicPlayer).not.toHaveProperty(field);
    }
  });

  it("rejects incomplete submissions", async () => {
    const response = await request(app)
      .post("/api/public/submissions")
      .send({ type: "PLAYER", contactName: "", contactPhone: "", content: "short" })
      .expect(400);

    expect(response.body.error).toBe("INVALID_SUBMISSION");
  });

  it("only returns player related matches from published events", async () => {
    const response = await request(app).get("/api/public/players/player-1").expect(200);

    expect(response.body.relatedMatches).toHaveLength(1);
    expect(response.body.relatedMatches[0]).toHaveProperty("id", "match-published");
    expect(prisma.match.findMany).toHaveBeenCalledWith({
      where: { event: { isPublished: true } },
      orderBy: { startsAt: "desc" }
    });
  });
});
