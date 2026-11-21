// Bangladeshi mobile numbers are stored as 11 local digits ("01712345678"),
// shown as "01712-345678" and copied as "+8801712345678".

const MOBILE_RE = /^01[3-9]\d{8}$/;

/** Strip everything but digits, drop a leading country code, cap at 11 digits. */
export function normalizePhone(raw: string) {
  const digits = raw.replace(/\D/g, "");
  const local = digits.startsWith("880") ? `0${digits.slice(3)}` : digits;
  return local.slice(0, 11);
}

/** Live formatting for the input: "01712345678" -> "01712-345678". */
export function formatPhoneInput(raw: string) {
  const digits = normalizePhone(raw);
  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
}

export function isValidPhone(raw: string) {
  return MOBILE_RE.test(normalizePhone(raw));
}

/** Display form; falls back to the raw value for legacy, non-standard data. */
export function formatPhoneDisplay(raw?: string | null) {
  if (!raw) return "";
  return isValidPhone(raw) ? formatPhoneInput(raw) : raw;
}

/** "+8801712345678" for copying, or null if the value is not a valid number. */
export function toInternationalPhone(raw?: string | null) {
  if (!raw || !isValidPhone(raw)) return null;
  return `+880${normalizePhone(raw).slice(1)}`;
}
