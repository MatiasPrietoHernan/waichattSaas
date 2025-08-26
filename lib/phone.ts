export function normalizePhone(raw: string): string {
  // Ej: "+54 9 381-123-4567" -> "5493811234567"
  return (raw || "").replace(/[^\d]/g, "");
}