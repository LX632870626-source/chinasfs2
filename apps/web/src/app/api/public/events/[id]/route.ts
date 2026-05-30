import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { serializePublicEvent, serializePublicMatch } from "@/lib/serializers";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const event = await prisma.event.findFirst({
    where: { id, isPublished: true },
    include: { matches: { orderBy: { startsAt: "asc" } } }
  });

  if (!event) {
    return NextResponse.json({ error: "EVENT_NOT_FOUND" }, { status: 404 });
  }

  return NextResponse.json({
    event: serializePublicEvent(event),
    matches: event.matches.map(serializePublicMatch)
  });
}
