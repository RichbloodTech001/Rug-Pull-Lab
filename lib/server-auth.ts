import { createHash, randomBytes, scrypt as nodeScrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies, headers } from "next/headers";
import { prisma } from "@/lib/prisma";

const scrypt = promisify(nodeScrypt);
const SESSION_COOKIE = "rug_pull_lab_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 12;

function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return `scrypt$${salt}$${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, encoded: string) {
  const [algorithm, salt, storedHex] = encoded.split("$");
  if (algorithm !== "scrypt" || !salt || !storedHex) return false;
  const stored = Buffer.from(storedHex, "hex");
  const derived = (await scrypt(password, salt, stored.length)) as Buffer;
  return stored.length === derived.length && timingSafeEqual(stored, derived);
}

export async function createServerSession(userId: string) {
  const rawToken = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await prisma.session.create({
    data: {
      userId,
      tokenHash: hashSessionToken(rawToken),
      expiresAt,
    },
  });

  cookies().set({
    name: SESSION_COOKIE,
    value: rawToken,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  return expiresAt;
}

export async function getServerSession() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashSessionToken(token) },
    include: { user: true },
  });

  if (!session) return null;
  if (session.expiresAt <= new Date()) {
    await prisma.session.delete({ where: { id: session.id } }).catch(() => undefined);
    cookies().delete(SESSION_COOKIE);
    return null;
  }

  await prisma.session.update({
    where: { id: session.id },
    data: { lastSeenAt: new Date() },
  });

  return session;
}

export async function destroyServerSession() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (token) {
    await prisma.session.deleteMany({ where: { tokenHash: hashSessionToken(token) } });
  }
  cookies().delete(SESSION_COOKIE);
}

export function assertSameOrigin() {
  const origin = headers().get("origin");
  if (!origin) return;

  const host = headers().get("x-forwarded-host") || headers().get("host");
  if (!host) throw new Error("Request host is unavailable.");

  const protocol = headers().get("x-forwarded-proto") || "https";
  const expected = `${protocol}://${host}`;
  if (origin !== expected) throw new Error("Cross-origin request rejected.");
}

export { SESSION_COOKIE };
