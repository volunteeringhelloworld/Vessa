import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CalendarDays, Check, Clock, Plus, X } from "lucide-react";
import { useState } from "react";
import { Field, Glass, Screen, StepHeader, Title, VButton, inputCls } from "@/components/vessa/ui";
import { cn } from "@/lib/utils";
import { DEFAULT_TIMES, FREQUENCY_LABELS, WEEKDAYS, intervalTimes, type Frequency } from "@/lib/med-logic";
import { useMed } from "@/lib/med-store";

export const Route = createFileRoute("/medication/schedule")({
  head: () => ({
    meta: [
      { title: "Set Your Medication Schedule – VessA" },
      { name: "description", content: "Choose how often you take your medication." },
      { property: "og:title", content: "Set Your Medication Schedule – VessA" },
      { property: "og:description", content: "Choose how often you take your medication." },
    ],
  }),
  component: Schedule,
});

const ORDER: Frequency[] = ["once", "twice", "thrice", "hours", "days", "custom"];

function Schedule() {
  const navigate = useNavigate();
  const { draft, updateDraft } = useMed();
  const [error, setError] = useState("");
  const f = draft.frequency;

  const pick = (fr: Frequency) => {
    setError("");
    if (fr === "once" || fr === "twice" || fr === "thrice") updateDraft({ frequency: fr, times: DEFAULT_TIMES[fr] });
    else if (fr === "hours") updateDraft({ frequency: fr, times: intervalTimes(draft.times[0] ?? "08:00", draft.intervalHours) });
    else updateDraft({ frequency: fr, times: draft.times.length ? draft.times : ["09:00"] });
  };

  const setTime = (i: number, v: string) => {
    if (f === "hours") return updateDraft({ times: intervalTimes(v, draft.intervalHours) });
    const t = [...draft.times];
    t[i] = v;
    updateDraft({ times: t });
  };

  const toggleDay = (d: number) =>
    updateDraft({ weekdays: draft.weekdays.includes(d) ? draft.weekdays.filter((x) => x !== d) : [...draft.weekdays, d].sort() });

  const submit = () => {
    if (!f) return setError("Please choose how often you take it.");
    if (!draft.startDate) return setError("Please choose a start date.");
    if (draft.endDate && draft.endDate < draft.startDate) return setError("End date can't be before the start date.");
    if (draft.times.length === 0 || draft.times.some((t) => !t)) return setError("Please set a time for each dose.");
    if (new Set(draft.times).size !== draft.times.length) return setError("Two doses share the same time.");
    if (f === "days" && draft.weekdays.length === 0) return setError("Please select at least one day.");
    navigate({ to: "/medication/reminders" });
  };

  const editable = f === "custom" || f === "days";
  const showWeekdays = f === "days" || f === "custom";

  return (
    <Screen>
      <StepHeader step={2} back="/medication/add" />
      <Title title="When do you need to take it?" sub="Choose how often you take your medication." />

      <div className="grid grid-cols-2 gap-2.5" role="radiogroup">
        {ORDER.map((fr) => (
          <button
            key={fr}
            role="radio"
            aria-checked={f === fr}
            onClick={() => pick(fr)}
            className={cn(
              "glass flex items-center gap-2 rounded-2xl px-3 py-3.5 text-left text-sm font-semibold transition",
              f === fr && "ring-2 ring-coral",
            )}
          >
            <span className={cn("grid size-5 shrink-0 place-items-center rounded-full border-2 border-coral", f === fr && "bg-gradient-primary border-transparent")}>
              {f === fr && <Check className="size-3 text-primary-foreground" />}
            </span>
            {FREQUENCY_LABELS[fr]}
          </button>
        ))}
      </div>

      {f && (
        <div className="mt-5 space-y-4">
          {f === "hours" && (
            <Field label="Every how many hours?">
              <div className="flex gap-2">
                {[2, 4, 6, 8, 12].map((h) => (
                  <button
                    key={h}
                    onClick={() => updateDraft({ intervalHours: h, times: intervalTimes(draft.times[0] ?? "08:00", h) })}
                    className={cn("glass h-11 flex-1 rounded-2xl text-sm font-semibold", draft.intervalHours === h && "bg-gradient-primary text-primary-foreground")}
                  >
                    {h}h
                  </button>
                ))}
              </div>
            </Field>
          )}

          {showWeekdays && (
            <Field label={f === "days" ? "Which days?" : "Days (leave empty for every day)"}>
              <div className="flex gap-1.5">
                {WEEKDAYS.map((d, i) => (
                  <button
                    key={d}
                    aria-pressed={draft.weekdays.includes(i)}
                    onClick={() => toggleDay(i)}
                    className={cn("glass h-11 flex-1 rounded-xl text-xs font-semibold", draft.weekdays.includes(i) && "bg-gradient-primary text-primary-foreground")}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </Field>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Field label="Start Date">
              <div className="relative">
                <input type="date" className={`${inputCls} pl-10 text-sm`} value={draft.startDate} onChange={(e) => updateDraft({ startDate: e.target.value })} />
                <CalendarDays className="pointer-events-none absolute top-3.5 left-3 size-5 text-coral" />
              </div>
            </Field>
            <Field label="End Date (optional)">
              <input type="date" className={`${inputCls} text-sm`} min={draft.startDate} value={draft.endDate} onChange={(e) => updateDraft({ endDate: e.target.value })} />
            </Field>
          </div>

          <Glass className="space-y-2.5">
            <p className="text-sm font-semibold">Time of Each Dose</p>
            {draft.times.map((t, i) => (
              <div key={i} className="flex items-center gap-3">
                <Clock className="size-5 text-coral" />
                <span className="w-16 text-sm text-muted-foreground">Dose {i + 1}</span>
                <input
                  type="time"
                  aria-label={`Dose ${i + 1} time`}
                  disabled={f === "hours" && i > 0}
                  className={`${inputCls} h-11 flex-1`}
                  value={t}
                  onChange={(e) => setTime(i, e.target.value)}
                />
                {editable && draft.times.length > 1 && (
                  <button aria-label="Remove dose" onClick={() => updateDraft({ times: draft.times.filter((_, j) => j !== i) })} className="text-muted-foreground">
                    <X className="size-5" />
                  </button>
                )}
              </div>
            ))}
            {f === "hours" && <p className="text-xs text-muted-foreground">Set the first dose; the rest follow every {draft.intervalHours} hours.</p>}
            {editable && draft.times.length < 8 && (
              <button onClick={() => updateDraft({ times: [...draft.times, "12:00"] })} className="flex items-center gap-1 text-sm font-semibold text-primary">
                <Plus className="size-4" /> Add another time
              </button>
            )}
          </Glass>
        </div>
      )}

      {error && <p className="mt-3 text-sm font-medium text-danger">{error}</p>}
      <div className="mt-auto pt-6">
        <VButton onClick={submit}>Continue</VButton>
      </div>
    </Screen>
  );
}
