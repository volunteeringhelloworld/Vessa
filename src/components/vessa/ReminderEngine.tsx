import { useEffect } from "react";
import { toast } from "sonner";
import { useMed } from "@/lib/med-store";
import { at, dateKey, doseKey, fmtTime, timesOn } from "@/lib/med-logic";

function beep() {
  try {
    const ctx = new AudioContext();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.value = 880;
    g.gain.setValueAtTime(0.15, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    o.connect(g).connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + 0.6);
  } catch {
    /* audio unavailable */
  }
}

/** In-app reminder scheduler: fires notifications while VessA is open. */
export function ReminderEngine() {
  useEffect(() => {
    const tick = () => {
      const s = useMed.getState();
      const now = new Date();
      const day = dateKey(now);
      for (const m of s.meds.filter((x) => x.active)) {
        for (const t of timesOn(m, day)) {
          const key = doseKey(m.id, day, t);
          if (s.logs[key]) continue;
          const due = s.snoozed[key] ? new Date(s.snoozed[key]) : at(day, t);
          const diffMin = (due.getTime() - now.getTime()) / 60000;
          const fire = (id: string, msg: string) => {
            if (s.notified[id]) return;
            s.markNotified(id);
            toast(msg, { description: `${m.dosage} · ${fmtTime(t)}` });
            if (m.reminders.sound) beep();
            if ("Notification" in window && Notification.permission === "granted") {
              new Notification("VessA reminder", { body: `${msg} (${m.dosage})` });
            }
          };
          if (m.reminders.before10 && diffMin <= 10 && diffMin > 0) fire(`${key}|pre`, `${m.name} in 10 minutes`);
          if (m.reminders.atTime && diffMin <= 0 && diffMin > -5) fire(key, `Time to take ${m.name}`);
          if (m.reminders.repeat && diffMin <= -15 && diffMin > -60) fire(`${key}|rep`, `Reminder: ${m.name} not yet taken`);
        }
      }
    };
    tick();
    const id = setInterval(tick, 20000);
    return () => clearInterval(id);
  }, []);
  return null;
}
