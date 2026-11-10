import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check, CheckCircle2, Lock, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Glass, GoogleCalendarIcon, Screen, StepHeader, Title, VButton, inputCls } from "@/components/vessa/ui";
import { cn } from "@/lib/utils";
import { useMed, type CalendarState } from "@/lib/med-store";

export const Route = createFileRoute("/medication/calendar")({
  head: () => ({
    meta: [
      { title: "Connect Google Calendar – VessA" },
      { name: "description", content: "Sync your medication reminders with Google Calendar." },
      { property: "og:title", content: "Connect Google Calendar – VessA" },
      { property: "og:description", content: "Sync your medication reminders with Google Calendar." },
    ],
  }),
  component: CalendarStep,
});

const FEATURES = [
  "Automatically add medication schedules",
  "View upcoming medication reminders",
  "Keep your daily routine organized",
  "Receive calendar notifications",
];
const CALS: NonNullable<CalendarState["calendar"]>[] = ["Personal Calendar", "Health Calendar", "VessA Medications"];

function CalendarStep() {
  const navigate = useNavigate();
  const { calendar, setCalendar } = useMed();
  const [consent, setConsent] = useState(false);
  const [email, setEmail] = useState("");

  const authorize = () => {
    if (!/^\S+@\S+\.\S+$/.test(email)) { toast.error("Enter your Google account email"); return; }
    setCalendar({ connected: true, account: email.trim(), skipped: false, calendar: calendar.calendar ?? "Health Calendar" });
    setConsent(false);
  };

  return (
    <Screen>
      <StepHeader step={4} back="/medication/reminders" />
      <Title title="Keep your health schedule connected." sub="Sync your medication reminders with Google Calendar to keep everything organized in one place." />

      <Glass className="p-5">
        <div className="flex items-center gap-3">
          <GoogleCalendarIcon className="size-12" />
          <div>
            <p className="font-semibold">Google Calendar</p>
            {calendar.connected ? (
              <p className="flex items-center gap-1 text-sm font-semibold text-success">
                <CheckCircle2 className="size-4" /> Google Calendar Connected
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">Optional</p>
            )}
          </div>
        </div>
        {!calendar.connected && (
          <ul className="mt-4 space-y-2.5">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-2.5 text-sm">
                <span className="grid size-5 place-items-center rounded-full bg-gradient-primary">
                  <Check className="size-3 text-primary-foreground" />
                </span>
                {f}
              </li>
            ))}
          </ul>
        )}
        {calendar.connected && <p className="mt-2 text-xs text-muted-foreground">{calendar.account}</p>}
      </Glass>

      {calendar.connected && (
        <div className="mt-5">
          <p className="mb-2 text-sm font-semibold">Choose your preferred calendar</p>
          <div className="space-y-2" role="radiogroup">
            {CALS.map((c) => {
              const on = calendar.calendar === c;
              return (
                <button key={c} role="radio" aria-checked={on} onClick={() => setCalendar({ calendar: c })} className={cn("glass flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-left text-sm font-semibold", on && "ring-2 ring-coral")}>
                  {c === "VessA Medications" ? <Plus className="size-5 text-coral" /> : <span className={cn("size-3 rounded-full", c === "Personal Calendar" ? "bg-med-blue" : "bg-med-red")} />}
                  <span className="flex-1">{c === "VessA Medications" ? "Create New Calendar" : c}</span>
                  {c === "VessA Medications" && on && <span className="text-xs text-muted-foreground">“VessA Medications”</span>}
                  {on && <Check className="size-4 text-primary" />}
                </button>
              );
            })}
          </div>
          <button onClick={() => setCalendar({ connected: false, account: undefined, lastSync: undefined })} className="mt-3 text-sm text-muted-foreground underline">
            Disconnect
          </button>
        </div>
      )}

      <p className="mt-4 text-xs text-muted-foreground">Not connecting? VessA’s built-in reminders still work on their own.</p>

      <div className="mt-auto space-y-2 pt-6">
        {calendar.connected ? (
          <VButton
            onClick={() => {
              setCalendar({ lastSync: new Date().toISOString() });
              toast.success(`Reminders synced to ${calendar.calendar}`);
              navigate({ to: "/medication/review" });
            }}
          >
            Sync My Reminders
          </VButton>
        ) : (
          <>
            <VButton onClick={() => setConsent(true)}>Connect Google Calendar</VButton>
            <VButton
              variant="ghost"
              onClick={() => {
                setCalendar({ skipped: true });
                navigate({ to: "/medication/review" });
              }}
            >
              Maybe Later
            </VButton>
          </>
        )}
      </div>

      {consent && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/30 p-4 backdrop-blur-sm" onClick={() => setConsent(false)}>
          <div className="glass glass-strong w-full max-w-[400px] rounded-3xl p-5 pb-safe" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2">
              <GoogleCalendarIcon className="size-8" />
              <p className="font-semibold">Sign in with Google</p>
            </div>
            <p className="mt-3 text-sm">VessA would like to:</p>
            <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
              <li>• See your list of calendars</li>
              <li>• Create a calendar and add medication events</li>
              <li>• Edit only events VessA created</li>
            </ul>
            <input className={`${inputCls} mt-4`} type="email" placeholder="you@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
              <Lock className="size-3" /> VessA never reads your other events.
            </p>
            <div className="mt-4 flex gap-2">
              <VButton variant="glass" className="h-12" onClick={() => setConsent(false)}>
                Cancel
              </VButton>
              <VButton className="h-12" onClick={authorize}>
                Allow
              </VButton>
            </div>
          </div>
        </div>
      )}
    </Screen>
  );
}
