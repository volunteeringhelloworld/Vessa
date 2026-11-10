import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { DoseRow } from "@/components/vessa/DoseRow";
import { AppHeader, Glass, GoogleCalendarIcon, MedIcon, Screen, VButton, useNow } from "@/components/vessa/ui";
import { FREQUENCY_LABELS, WEEKDAYS, dateKey, doseKey, fmtTime, timesOn } from "@/lib/med-logic";
import { useMed } from "@/lib/med-store";

export const Route = createFileRoute("/medication/dashboard")({
  head: () => ({
    meta: [
      { title: "My Medications – VessA" },
      { name: "description", content: "Your full medication schedule, progress and upcoming doses." },
      { property: "og:title", content: "My Medications – VessA" },
      { property: "og:description", content: "Your full medication schedule, progress and upcoming doses." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const navigate = useNavigate();
  const { meds, logs, calendar, editMed, discontinue, resetDraft, setCalendar } = useMed();
  const now = useNow(30000);
  const today = dateKey(now);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [showPast, setShowPast] = useState(false);
  const active = meds.filter((m) => m.active);
  const past = meds.filter((m) => !m.active);
  const doses = active.flatMap((m) => timesOn(m, today).map((t) => ({ m, t })));
  const taken = doses.filter(({ m, t }) => logs[doseKey(m.id, today, t)]?.status === "taken").length;
  const remaining = doses.filter(({ m, t }) => !logs[doseKey(m.id, today, t)]).length;
  const pct = doses.length ? Math.round((taken / doses.length) * 100) : 0;

  const add = () => {
    resetDraft();
    navigate({ to: "/medication/add" });
  };

  return (
    <Screen nav>
      <AppHeader title="My Medications" />
      <div className="mt-4 mb-5">
        <h1 className="text-[28px] font-semibold">Your medication routine.</h1>
        <p className="mt-1 text-[15px] text-muted-foreground">Stay consistent, one dose at a time.</p>
      </div>

      <Glass className="flex items-center gap-4">
        <div className="relative size-20 shrink-0">
          <svg viewBox="0 0 36 36" className="size-full -rotate-90">
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--muted)" strokeWidth="4" />
            {doses.length > 0 && <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--coral)" strokeWidth="4" strokeLinecap="round" strokeDasharray={`${pct * 0.974} 100`} />}
          </svg>
          <span className="absolute inset-0 grid place-items-center text-sm font-bold">{doses.length ? `${pct}%` : "—"}</span>
        </div>
        <div className="flex-1">
          <p className="font-semibold">Today’s Progress</p>
          {doses.length ? (
            <p className="mt-1 text-sm text-muted-foreground">
              <b className="text-success">{taken}</b> taken · <b className="text-info">{remaining}</b> remaining of {doses.length}
            </p>
          ) : (
            <p className="mt-1 text-sm text-muted-foreground">No doses scheduled today.</p>
          )}
        </div>
      </Glass>

      <h2 id="upcoming" className="mt-6 mb-3 text-xl font-semibold">Upcoming Doses</h2>
      {doses.length === 0 ? (
        <Glass className="text-center text-sm text-muted-foreground">{active.length ? "Nothing due today." : "Add a medication to see upcoming doses."}</Glass>
      ) : (
        <div className="space-y-3">
          {active
            .filter((m) => timesOn(m, today).length)
            .map((m) => (
              <Glass key={m.id}>
                <div className="mb-2 flex items-center gap-3">
                  <MedIcon photo={m.photo} color={m.color} size="size-10" />
                  <div>
                    <p className="font-semibold">{m.name}</p>
                    <p className="text-xs text-muted-foreground">{m.dosage}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {timesOn(m, today).map((t) => (
                    <DoseRow key={t} med={m} day={today} time={t} now={now} />
                  ))}
                </div>
              </Glass>
            ))}
        </div>
      )}

      <h2 className="mt-6 mb-3 text-xl font-semibold">Medication List</h2>
      {active.length === 0 ? (
        <Glass className="text-center text-sm text-muted-foreground">You haven’t added any medications yet.</Glass>
      ) : (
        <div className="space-y-3">
          {active.map((m) => (
            <Glass key={m.id} className="flex items-start gap-3">
              <MedIcon photo={m.photo} color={m.color} />
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{m.name}</p>
                <p className="text-sm text-muted-foreground">
                  {m.dosage} · {FREQUENCY_LABELS[m.frequency]}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {m.times.map(fmtTime).join(", ")}
                  {m.weekdays.length > 0 && ` · ${m.weekdays.map((d) => WEEKDAYS[d]).join(", ")}`}
                </p>
                {confirmId === m.id && (
                  <div className="mt-2 flex gap-2">
                    <VButton
                      variant="small"
                      className="text-danger"
                      onClick={() => {
                        discontinue(m.id);
                        setConfirmId(null);
                        toast("Medication discontinued — history kept.");
                      }}
                    >
                      Discontinue
                    </VButton>
                    <VButton variant="small" onClick={() => setConfirmId(null)}>
                      Cancel
                    </VButton>
                  </div>
                )}
              </div>
              <button
                aria-label={`Edit ${m.name}`}
                onClick={() => {
                  editMed(m.id);
                  navigate({ to: "/medication/add" });
                }}
                className="grid size-9 place-items-center rounded-full bg-peach text-primary"
              >
                <Pencil className="size-4" />
              </button>
              <button aria-label={`Delete ${m.name}`} onClick={() => setConfirmId(m.id)} className="grid size-9 place-items-center rounded-full bg-danger-soft text-danger">
                <Trash2 className="size-4" />
              </button>
            </Glass>
          ))}
        </div>
      )}
      {past.length > 0 && (
        <div className="mt-3">
          <button onClick={() => setShowPast((s) => !s)} className="text-sm font-semibold text-primary">
            {showPast ? "Hide" : "Show"} medication history ({past.length})
          </button>
          {showPast &&
            past.map((m) => (
              <Glass key={m.id} className="mt-2 flex items-center gap-3 opacity-80">
                <MedIcon photo={m.photo} color={m.color} size="size-10" />
                <div className="flex-1 text-sm">
                  <p className="font-semibold">{m.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {m.dosage} · stopped {m.discontinuedAt && formatDistanceToNow(new Date(m.discontinuedAt), { addSuffix: true })} ·{" "}
                    {Object.entries(logs).filter(([k, l]) => k.startsWith(m.id) && l.status === "taken").length} doses taken
                  </p>
                </div>
              </Glass>
            ))}
        </div>
      )}

      <h2 className="mt-6 mb-3 text-xl font-semibold">Calendar Integration</h2>
      <Glass>
        <div className="flex items-center gap-3">
          <GoogleCalendarIcon className="size-10" />
          <div className="flex-1">
            <p className="font-semibold">Google Calendar</p>
            <p className="text-xs text-muted-foreground">
              {calendar.connected
                ? `Connected · ${calendar.calendar} · ${calendar.lastSync ? `synced ${formatDistanceToNow(new Date(calendar.lastSync), { addSuffix: true })}` : "not synced yet"}`
                : "Not connected"}
            </p>
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <VButton variant="small" onClick={() => navigate({ to: "/medication/calendar" })}>
            Manage Calendar
          </VButton>
          {calendar.connected && (
            <VButton
              variant="small"
              onClick={() => {
                setCalendar({ lastSync: new Date().toISOString() });
                toast.success("Calendar synced");
              }}
            >
              <RefreshCw className="size-4" /> Sync Now
            </VButton>
          )}
        </div>
      </Glass>

      <VButton className="mt-6" onClick={add}>
        <Plus className="size-5" /> Add New Medication
      </VButton>
    </Screen>
  );
}
