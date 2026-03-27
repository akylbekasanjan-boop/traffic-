/**
 * Приводит телефон к одному виду для дедупликации в БД:
 * только цифры, РФ: 8XXXXXXXXXX / 9XXXXXXXXX → 7XXXXXXXXXX
 */
export function normalizePhoneForDedup(raw: string): string {
  let digits = "";
  for (const ch of raw.trim()) {
    if (ch >= "0" && ch <= "9") digits += ch;
  }
  if (digits.startsWith("8") && digits.length === 11) {
    digits = "7" + digits.slice(1);
  }
  if (digits.length === 10 && digits.startsWith("9")) {
    digits = "7" + digits;
  }
  return digits;
}
