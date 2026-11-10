import { getDoctor, getFacility } from "./data";
import type { Appointment } from "./store";

const pad = (n: number) => String(n).padStart(2, "0");

function stamp(date: string, time: string, addMinutes = 0) {
  const [y = 2000, mo = 1, d = 1] = date.split("-").map(Number);
  const [h = 0, m = 0] = time.split(":").map(Number);
  const dt = new Date(y, mo - 1, d, h, m + addMinutes);
  return `${dt.getFullYear()}${pad(dt.getMonth() + 1)}${pad(dt.getDate())}T${pad(dt.getHours())}${pad(dt.getMinutes())}00`;
}

function details(a: Appointment) {
  const doctor = getDoctor(a.doctorId);
  const facility = getFacility(a.facilityId);
  return {
    title: `Appointment with ${doctor?.name ?? "your doctor"}`,
    location: facility ? `${facility.name}, ${facility.address}` : "",
    description: `VessA booking ${a.ref} · ${a.reason}${a.consultType === "online" ? " · Online consultation" : ""}`,
  };
}

export function googleCalendarUrl(a: Appointment) {
  const { title, location, description } = details(a);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${stamp(a.date, a.time)}/${stamp(a.date, a.time, 30)}`,
    details: description,
    location,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function downloadIcs(a: Appointment) {
  const { title, location, description } = details(a);
  const esc = (s: string) => s.replace(/[,;\\]/g, (c) => `\\${c}`);
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//VessA//Appointments//EN",
    "BEGIN:VEVENT",
    `UID:${a.id}@vessa`,
    `DTSTAMP:${stamp(a.date, a.time)}`,
    `DTSTART:${stamp(a.date, a.time)}`,
    `DTEND:${stamp(a.date, a.time, 30)}`,
    `SUMMARY:${esc(title)}`,
    `LOCATION:${esc(location)}`,
    `DESCRIPTION:${esc(description)}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT1H",
    "ACTION:DISPLAY",
    "DESCRIPTION:Appointment reminder",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `vessa-${a.ref}.ics`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
