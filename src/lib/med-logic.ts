// Pure medication scheduling logic (no browser APIs) so it can be unit tested.

export type Frequency = "once" | "twice" | "thrice" | "hours" | "days" | "custom";

export interface ReminderPrefs {
  atTime: boolean;
  before10: boolean;
  repeat: boolean;
  sound: boolean;
}

export interface Medication {
  id: string;
  name: string;
  type: string;
  dosage: string;
  photo?: string | undefined;
  frequency: Frequency;
  intervalHours: number;
  weekdays: number[]; // 0 = Sunday
  times: string[]; // "HH:MM"
  startDate: string; // yyyy-MM-dd
  endDate?: string | undefined;
  reminders: ReminderPrefs;
  color: string;
  active: boolean;
  createdAt: string;
  discontinuedAt?: string | undefined;
}

export type LogStatus = "taken" | "skipped";
export interface DoseLog {
  status: LogStatus;
  at: string; // ISO time recorded
}
export type DoseStatus = "upcoming" | "due" | "taken" | "missed" | "skipped";

export const FREQUENCY_LABELS: Record<Frequency, string> = {
  once: "Once a Day",
  twice: "Twice a Day",
  thrice: "Three Times a Day",
  hours: "Every Few Hours",
  days: "Specific Days",
  custom: "Custom Schedule",
};

export const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const DEFAULT_TIMES: Record<"once" | "twice" | "thrice", string[]> = {
  once: ["09:00"],
  twice: ["09:00", "21:00"],
  thrice: ["08:00", "14:00", "20:00"],
};

/** Dose times generated every N hours starting from `first`, within the same day. */
export function intervalTimes(first: string, hours: number): string[] {
  const [h = 0, m = 0] = first.split(":").map(Number);
  const out: string[] = [];
  const step = Math.max(1, Math.min(12, Math.round(hours)));
  for (let t = h * 60 + m; t < 24 * 60; t += step * 60) {
    out.push(`${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`);
  }
  return out;
}

export function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function parseDateKey(k: string): Date {
  const [y = 1970, m = 1, d = 1] = k.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function doseKey(medId: string, day: string, time: string) {
  return `${medId}|${day}|${time}`;
}

export function at(day: string, time: string): Date {
  const d = parseDateKey(day);
  const [h = 0, m = 0] = time.split(":").map(Number);
  d.setHours(h, m, 0, 0);
  return d;
}

/** Times the medication is scheduled on a given day (empty if not scheduled). */
export function timesOn(med: Medication, day: string): string[] {
  if (day < med.startDate) return [];
  if (med.endDate && day > med.endDate) return [];
  if (med.discontinuedAt && day > med.discontinuedAt.slice(0, 10)) return [];
  if ((med.frequency === "days" || med.frequency === "custom") && med.weekdays.length > 0) {
    if (!med.weekdays.includes(parseDateKey(day).getDay())) return [];
  }
  return [...med.times].sort();
}

const DUE_WINDOW_MIN = 30;

export function doseStatus(
  day: string,
  time: string,
  log: DoseLog | undefined,
  now: Date,
  snoozedUntil?: string,
): DoseStatus {
  if (log) return log.status;
  const t = at(day, time).getTime();
  const n = now.getTime();
  if (snoozedUntil && new Date(snoozedUntil).getTime() > n) return "upcoming";
  if (n < t - DUE_WINDOW_MIN * 60000) return "upcoming";
  if (n <= t + 60 * 60000) return "due";
  return "missed";
}

/**
 * Adherence streak: consecutive scheduled days (most recent first) where every dose was taken.
 * Days with no scheduled medication are skipped and never break the streak.
 * Today counts once fully taken; an unfinished today does not break the streak.
 */
export function computeStreak(
  meds: Medication[],
  logs: Record<string, DoseLog>,
  now: Date,
  maxDays = 365,
): number {
  let streak = 0;
  const cursor = new Date(now);
  cursor.setHours(0, 0, 0, 0);
  for (let i = 0; i < maxDays; i++) {
    const day = dateKey(cursor);
    const doses = meds.flatMap((m) => timesOn(m, day).map((t) => doseKey(m.id, day, t)));
    if (doses.length > 0) {
      const allTaken = doses.every((k) => logs[k]?.status === "taken");
      if (allTaken) streak++;
      else if (i !== 0) break;
    }
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

/** A dose counts as on time when recorded within 60 minutes of its scheduled time. */
export function countOnTime(logs: Record<string, DoseLog>): number {
  return Object.entries(logs).filter(([k, l]) => {
    if (l.status !== "taken") return false;
    const [, day = "", time = ""] = k.split("|");
    return Math.abs(new Date(l.at).getTime() - at(day, time).getTime()) <= 60 * 60000;
  }).length;
}

export interface NextDose {
  med: Medication;
  day: string;
  time: string;
  when: Date;
}

export function nextDose(
  meds: Medication[],
  logs: Record<string, DoseLog>,
  now: Date,
  lookaheadDays = 60,
): NextDose | null {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  for (let i = 0; i < lookaheadDays; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const day = dateKey(d);
    const cands = meds
      .filter((m) => m.active)
      .flatMap((m) => timesOn(m, day).map((time) => ({ med: m, day, time, when: at(day, time) })))
      .filter((c) => !logs[doseKey(c.med.id, c.day, c.time)])
      .filter((c) => c.when.getTime() > now.getTime() - DUE_WINDOW_MIN * 60000)
      .sort((a, b) => a.when.getTime() - b.when.getTime());
    if (cands[0]) return cands[0];
  }
  return null;
}

export function countdown(target: Date, now: Date): string {
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) return "Due now";
  const mins = Math.floor(diff / 60000);
  const d = Math.floor(mins / 1440);
  const h = Math.floor((mins % 1440) / 60);
  const m = mins % 60;
  if (d > 0) return `${d}d ${h}h left`;
  if (h > 0) return `${h}h ${m}m left`;
  return `${m}m left`;
}

export function fmtTime(t: string): string {
  const [h = 0, m = 0] = t.split(":").map(Number);
  const ap = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${ap}`;
}

export function partOfDay(t: string): string {
  const h = Number(t.split(":")[0]);
  if (h < 12) return "Morning";
  if (h < 17) return "Afternoon";
  if (h < 21) return "Evening";
  return "Night";
}
