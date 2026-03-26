"use client";

import { useState, type CSSProperties, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stats/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as
          | { ok?: boolean; error?: string }
          | null;
        setError(data?.error || "Ошибка входа");
        return;
      }

      router.refresh();
      router.push("/stats");
    } catch {
      setError("Сетевая ошибка");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <h1 style={{ margin: 0, fontSize: 20 }}>Статистика (вход)</h1>
        <p style={{ marginTop: 8, color: "var(--muted)" }}>
          Введите пароль администратора.
        </p>
        <form onSubmit={onSubmit} style={styles.form}>
          <label style={styles.label}>
            Пароль
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="current-password"
              style={styles.input}
            />
          </label>
          {error ? <div style={styles.error}>{error}</div> : null}
          <button disabled={loading} type="submit" style={styles.button}>
            {loading ? "Проверяем..." : "Войти"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  wrap: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  card: {
    width: "100%",
    maxWidth: 520,
    background: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: 16,
    padding: 18,
    backdropFilter: "blur(8px)",
  },
  form: { marginTop: 14, display: "flex", flexDirection: "column", gap: 12 },
  label: { display: "flex", flexDirection: "column", gap: 8, fontWeight: 600 },
  input: {
    marginTop: 4,
    padding: 12,
    borderRadius: 12,
    border: "1px solid var(--border)",
    background: "rgba(0,0,0,0.15)",
    color: "var(--text)",
    outline: "none",
  },
  button: {
    marginTop: 6,
    padding: "12px 14px",
    borderRadius: 12,
    border: "none",
    color: "#fff",
    background: "linear-gradient(90deg, #7c3aed, #3b82f6)",
    cursor: "pointer",
    fontWeight: 700,
  },
  error: { color: "salmon", fontWeight: 600 },
};

