import * as bcrypt from "bcrypt";
import * as jose from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? "dev");
const SALT = 10;

export const hash = (p: string) => bcrypt.hash(p, SALT);
export const verify = (p: string, h: string) => bcrypt.compare(p, h);

export async function sign(payload: { userId: number; username: string }) {
  return new jose.SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret);
}

export async function parse(token: string): Promise<{ userId: number; username: string } | null> {
  try {
    const { payload } = await jose.jwtVerify(token, secret, {
      algorithms: ["HS256"],
    });
    const { userId, username } = payload as { userId: number; username: string };
    return typeof userId === "number" && typeof username === "string" ? { userId, username } : null;
  } catch {
    return null;
  }
}
