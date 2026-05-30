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
