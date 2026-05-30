import { NextResponse } from "next/server";
import { requireAdminSession, unauthorizedResponse } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { parseTraits } from "@/lib/serializers";
import { playerSchema } from "@/lib/validators";

export async function GET() {
  if (!(await requireAdminSession())) {
    return unauthorizedResponse();
  }
  const players = await prisma.player.findMany({ orderBy: { updatedAt: "desc" } });
  return NextResponse.json({ players: players.map((player) => ({ ...player, traits: parseTraits(player.traitsJson) })) });
}

export async function POST(request: Request) {
  if (!(await requireAdminSession())) {
    return unauthorizedResponse();
  }
  const body: unknown = await request.json().catch(() => null);
  const parsed = playerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_PLAYER", issues: parsed.error.flatten() }, { status: 400 });
  }

  const { traits, ...data } = parsed.data;
  const player = await prisma.player.create({ data: { ...data, traitsJson: JSON.stringify(traits) } });
  return NextResponse.json({ player }, { status: 201 });
}
