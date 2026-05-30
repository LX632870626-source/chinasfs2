import { SignJWT, jwtVerify } from "jose";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { env, requireEnv } from "@/lib/env";

const cookieName = "future_stars_session";
const encoder = new TextEncoder();

export type AdminSession = {
  userId: string;
  username: string;
};

function secretKey() {
  const secret = env.nodeEnv === "production" ? requireEnv("SESSION_SECRET") : env.sessionSecret ?? "dev-session-secret";
  return encoder.encode(secret);
}

export async function createSessionToken(session: AdminSession) {
  return new SignJWT(session)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey());
}

export async function readAdminSession(): Promise<AdminSession | null> {
  const token = (await cookies()).get(cookieName)?.value;
  if (!token) {
    return null;
  }

  try {
    const verified = await jwtVerify(token, secretKey());
    const payload = verified.payload;
    if (typeof payload.userId !== "string" || typeof payload.username !== "string") {
      return null;
    }
    return { userId: payload.userId, username: payload.username };
  } catch {
    return null;
  }
}

export async function requireAdminSession() {
  const session = await readAdminSession();
  if (!session) {
    return null;
  }
  return session;
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
}

export async function requireAdminPage() {
  const session = await readAdminSession();
  if (!session) {
    redirect("/admin/login");
  }
  return session;
}

export async function setSessionCookie(token: string) {
  (await cookies()).set(cookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.nodeEnv === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });
}

export async function clearSessionCookie() {
  (await cookies()).set(cookieName, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: env.nodeEnv === "production",
    path: "/",
    maxAge: 0
  });
}
