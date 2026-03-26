import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { z } from "zod";

const bodySchema = z.object({
  phone: z.string().trim().min(8).max(32),
  name: z.string().trim().min(2).max(80),
});

export async function POST(req: Request) {
  const supabaseAdmin = getSupabaseAdmin();
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Неверные данные" },
      { status: 400 },
    );
  }

  const { phone, name } = parsed.data;

  // Дедупликация атомарно: один номер = одно лицо.
  // При конфликте (номер уже есть) запись не обновляем и возвращаем `alreadyRegistered=true`.
  const upsertRes = await supabaseAdmin
    .from("submissions")
    .upsert([{ lead_number: phone, name }], {
      onConflict: "lead_number",
      ignoreDuplicates: true,
    })
    .select("lead_number");

  if (upsertRes.error) {
    return NextResponse.json(
      { ok: false, error: upsertRes.error.message || "Ошибка записи" },
      { status: 500 },
    );
  }

  const inserted = Array.isArray(upsertRes.data) && upsertRes.data.length > 0;
  return NextResponse.json({ ok: true, alreadyRegistered: !inserted });
}

