import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parseFeaturedPlayerIds, serializePublicMatch, serializePublicPlayer } from "@/lib/serializers";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const player = await prisma.player.findFirst({ where: { id, isPublished: true } });

  if (!player) {
    return NextResponse.json({ error: "PLAYER_NOT_FOUND" }, { status: 404 });
  }

  const matches = await prisma.match.findMany({
    where: { event: { isPublished: true } },
    orderBy: { startsAt: "desc" }
  });
  const relatedMatches = matches
    .filter((match) => parseFeaturedPlayerIds(match.featuredPlayerIdsJson).includes(player.id))
    .map(serializePublicMatch);

  return NextResponse.json({ player: serializePublicPlayer(player), relatedMatches });
}
