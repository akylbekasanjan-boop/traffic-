import { NextResponse } from "next/server";
import { createStatsSessionJwt } from "@/lib/statsJwt";
import { z } from "zod";

const bodySchema = z.object({
  password: z.string().min(1),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  const statsPassword = process.env.STATS_PASSWORD;
  if (!statsPassword) {
    return NextResponse.json(
      { ok: false, error: "Server misconfiguration" },
      { status: 500 },
    );
  }

  if (parsed.data.password !== statsPassword) {
    return NextResponse.json({ ok: false, error: "Wrong password" }, { status: 401 });
  }

  const jwt = await createStatsSessionJwt();

  const res = NextResponse.json({ ok: true });
  res.cookies.set("stats_jwt", jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/stats",
    maxAge: 60 * 60 * 24 * 30, // 30d
  });

  return res;
}

