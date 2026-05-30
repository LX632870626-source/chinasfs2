import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSession, unauthorizedResponse } from "@/lib/auth";
import { prisma } from "@/lib/db";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const reviewSchema = z.object({
  status: z.enum(["PENDING", "ADOPTED", "REJECTED"]),
  adminNotes: z.string().nullable().optional()
});

function isNotFoundError(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2025";
}

export async function PATCH(request: Request, context: RouteContext) {
  if (!(await requireAdminSession())) {
    return unauthorizedResponse();
  }
  const { id } = await context.params;
  const body: unknown = await request.json().catch(() => null);
  const parsed = reviewSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_REVIEW", issues: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const submission = await prisma.submission.update({ where: { id }, data: parsed.data });
    return NextResponse.json({ submission });
  } catch (error) {
    if (isNotFoundError(error)) {
      return NextResponse.json({ error: "SUBMISSION_NOT_FOUND" }, { status: 404 });
    }
    throw error;
  }
}
