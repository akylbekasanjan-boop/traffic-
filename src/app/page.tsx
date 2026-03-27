"use client";

import { useState, type CSSProperties, type FormEvent } from "react";
import { normalizePhoneForDedup } from "@/lib/phone";

type SubmitResponse = {
  ok: true;
  alreadyRegistered?: boolean;
} | {
  ok: false;
  error: string;
};

export default function HomePage() {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const payload = { phone: normalizePhoneForDedup(phone), name: name.trim() };

    if (payload.phone.length < 10) {
      setLoading(false);
      setError("Введите корректный номер телефона");
      return;
    }

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => null)) as SubmitResponse | null;
      if (!res.ok) {
        setError((data as any)?.error || "Ошибка отправки");
        return;
      }

      if (data && data.ok && data.alreadyRegistered) {
        setMessage("Этот номер телефона уже был зарегистрирован ранее. Спасибо!");
        return;
      }
      setMessage("Спасибо! Предзапись отправлена.");
    } catch {
      setError("Сетевая ошибка");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <h1 style={styles.h1}>Анкета предзаписи</h1>
        <p style={styles.p}>
          Укажите номер телефона и имя. После отправки данные попадут в статистику.
        </p>
        <p style={styles.note}>
          Один номер можно отправить только один раз — повторы не создают новую заявку.
        </p>

        <form onSubmit={onSubmit} style={styles.form}>
          <label style={styles.label}>
            Номер телефона
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+7 999 123-45-67"
              inputMode="tel"
              style={styles.input}
              maxLength={64}
              required
            />
          </label>

          <label style={styles.label}>
            Имя
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Например: Иван"
              style={styles.input}
              maxLength={80}
              required
            />
          </label>

          {error ? <div style={styles.error}>{error}</div> : null}
          {message ? <div style={styles.ok}>{message}</div> : null}

          <button disabled={loading} type="submit" style={styles.button}>
            {loading ? "Отправляем..." : "Отправить"}
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
    maxWidth: 640,
    background: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: 18,
    padding: 18,
    backdropFilter: "blur(8px)",
  },
  h1: { margin: 0, fontSize: 26 },
  p: { marginTop: 8, color: "var(--muted)", fontWeight: 600 },
  note: { marginTop: 6, color: "var(--muted)", fontWeight: 600, fontSize: 13, lineHeight: 1.4 },
  form: { marginTop: 16, display: "flex", flexDirection: "column", gap: 12 },
  label: { display: "flex", flexDirection: "column", gap: 8, fontWeight: 700 },
  input: {
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
    fontWeight: 800,
  },
  error: { color: "salmon", fontWeight: 700 },
  ok: { color: "rgba(167,243,208,0.95)", fontWeight: 800 },
};

