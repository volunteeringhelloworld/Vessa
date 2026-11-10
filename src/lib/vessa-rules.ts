// Pure business rules for VessA. Kept free of React/storage so they can be unit tested.

export type CountryCode = {
  code: string;
  dial: string;
  flag: string;
  name: string;
  min: number;
  max: number;
};

export const COUNTRIES: CountryCode[] = [
  { code: "TH", dial: "+66", flag: "🇹🇭", name: "Thailand", min: 9, max: 9 },
  { code: "MM", dial: "+95", flag: "🇲🇲", name: "Myanmar", min: 7, max: 10 },
  { code: "LA", dial: "+856", flag: "🇱🇦", name: "Laos", min: 8, max: 10 },
  { code: "KH", dial: "+855", flag: "🇰🇭", name: "Cambodia", min: 8, max: 9 },
  { code: "MY", dial: "+60", flag: "🇲🇾", name: "Malaysia", min: 9, max: 10 },
  { code: "SG", dial: "+65", flag: "🇸🇬", name: "Singapore", min: 8, max: 8 },
  { code: "VN", dial: "+84", flag: "🇻🇳", name: "Vietnam", min: 9, max: 10 },
  { code: "JP", dial: "+81", flag: "🇯🇵", name: "Japan", min: 10, max: 10 },
  { code: "GB", dial: "+44", flag: "🇬🇧", name: "United Kingdom", min: 10, max: 10 },
  { code: "US", dial: "+1", flag: "🇺🇸", name: "United States", min: 10, max: 10 },
];

export function findCountry(code: string): CountryCode {
  return COUNTRIES.find((c) => c.code === code) ?? COUNTRIES[0]!;
}

/** Digits only, without the national trunk "0" prefix. */
export function normalizePhone(raw: string): string {
  return raw.replace(/\D/g, "").replace(/^0+/, "");
}

/** Thai mobiles are 9 digits after the leading 0 and start with 6, 8 or 9. */
export function isValidPhone(countryCode: string, raw: string): boolean {
  const digits = normalizePhone(raw);
  const c = findCountry(countryCode);
  if (digits.length < c.min || digits.length > c.max) return false;
  if (c.code === "TH") return /^[689]/.test(digits);
  return true;
}

export function formatPhone(countryCode: string, raw: string): string {
  const c = findCountry(countryCode);
  const d = normalizePhone(raw);
  const grouped = d.length === 9 ? `${d.slice(0, 2)} ${d.slice(2, 5)} ${d.slice(5)}` : d;
  return `${c.dial} ${grouped}`;
}

export function phoneKey(countryCode: string, raw: string): string {
  return `${findCountry(countryCode).dial}${normalizePhone(raw)}`;
}

// ---------- OTP ----------
export const OTP_LENGTH = 4;
export const OTP_TTL_SECONDS = 60;

export type OtpPurpose = "signup" | "reset";
export type OtpTicket = {
  code: string;
  ref: string;
  phoneKey: string;
  purpose: OtpPurpose;
  expiresAt: number;
};

export function createOtpTicket(
  purpose: OtpPurpose,
  key: string,
  now: number,
  rand = Math.random,
): OtpTicket {
  const code = String(Math.floor(rand() * 10_000)).padStart(OTP_LENGTH, "0");
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const ref = Array.from({ length: 4 }, () => letters[Math.floor(rand() * letters.length)]).join(
    "",
  );
  return { code, ref, phoneKey: key, purpose, expiresAt: now + OTP_TTL_SECONDS * 1000 };
}

export type OtpResult = "ok" | "wrong" | "expired" | "missing";

export function verifyOtp(ticket: OtpTicket | null, input: string, now: number): OtpResult {
  if (!ticket) return "missing";
  if (now > ticket.expiresAt) return "expired";
  return input === ticket.code ? "ok" : "wrong";
}

// ---------- Passwords ----------
export type PasswordIssue = "required" | "length" | "number" | "letter";

export function passwordIssues(pw: string): PasswordIssue[] {
  if (!pw) return ["required"];
  const issues: PasswordIssue[] = [];
  if (pw.length < 8) issues.push("length");
  if (!/\d/.test(pw)) issues.push("number");
  if (!/[a-zA-Z]/.test(pw)) issues.push("letter");
  return issues;
}

// ---------- Dates ----------
export function daysInMonth(month: number, year: number): number {
  return new Date(year, month, 0).getDate();
}

export function isFutureDate(day: number, month: number, year: number, today: Date): boolean {
  const d = new Date(year, month - 1, day);
  const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return d.getTime() > t.getTime();
}

export function dateKey(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

// ---------- Health profile ----------
export type HealthProfile = {
  bloodType: string;
  heightCm: string;
  weightKg: string;
  allergies: string;
  conditions: string;
  emergencyName: string;
  emergencyPhone: string;
};

export const EMPTY_HEALTH: HealthProfile = {
  bloodType: "",
  heightCm: "",
  weightKg: "",
  allergies: "",
  conditions: "",
  emergencyName: "",
  emergencyPhone: "",
};

export const HEALTH_FIELDS = Object.keys(EMPTY_HEALTH) as (keyof HealthProfile)[];

export function profileCompletion(hp: HealthProfile): number {
  const filled = HEALTH_FIELDS.filter((k) => hp[k].trim().length > 0).length;
  return Math.round((filled / HEALTH_FIELDS.length) * 100);
}

/** The dashboard widget only shows while the health profile is below 100%. */
export function shouldShowCompletionWidget(hp: HealthProfile): boolean {
  return profileCompletion(hp) < 100;
}
