import { SignJWT, jwtVerify } from "jose";

function getSecretKey() {
  const jwtSecret = process.env.STATS_JWT_SECRET;
  if (!jwtSecret) throw new Error("Missing env var: STATS_JWT_SECRET");
  const encoder = new TextEncoder();
  return encoder.encode(jwtSecret);
}

export async function createStatsSessionJwt(): Promise<string> {
  const secretKey = getSecretKey();
  return await new SignJWT({ role: "owner" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secretKey);
}

export async function verifyStatsSessionJwt(token: string): Promise<boolean> {
  try {
    const secretKey = getSecretKey();
    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: ["HS256"],
    });
    return payload?.role === "owner";
  } catch {
    return false;
  }
}

