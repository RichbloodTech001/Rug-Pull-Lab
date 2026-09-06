export function requireText(value: unknown, field: string, maxLength = 256): string {
  if (typeof value !== "string") throw new Error(`${field} must be text.`);
  const clean = value.trim();
  if (!clean) throw new Error(`${field} is required.`);
  if (clean.length > maxLength) throw new Error(`${field} is too long.`);
  return clean;
}

export function requirePositiveMinorUnit(value: unknown, field = "amountMinor"): bigint {
  if (typeof value !== "string" && typeof value !== "number" && typeof value !== "bigint") throw new Error(`${field} is required.`);
  let parsed: bigint;
  try { parsed = BigInt(value); } catch { throw new Error(`${field} must be an integer.`); }
  if (parsed <= 0n) throw new Error(`${field} must be positive.`);
  return parsed;
}

export function requireIdempotencyKey(value: unknown): string {
  const key = requireText(value, "Idempotency-Key", 128);
  if (!/^[A-Za-z0-9._:-]{8,128}$/.test(key)) throw new Error("Invalid Idempotency-Key format.");
  return key;
}

export function parseJsonObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Request body must be a JSON object.");
  return value as Record<string, unknown>;
}
