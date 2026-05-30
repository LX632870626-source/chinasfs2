import { NextResponse } from "next/server";
import { requireAdminSession, unauthorizedResponse } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  if (!(await requireAdminSession())) {
    return unauthorizedResponse();
  }
  const submissions = await prisma.submission.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ submissions });
}
