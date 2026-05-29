import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { env } from "../src/env.js";

process.env.DATABASE_URL ??= env.databaseUrl;

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
      coverUrl: null,
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
      score: null,
      status: "SCHEDULED",
      officialUrl: "https://example.com/match",
      featuredPlayerIdsJson: JSON.stringify([player.id])
    }
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
