import { NextResponse } from "next/server";
import { requireAdminSession, unauthorizedResponse } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { playerSchema } from "@/lib/validators";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function isNotFoundError(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2025";
}

export async function PATCH(request: Request, context: RouteContext) {
  if (!(await requireAdminSession())) {
    return unauthorizedResponse();
  }
  const { id } = await context.params;
  const body: unknown = await request.json().catch(() => null);
  const parsed = playerSchema.partial().safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_PLAYER", issues: parsed.error.flatten() }, { status: 400 });
  }

  const { traits, ...data } = parsed.data;
  try {
    const player = await prisma.player.update({
      where: { id },
      data: { ...data, ...(traits ? { traitsJson: JSON.stringify(traits) } : {}) }
    });
    return NextResponse.json({ player });
  } catch (error) {
    if (isNotFoundError(error)) {
      return NextResponse.json({ error: "PLAYER_NOT_FOUND" }, { status: 404 });
    }
    throw error;
  }
}
