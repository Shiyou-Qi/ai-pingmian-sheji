import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "dev_secret_change_me");

export async function createToken(payload: { userId: number; email: string }) {
  return new SignJWT(payload).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("7d").sign(secret);
}

export async function readUserFromCookie() {
  const token = (await cookies()).get("nf_token")?.value;
  if (!token) return null;
  try {
    const verified = await jwtVerify(token, secret);
    return verified.payload as { userId: number; email: string };
  } catch {
    return null;
  }
}
