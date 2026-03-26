import { cookies } from "next/headers";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { verifyStatsSessionJwt } from "@/lib/statsJwt";
import LoginForm from "@/app/stats/loginForm";
import Link from "next/link";
import type { CSSProperties } from "react";

export const dynamic = "force-dynamic";

export default async function StatsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("stats_jwt")?.value;
  const authed = token ? await verifyStatsSessionJwt(token) : false;
  if (!authed) {
    return <LoginForm />;
  }

  const supabaseAdmin = getSupabaseAdmin();
  const [{ data: latestSnapshot }, { count: totalCount }, { data: recentSubs }, { data: snapshots }] =
    await Promise.all([
      supabaseAdmin
        .from("stats_snapshots")
        .select("*")
        .order("period_end", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabaseAdmin
        .from("submissions")
        .select("lead_number", { count: "exact", head: true }),
      supabaseAdmin
        .from("submissions")
        .select("lead_number,name,created_at")
        .order("created_at", { ascending: false })
        .limit(50),
      supabaseAdmin
        .from("stats_snapshots")
        .select("period_start,period_end,total_submissions,unique_leads,created_at")
        .order("period_end", { ascending: false })
        .limit(5),
    ]);

  const totalUnique = typeof totalCount === "number" ? totalCount : 0;

  return (
    <div style={styles.wrap}>
      <div style={styles.topbar}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22 }}>Статистика предзаписи</h1>
          <div style={{ marginTop: 6, color: "var(--muted)", fontWeight: 600 }}>
            Всего уникальных заполнений: {totalUnique}
          </div>
        </div>
        <Link href="/" style={styles.link}>
          На форму
        </Link>
      </div>

      <div style={styles.grid}>
        <div style={styles.card}>
          <h2 style={styles.h2}>Последний 2-недельный срез</h2>
          {latestSnapshot ? (
            <>
              <div style={styles.metric}>
                Период:{" "}
                <span style={styles.mono}>
                  {new Date(latestSnapshot.period_start).toLocaleDateString("ru-RU")} -{" "}
                  {new Date(latestSnapshot.period_end).toLocaleDateString("ru-RU")}
                </span>
              </div>
              <div style={styles.metric}>
                Заполнений:{" "}
                <span style={styles.mono}>{latestSnapshot.total_submissions}</span>
              </div>
              <div style={{ marginTop: 10, color: "var(--muted)", fontWeight: 600 }}>
                Обновлено:{" "}
                <span style={styles.mono}>
                  {latestSnapshot.created_at
                    ? new Date(latestSnapshot.created_at).toLocaleString("ru-RU")
                    : "-"}
                </span>
              </div>
            </>
          ) : (
            <div style={styles.muted}>Срезы ещё не созданы. Запустите обновление через cron.</div>
          )}
        </div>

        <div style={styles.card}>
          <h2 style={styles.h2}>История срезов</h2>
          {snapshots && snapshots.length ? (
            <div style={styles.table}>
              <div style={styles.thead}>
                <div>Период</div>
                <div>Заполнений</div>
              </div>
              {snapshots.map((s: any) => (
                <div key={s.period_start} style={styles.trow}>
                  <div style={styles.mono}>
                    {new Date(s.period_start).toLocaleDateString("ru-RU")} -{" "}
                    {new Date(s.period_end).toLocaleDateString("ru-RU")}
                  </div>
                  <div style={styles.mono}>{s.total_submissions}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={styles.muted}>Пока нет данных.</div>
          )}
        </div>
      </div>

      <div style={styles.card}>
        <h2 style={styles.h2}>Последние заполнения</h2>
        {recentSubs && recentSubs.length ? (
          <div style={styles.table}>
            <div style={styles.thead3}>
              <div>Телефон</div>
              <div>Имя</div>
              <div>Дата</div>
            </div>
            {recentSubs.map((s: any) => (
              <div key={s.lead_number} style={styles.trow3}>
                <div style={styles.mono}>{s.lead_number}</div>
                <div style={{ fontWeight: 700 }}>{s.name}</div>
                <div style={styles.mono}>
                  {new Date(s.created_at).toLocaleString("ru-RU")}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={styles.muted}>Нет заполнений.</div>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  wrap: { padding: 16, maxWidth: 1100, margin: "0 auto" },
  topbar: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 14,
    flexWrap: "wrap",
  },
  link: { color: "var(--text)", fontWeight: 700, textDecoration: "underline" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: 12,
  },
  card: {
    background: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: 16,
    padding: 16,
    backdropFilter: "blur(8px)",
    marginBottom: 12,
  },
  h2: { margin: 0, fontSize: 16 },
  metric: { marginTop: 10, fontWeight: 700 },
  muted: { color: "var(--muted)", fontWeight: 600 },
  mono: { fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" },
  table: { marginTop: 12, overflowX: "auto" },
  thead: {
    display: "grid",
    gridTemplateColumns: "1.1fr 0.9fr",
    gap: 10,
    color: "var(--muted)",
    fontWeight: 800,
    padding: "6px 0",
    borderBottom: "1px solid var(--border)",
    minWidth: 520,
  },
  trow: {
    display: "grid",
    gridTemplateColumns: "1.1fr 0.9fr",
    gap: 10,
    padding: "10px 0",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    minWidth: 520,
  },
  thead3: {
    display: "grid",
    gridTemplateColumns: "1.2fr 0.9fr 1.2fr",
    gap: 10,
    color: "var(--muted)",
    fontWeight: 800,
    padding: "6px 0",
    borderBottom: "1px solid var(--border)",
    minWidth: 720,
  },
  trow3: {
    display: "grid",
    gridTemplateColumns: "1.2fr 0.9fr 1.2fr",
    gap: 10,
    padding: "10px 0",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    minWidth: 720,
  },
};

