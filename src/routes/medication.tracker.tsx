import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { addDays, addMonths, endOfMonth, format, getDay, isSameMonth, startOfMonth } from "date-fns";
import { ChevronLeft, ChevronRight, Clock, Flame } from "lucide-react";
import { useState } from "react";
import { DoseRow } from "@/components/vessa/DoseRow";
import { AppHeader, Capsule, Glass, MED_BG, MedIcon, Screen, StreakPet, VButton, useNow } from "@/components/vessa/ui";
import { cn } from "@/lib/utils";
import { computeStreak, countOnTime, countdown, dateKey, fmtTime, nextDose, parseDateKey, timesOn } from "@/lib/med-logic";
import { useMed } from "@/lib/med-store";

export const Route = createFileRoute("/medication/tracker")({
  head: () => ({
    meta: [
      { title: "Medication & Streak – VessA" },
      { name: "description", content: "Track today’s doses, your calendar and your medication streak." },
      { property: "og:title", content: "Medication & Streak – VessA" },
      { property: "og:description", content: "Track today’s doses, your calendar and your medication streak." },
    ],
  }),
  component: Tracker,
});

function Tracker() {
  const navigate = useNavigate();
  const { meds, logs, petCheer, resetDraft } = useMed();
  const now = useNow(30000);
  const today = dateKey(now);
  const [tab, setTab] = useState<"today" | "calendar">("today");
  const [sel, setSel] = useState(today);
  const [month, setMonth] = useState(() => startOfMonth(now));
  const selDate = parseDateKey(sel);

  const streak = computeStreak(meds, logs, now);
  const onTime = countOnTime(logs);
  const next = nextDose(meds, logs, now);
  const dayMeds = meds.map((m) => ({ m, times: timesOn(m, sel) })).filter((x) => x.times.length);

  const go = (d: Date) => {
    setSel(dateKey(d));
    setMonth(startOfMonth(d));
  };

  const first = startOfMonth(month);
  const cells: (Date | null)[] = [...Array(getDay(first)).fill(null)];
  for (let d = first; d <= endOfMonth(month); d = addDays(d, 1)) cells.push(d);

  return (
    <Screen nav>
      <AppHeader />
      <h1 className="mt-4 text-[30px] font-semibold">Medication</h1>

      <div className="glass mt-3 grid grid-cols-2 rounded-full p-1" role="tablist">
        {(["today", "calendar"] as const).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => {
              setTab(t);
              if (t === "today") go(now);
            }}
            className={cn("h-10 rounded-full text-sm font-semibold capitalize transition", tab === t ? "bg-gradient-primary text-primary-foreground shadow-glow" : "text-muted-foreground")}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="glass mt-3 flex items-center gap-2 rounded-full p-1.5">
        <button aria-label="Previous day" onClick={() => go(addDays(selDate, -1))} className="grid size-9 place-items-center rounded-full">
          <ChevronLeft className="size-5" />
        </button>
        <span className="flex-1 text-center text-sm font-semibold">
          {format(selDate, "MMMM d")}
          {sel === today && ", Today"}
        </span>
        {sel !== today && (
          <button onClick={() => go(now)} className="rounded-full bg-peach px-3 py-1 text-xs font-semibold text-primary">
            Today
          </button>
        )}
        <button aria-label="Next day" onClick={() => go(addDays(selDate, 1))} className="grid size-9 place-items-center rounded-full">
          <ChevronRight className="size-5" />
        </button>
      </div>

      {tab === "calendar" && (
        <Glass className="mt-3">
          <div className="mb-3 flex items-center justify-between">
            <button aria-label="Previous month" onClick={() => setMonth(addMonths(month, -1))} className="grid size-8 place-items-center rounded-full bg-cream">
              <ChevronLeft className="size-4" />
            </button>
            <p className="font-display text-lg font-semibold">{format(month, "MMMM yyyy")}</p>
            <button aria-label="Next month" onClick={() => setMonth(addMonths(month, 1))} className="grid size-8 place-items-center rounded-full bg-cream">
              <ChevronRight className="size-4" />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-y-1 text-center">
            {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
              <span key={i} className="pb-1 text-xs font-semibold text-muted-foreground">
                {d}
              </span>
            ))}
            {cells.map((d, i) => {
              if (!d || !isSameMonth(d, month)) return <span key={i} />;
              const k = dateKey(d);
              const dots = meds.filter((m) => timesOn(m, k).length > 0).slice(0, 4);
              return (
                <button
                  key={k}
                  onClick={() => setSel(k)}
                  className={cn("mx-auto flex h-11 w-10 flex-col items-center justify-center rounded-xl text-sm", k === sel && "bg-peach font-bold", k === today && "text-primary font-bold ring-1 ring-coral")}
                >
                  {d.getDate()}
                  <span className="mt-0.5 flex h-1.5 gap-0.5">
                    {dots.map((m) => (
                      <span key={m.id} className={cn("size-1.5 rounded-full", MED_BG[m.color])} />
                    ))}
                  </span>
                </button>
              );
            })}
          </div>
        </Glass>
      )}

      <Glass className="mt-4 overflow-hidden pt-6 pb-5 text-center">
        <StreakPet size={200} cheer={petCheer} />
        <p className="font-display mt-3 text-2xl font-semibold">{meds.length === 0 ? "Let’s get started!" : streak > 0 ? "You're doing amazing!" : "Every dose counts!"}</p>
        <div className="mt-3 flex justify-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full bg-butter px-3 py-1.5 text-sm font-semibold">
            <Flame className="size-4 text-coral" /> {streak} day streak
          </span>
          <span className="rounded-full bg-success-soft px-3 py-1.5 text-sm font-semibold text-success">{onTime} doses on time</span>
        </div>
      </Glass>

      <h2 className="mt-6 mb-3 text-xl font-semibold">{sel === today ? "Today's Medication" : `Medication · ${format(selDate, "MMM d")}`}</h2>
      {meds.length === 0 ? (
        <Glass className="text-center text-sm text-muted-foreground">No medications yet. Set up a reminder to see your doses here.</Glass>
      ) : dayMeds.length === 0 ? (
        <Glass className="text-center text-sm text-muted-foreground">No doses scheduled for this day — it won’t affect your streak.</Glass>
      ) : (
        <div className="space-y-3">
          {dayMeds.map(({ m, times }) => (
            <Glass key={m.id}>
              <div className="mb-3 flex items-center gap-3">
                <MedIcon photo={m.photo} color={m.color} />
                <div>
                  <p className="font-semibold">{m.name}</p>
                  <p className="text-sm text-muted-foreground">{m.dosage}</p>
                </div>
              </div>
              <div className="space-y-2">
                {times.map((t) => (
                  <DoseRow key={t} med={m} day={sel} time={t} now={now} />
                ))}
              </div>
            </Glass>
          ))}
        </div>
      )}

      {next && (
        <div className="mt-5 overflow-hidden rounded-3xl bg-gradient-primary p-5 text-primary-foreground shadow-glow">
          <div className="flex items-start justify-between">
            <div>
              <p className="flex items-center gap-1.5 text-sm font-semibold opacity-90">
                <Clock className="size-4" /> Next Reminder
              </p>
              <p className="font-display mt-1 text-3xl font-semibold">{fmtTime(next.time)}</p>
              <p className="mt-1 text-sm opacity-90">
                {next.med.name} · {next.med.dosage}
                {next.day !== today && ` · ${format(next.when, "MMM d")}`}
              </p>
            </div>
            <Capsule className="w-16 rotate-[-25deg]" />
          </div>
          <div className="glass mt-4 inline-flex rounded-full px-3 py-1.5 text-sm font-bold text-ink">{countdown(next.when, now)}</div>
        </div>
      )}

      <div className="mt-6 space-y-2.5">
        <VButton onClick={() => navigate({ to: "/medication/dashboard" })}>View Medication Schedule</VButton>
        <VButton
          variant="glass"
          onClick={() => {
            resetDraft();
            navigate({ to: "/medication/add" });
          }}
        >
          Set Up New Medication Reminder
        </VButton>
      </div>
    </Screen>
  );
}
