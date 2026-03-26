import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000;

function toIsoFromEpochMs(epochMs: number): string {
  return new Date(epochMs).toISOString();
}

function getCurrentAlignedPeriod(nowMs: number) {
  const periodStartEpochMs = Math.floor(nowMs / TWO_WEEKS_MS) * TWO_WEEKS_MS; // UTC-aligned
  const periodEndEpochMs = periodStartEpochMs + TWO_WEEKS_MS;
  return {
    periodStart: toIsoFromEpochMs(periodStartEpochMs),
    periodEnd: toIsoFromEpochMs(periodEndEpochMs),
  };
}

export async function GET(req: Request) {
  // Защита cron endpoint от случайных публичных вызовов.
  // Vercel Cron при наличии `CRON_SECRET` прокидывает Authorization: Bearer <secret>.
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = req.headers.get("authorization");
    const expected = `Bearer ${cronSecret}`;
    if (authHeader !== expected) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 },
      );
    }
  }

  const supabaseAdmin = getSupabaseAdmin();
  const nowMs = Date.now();
  const { periodStart, periodEnd } = getCurrentAlignedPeriod(nowMs);

  const existing = await supabaseAdmin
    .from("stats_snapshots")
    .select("id")
    .eq("period_start", periodStart)
    .maybeSingle();

  if (existing.data) {
    return NextResponse.json({ ok: true, updated: false });
  }

  const countRes = await supabaseAdmin
    .from("submissions")
    .select("lead_number", { count: "exact", head: true })
    .gte("created_at", periodStart)
    .lt("created_at", periodEnd);

  const total = typeof countRes.count === "number" ? countRes.count : 0;

  const upsert = await supabaseAdmin
    .from("stats_snapshots")
    .upsert(
      [
        {
          period_start: periodStart,
          period_end: periodEnd,
          total_submissions: total,
          unique_leads: total,
        },
      ],
      { onConflict: "period_start" },
    );

  if (upsert.error) {
    return NextResponse.json(
      { ok: false, error: upsert.error.message || "Ошибка обновления" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, updated: true });
}

