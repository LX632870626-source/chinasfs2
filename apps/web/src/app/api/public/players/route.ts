import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { serializePublicPlayer } from "@/lib/serializers";

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams.get("search")?.trim() ?? "";
  const position = request.nextUrl.searchParams.get("position")?.trim() ?? "";
  const region = request.nextUrl.searchParams.get("region")?.trim() ?? "";

  const players = await prisma.player.findMany({
    where: {
      isPublished: true,
      ...(search ? { name: { contains: search, mode: "insensitive" as const } } : {}),
      ...(position ? { position } : {}),
      ...(region ? { region } : {})
    },
    orderBy: [{ isFeatured: "desc" }, { featureOrder: "asc" }, { updatedAt: "desc" }]
  });

  return NextResponse.json({ players: players.map(serializePublicPlayer) });
}
