import { NextResponse } from "next/server";
import { requireAdminSession, unauthorizedResponse } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  if (!(await requireAdminSession())) {
    return unauthorizedResponse();
  }
  const events = await prisma.event.findMany({ include: { matches: true }, orderBy: { startsAt: "asc" } });
  return NextResponse.json({ events });
}
