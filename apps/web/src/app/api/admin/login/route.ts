import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { createSessionToken, setSessionCookie } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { loginSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_LOGIN" }, { status: 400 });
  }

  const admin = await prisma.adminUser.findUnique({ where: { username: parsed.data.username } });
  if (!admin || admin.status !== "ACTIVE") {
    return NextResponse.json({ error: "INVALID_CREDENTIALS" }, { status: 401 });
  }

  const ok = await bcrypt.compare(parsed.data.password, admin.passwordHash);
  if (!ok) {
    return NextResponse.json({ error: "INVALID_CREDENTIALS" }, { status: 401 });
  }

  await prisma.adminUser.update({ where: { id: admin.id }, data: { lastLoginAt: new Date() } });
  const token = await createSessionToken({ userId: admin.id, username: admin.username });
  await setSessionCookie(token);

  return NextResponse.json({ user: { id: admin.id, username: admin.username } });
}
