import { toast } from "sonner";
import { getDoctor, getFacility } from "./data";
import { formatLongDate, formatTime12 } from "./schedule";
import type { Appointment } from "./store";

/** Confirms a booking in-app, and with a device notification when the browser allows it. */
export async function notifyBooked(a: Appointment) {
  const doctor = getDoctor(a.doctorId);
  const facility = getFacility(a.facilityId);
  const title = "Appointment confirmed";
  const body = `${doctor?.name ?? "Your doctor"} · ${formatLongDate(a.date)}, ${formatTime12(a.time)}${
    facility ? ` · ${facility.name}` : ""
  }`;

  toast.success(title, { description: `${body} · Ref ${a.ref}` });

  if (typeof window === "undefined" || !("Notification" in window)) return;
  try {
    let permission = Notification.permission;
    if (permission === "default") permission = await Notification.requestPermission();
    if (permission === "granted") new Notification(title, { body, icon: "/favicon.png", tag: a.id });
  } catch {
    /* some browsers only allow notifications from a service worker — the in-app message is enough */
  }
}
