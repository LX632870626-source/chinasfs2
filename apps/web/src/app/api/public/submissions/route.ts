import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { submissionSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const parsed = submissionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_SUBMISSION", issues: parsed.error.flatten() }, { status: 400 });
  }

  const submission = await prisma.submission.create({
    data: {
      ...parsed.data,
      attachmentUrl: parsed.data.attachmentUrl || null,
      status: "PENDING"
    }
  });

  return NextResponse.json({ id: submission.id, status: submission.status }, { status: 201 });
}
