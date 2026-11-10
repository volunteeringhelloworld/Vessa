import { addDays, format, parse, startOfDay } from "date-fns";
import type { Doctor, Period } from "./data";

export const PERIODS: { id: Period; label: string }[] = [
  { id: "morning", label: "Morning" },
  { id: "afternoon", label: "Afternoon" },
  { id: "evening", label: "Evening" },
];

export const PERIOD_SLOTS: Record<Period, string[]> = {
  morning: ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30"],
  afternoon: ["13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"],
  evening: ["17:00", "17:30", "18:00", "18:30", "19:00", "19:30"],
};

/** How far ahead appointments can be booked. */
export const MAX_DAYS_AHEAD = 56;

export type SlotStatus = "available" | "booked" | "past";
export type BookedRef = { doctorId: string; date: string; time: string; status: string };

/** Splits "HH:mm" into numbers. */
export function splitTime(time: string): [number, number] {
  const [h = 0, m = 0] = time.split(":").map(Number);
  return [h, m];
}

export const toISODate = (d: Date) => format(d, "yyyy-MM-dd");
export const parseISODate = (s: string) => parse(s, "yyyy-MM-dd", new Date());

export function formatTime12(time: string) {
  const [h, m] = splitTime(time);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, "0")} ${suffix}`;
}

export const formatLongDate = (iso: string) => format(parseISODate(iso), "EEE, d MMM yyyy");

function hash(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/** Slots other patients already hold (deterministic so the schedule is stable). */
function heldByOthers(doctorId: string, date: string, time: string) {
  return hash(`${doctorId}|${date}|${time}`) % 100 < 28;
}

export function isDayOff(doctor: Doctor, date: string) {
  return doctor.daysOff.includes(parseISODate(date).getDay());
}

export function isWithinBookingWindow(date: string, now: Date) {
  const day = startOfDay(parseISODate(date)).getTime();
  const today = startOfDay(now).getTime();
  return day >= today && day <= addDays(startOfDay(now), MAX_DAYS_AHEAD).getTime();
}

export function slotStatus(
  doctor: Doctor,
  date: string,
  time: string,
  now: Date,
  booked: BookedRef[],
): SlotStatus {
  const [h, m] = splitTime(time);
  const at = parseISODate(date);
  at.setHours(h, m, 0, 0);
  if (at.getTime() <= now.getTime()) return "past";
  if (heldByOthers(doctor.id, date, time)) return "booked";
  const mine = booked.some(
    (b) => b.status === "confirmed" && b.doctorId === doctor.id && b.date === date && b.time === time,
  );
  return mine ? "booked" : "available";
}

export function slotsFor(doctor: Doctor, date: string, now: Date, booked: BookedRef[]) {
  return PERIODS.filter((p) => doctor.periods.includes(p.id)).map((p) => ({
    ...p,
    slots: PERIOD_SLOTS[p.id].map((time) => ({
      time,
      status: slotStatus(doctor, date, time, now, booked),
    })),
  }));
}

export function isDateAvailable(doctor: Doctor, date: string, now: Date, booked: BookedRef[]) {
  if (!isWithinBookingWindow(date, now) || isDayOff(doctor, date)) return false;
  return slotsFor(doctor, date, now, booked).some((p) =>
    p.slots.some((s) => s.status === "available"),
  );
}

export function isSlotBookable(
  doctor: Doctor,
  date: string,
  time: string,
  now: Date,
  booked: BookedRef[],
) {
  if (!isWithinBookingWindow(date, now) || isDayOff(doctor, date)) return false;
  const inHours = doctor.periods.some((p) => PERIOD_SLOTS[p].includes(time));
  return inHours && slotStatus(doctor, date, time, now, booked) === "available";
}

/** First date (from today) the doctor has an open slot, or null. */
export function nextAvailableDate(doctor: Doctor, now: Date, booked: BookedRef[]) {
  for (let i = 0; i <= MAX_DAYS_AHEAD; i++) {
    const d = toISODate(addDays(now, i));
    if (isDateAvailable(doctor, d, now, booked)) return d;
  }
  return null;
}
