import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { serializePublicEvent } from "@/lib/serializers";

export async function GET() {
  const events = await prisma.event.findMany({
    where: { isPublished: true },
    orderBy: { startsAt: "asc" }
  });

  return NextResponse.json({ events: events.map(serializePublicEvent) });
}
