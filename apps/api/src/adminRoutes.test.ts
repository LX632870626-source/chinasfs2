import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import { createApp } from "./app.js";

const fixtures = vi.hoisted(() => {
  const player = {
    id: "player-1",
    name: "Test Player",
    ageGroup: "U12",
    position: "midfielder",
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

  return { player };
});

vi.mock("./db.js", () => ({
  prisma: {
    player: {
      findMany: vi.fn(async () => [fixtures.player]),
      update: vi.fn(async () => {
        throw Object.assign(new Error("Record not found"), { code: "P2025" });
      })
    },
    event: {
      findMany: vi.fn(async () => [])
    },
    submission: {
      findMany: vi.fn(async () => []),
      update: vi.fn(async () => {
        throw Object.assign(new Error("Record not found"), { code: "P2025" });
      })
    }
  }
}));

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

    expect(response.body.players).toEqual([
      expect.objectContaining({
        id: "player-1",
        name: "Test Player",
        traits: ["passing", "vision"]
      })
    ]);
  });

  it("returns player not found when updating a missing player", async () => {
    const response = await request(app)
      .patch("/api/admin/players/missing-player")
      .set("x-admin-token", "dev-admin-token")
      .send({ name: "Updated Player" })
      .expect(404);

    expect(response.body.error).toBe("PLAYER_NOT_FOUND");
  });

  it("returns submission not found when reviewing a missing submission", async () => {
    const response = await request(app)
      .patch("/api/admin/submissions/missing-submission")
      .set("x-admin-token", "dev-admin-token")
      .send({ status: "REJECTED" })
      .expect(404);

    expect(response.body.error).toBe("SUBMISSION_NOT_FOUND");
  });
});
