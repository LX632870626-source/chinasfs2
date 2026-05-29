import { describe, expect, it } from "vitest";
import type { AdminPlayer } from "./domain.js";
import { sensitivePlayerFields, toPublicPlayer } from "./privacy.js";

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
