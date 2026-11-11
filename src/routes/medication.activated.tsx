import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";
import { BellRing, ChevronRight } from "lucide-react";
import { Glass, GoogleCalendarIcon, MedIcon, Screen, StreakPet, VButton, useNow, BackButton } from "@/components/vessa/ui";
import { countdown, fmtTime, nextDose } from "@/lib/med-logic";
import { useMed } from "@/lib/med-store";

export const Route = createFileRoute("/medication/activated")({
  head: () => ({
    meta: [
      { title: "Medication Reminder Activated – VessA" },
      { name: "description", content: "Your medication reminders are ready." },
      { property: "og:title", content: "Medication Reminder Activated – VessA" },
      { property: "og:description", content: "Your medication reminders are ready." },
    ],
  }),
  component: Activated,
});

function Activated() {
  const navigate = useNavigate();
  const { meds, logs, lastSavedId, calendar } = useMed();
  const now = useNow(15000);
  const med = meds.find((m) => m.id === lastSavedId);
  const next = med ? nextDose([med], logs, now) : null;
  const remindersOn = med && (med.reminders.atTime || med.reminders.before10 || med.reminders.repeat);

  return (
    <Screen>
      <header className="py-2">
        <BackButton to="/medication/tracker" />
      </header>
      <div className="mt-2">
        <StreakPet size={210} cheer={1} />
      </div>
      <div className="mt-4 text-center">
        <h1 className="text-[27px] leading-tight font-semibold">You’re one step closer to better health!</h1>
        <p className="mx-auto mt-2 max-w-xs text-[15px] text-muted-foreground">Your medication reminders are ready. VessA will help you stay consistent with your medication routine.</p>
      </div>

      {med && (
        <Glass className="mt-5 space-y-3">
          <button onClick={() => navigate({ to: "/medication/tracker" })} className="flex w-full items-center gap-3 text-left">
            <MedIcon photo={med.photo} color={med.color} />
            <div className="flex-1">
              <p className="font-semibold">{med.name}</p>
              <p className="text-sm text-muted-foreground">{med.dosage}</p>
            </div>
            <ChevronRight className="size-5 text-muted-foreground" />
          </button>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-2xl bg-cream/70 p-3">
              <p className="text-xs text-muted-foreground">Next dose</p>
              <p className="font-semibold">{next ? `${fmtTime(next.time)}, ${format(next.when, "MMM d")}` : "No upcoming dose"}</p>
            </div>
            <div className="rounded-2xl bg-cream/70 p-3">
              <p className="text-xs text-muted-foreground">Countdown</p>
              <p className="font-semibold text-primary">{next ? countdown(next.when, now) : "—"}</p>
            </div>
          </div>
          <div className="flex justify-between text-sm">
            <span className="flex items-center gap-1.5">
              <BellRing className="size-4 text-coral" /> {remindersOn ? "Reminders active" : "Reminders off"}
            </span>
            <span className="flex items-center gap-1.5">
              <GoogleCalendarIcon className="size-4" /> {calendar.connected ? "Connected" : "Not connected"}
            </span>
          </div>
        </Glass>
      )}

      <div className="mt-auto space-y-2 pt-6">
        <VButton onClick={() => navigate({ to: "/medication/tracker" })}>View Medication Schedule</VButton>
        <VButton variant="ghost" onClick={() => navigate({ to: "/home" })}>
          Back to Home
        </VButton>
      </div>
    </Screen>
  );
}
