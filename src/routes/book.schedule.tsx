import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { addDays, differenceInCalendarWeeks, format, isSameMonth, startOfDay, startOfWeek } from "date-fns";
import { Building2, ChevronLeft, ChevronRight, UserRound, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Screen } from "@/components/vessa/Screen";
import { PageIntro, StepHeader } from "@/components/vessa/TopBar";
import { EmptyState, Hydrated } from "@/components/vessa/bits";
import { cn } from "@/lib/utils";
import { formatFee, getDoctor, getFacility, type ConsultType, type Period } from "@/lib/booking/data";
import { nextAfter } from "@/lib/booking/flow";
import {
  MAX_DAYS_AHEAD,
  formatTime12,
  isDateAvailable,
  isSlotBookable,
  isWithinBookingWindow,
  nextAvailableDate,
  parseISODate,
  slotsFor,
  toISODate,
} from "@/lib/booking/schedule";
import { booking, useBooking } from "@/lib/booking/store";

export const Route = createFileRoute("/book/schedule")({
  head: () => ({
    meta: [
      { title: "Choose a date & time — VessA" },
      { name: "description", content: "Choose a date and time that fits your schedule." },
      { property: "og:title", content: "Choose a date & time — VessA" },
      { property: "og:description", content: "Choose a date and time that fits your schedule." },
    ],
  }),
  component: ChooseSchedule,
});

const WEEK_OPTS = { weekStartsOn: 1 as const };

function ChooseSchedule() {
  const navigate = useNavigate();
  const { draft, appointments, hydrated } = useBooking();
  const doctor = getDoctor(draft.doctorId);
  const facility = getFacility(doctor?.facilityId);
  const now = useMemo(() => new Date(), []);
  const [error, setError] = useState<string | null>(null);

  const firstWeek = useMemo(() => startOfWeek(now, WEEK_OPTS), [now]);
  const lastWeekIndex = differenceInCalendarWeeks(addDays(now, MAX_DAYS_AHEAD), now, WEEK_OPTS);
  const [weekIndex, setWeekIndex] = useState<number | null>(null);

  // Pick the first open day for the user if nothing (or an expired day) is selected.
  useEffect(() => {
    if (!hydrated || !doctor) return;
    if (!draft.date || !isWithinBookingWindow(draft.date, now)) {
      const next = nextAvailableDate(doctor, now, appointments);
      if (next) booking.selectDate(next);
    }
  }, [hydrated, doctor, draft.date, now, appointments]);

  const selectedWeek = draft.date
    ? Math.max(0, differenceInCalendarWeeks(parseISODate(draft.date), now, WEEK_OPTS))
    : 0;
  const week = weekIndex ?? selectedWeek;
  const weekStart = addDays(firstWeek, week * 7);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(weekStart, i);
    const iso = toISODate(d);
    return {
      iso,
      date: d,
      past: startOfDay(d).getTime() < startOfDay(now).getTime(),
      available: doctor ? isDateAvailable(doctor, iso, now, appointments) : false,
    };
  });
  const weekEnd = addDays(weekStart, 6);
  const weekLabel = isSameMonth(weekStart, weekEnd)
    ? format(weekStart, "MMMM yyyy")
    : `${format(weekStart, "MMM")} – ${format(weekEnd, "MMM yyyy")}`;

  const periods = doctor && draft.date ? slotsFor(doctor, draft.date, now, appointments) : [];
  const [tab, setTab] = useState<{ date: string | null; period: Period } | null>(null);
  const defaultPeriod =
    periods.find((p) => draft.time && p.slots.some((s) => s.time === draft.time))?.id ??
    periods.find((p) => p.slots.some((s) => s.status === "available"))?.id ??
    periods[0]?.id;
  const activePeriod = tab && tab.date === draft.date ? tab.period : defaultPeriod;
  const active = periods.find((p) => p.id === activePeriod);
  const dayOpen = periods.some((p) => p.slots.some((s) => s.status === "available"));

  const onContinue = () => {
    if (!doctor) return;
    if (!draft.date) return setError("Please choose a date.");
    if (!draft.time) return setError("Please choose a time.");
    if (!isSlotBookable(doctor, draft.date, draft.time, new Date(), appointments)) {
      booking.selectTime("");
      return setError("That time is no longer available. Please pick another.");
    }
    setError(null);
    navigate({ to: nextAfter("/book/review") });
  };

  return (
    <Screen
      footer={
        doctor && (
          <div className="space-y-2">
            {error && (
              <p role="alert" className="text-center text-sm font-semibold text-destructive">
                {error}
              </p>
            )}
            <Button variant="cta" size="xl" className="w-full" onClick={onContinue}>
              Continue
            </Button>
          </div>
        )
      }
    >
      <StepHeader step={5} back="/book/doctor" />

      <Hydrated>
        {!doctor || !facility ? (
          <>
            <PageIntro title="When works best for you?" subtitle="Choose a date and time that fits your schedule." />
            <EmptyState
              title="Choose a doctor first"
              body="Pick a doctor and we’ll show you the times they’re free."
              action={
                <Button asChild variant="cta" size="xl" className="w-full">
                  <Link to="/book/doctor">Choose a doctor</Link>
                </Button>
              }
            />
          </>
        ) : (
          <>
            <Link
              to="/book/doctor"
              className="glass-tint animate-rise mt-1 flex items-center gap-3 rounded-[26px] border-2! border-coral/60! p-3"
            >
              <img src={doctor.photo} alt="" width={320} height={320} className="size-16 rounded-[20px] object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-lg font-semibold leading-tight text-cocoa">{doctor.name}</p>
                <p className="truncate text-[13px] font-semibold text-primary">{doctor.specialty}</p>
                <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
                  <Building2 className="size-3 shrink-0" /> {facility.name}
                </p>
              </div>
              <span className="self-start rounded-full bg-white/60 px-2.5 py-1 text-[11px] font-bold text-primary">Change</span>
            </Link>

            <PageIntro className="mt-5" title="When works best for you?" subtitle="Choose a date and time that fits your schedule." />

            {doctor.consultTypes.length > 1 && (
              <div role="radiogroup" aria-label="Consultation type" className="glass mb-4 grid grid-cols-2 gap-1 rounded-full p-1">
                {(["in-person", "online"] as ConsultType[]).map((c) => {
                  const on = draft.consultType === c;
                  return (
                    <button
                      key={c}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => booking.setConsultType(c)}
                      className={cn(
                        "flex items-center justify-center gap-1.5 rounded-full py-2 text-[13px] font-bold transition-all",
                        on ? "bg-cta text-cocoa" : "text-muted-foreground hover:text-cocoa",
                      )}
                    >
                      {c === "online" ? <Video className="size-3.5" /> : <UserRound className="size-3.5" />}
                      {c === "online" ? "Online" : "In-person"}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Date strip */}
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-cocoa">{weekLabel}</h2>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  aria-label="Previous week"
                  disabled={week <= 0}
                  onClick={() => setWeekIndex(week - 1)}
                  className="glass grid size-9 place-items-center rounded-full text-cocoa disabled:opacity-40"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <button
                  type="button"
                  aria-label="Next week"
                  disabled={week >= lastWeekIndex}
                  onClick={() => setWeekIndex(week + 1)}
                  className="glass grid size-9 place-items-center rounded-full text-cocoa disabled:opacity-40"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
            <div role="radiogroup" aria-label="Appointment date" className="grid grid-cols-7 gap-1.5">
              {days.map((d) => {
                const selected = draft.date === d.iso;
                return (
                  <button
                    key={d.iso}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    aria-label={`${format(d.date, "EEEE d MMMM")}${d.available ? "" : ", unavailable"}`}
                    disabled={!d.available}
                    onClick={() => {
                      booking.selectDate(d.iso);
                      setError(null);
                    }}
                    className={cn(
                      "flex flex-col items-center rounded-2xl py-2 transition-all active:scale-95",
                      selected
                        ? "bg-cta text-cocoa"
                        : d.available
                          ? "glass text-cocoa"
                          : "bg-white/25 text-muted-foreground/60",
                    )}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider">{format(d.date, "EEE")}</span>
                    <span className={cn("text-lg font-extrabold leading-tight", !d.available && "line-through decoration-1")}>
                      {format(d.date, "d")}
                    </span>
                    <span className="text-[10px] font-semibold">{format(d.date, "MMM")}</span>
                    <span
                      className={cn(
                        "mt-1 size-1.5 rounded-full",
                        d.available ? (selected ? "bg-cocoa" : "bg-success") : "bg-transparent",
                      )}
                    />
                  </button>
                );
              })}
            </div>
            {days.every((d) => !d.available) && (
              <p className="mt-2 text-center text-xs font-semibold text-muted-foreground">
                No open days this week — try the next week.
              </p>
            )}

            {/* Time slots */}
            <h2 className="mt-6 text-lg font-semibold text-cocoa">Available Time Slots</h2>
            {!draft.date ? (
              <p className="glass mt-3 rounded-2xl p-4 text-center text-sm text-muted-foreground">
                Choose a date to see available times.
              </p>
            ) : (
              <>
                <p className="mt-0.5 text-[13px] text-muted-foreground">{format(parseISODate(draft.date), "EEEE, d MMMM yyyy")}</p>
                <div role="tablist" aria-label="Time of day" className="glass mt-3 flex gap-1 rounded-full p-1">
                  {periods.map((p) => {
                    const on = p.id === activePeriod;
                    const open = p.slots.filter((s) => s.status === "available").length;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        role="tab"
                        aria-selected={on}
                        onClick={() => setTab({ date: draft.date, period: p.id })}
                        className={cn(
                          "flex flex-1 flex-col items-center rounded-full py-1.5 text-[13px] font-bold transition-all",
                          on ? "bg-cta text-cocoa" : "text-muted-foreground hover:text-cocoa",
                        )}
                      >
                        {p.label}
                        <span className="text-[10px] font-semibold opacity-80">{open ? `${open} open` : "Full"}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-3 flex items-center gap-4 px-1 text-[11px] font-semibold text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="size-3 rounded-[5px] border border-coral/70 bg-white/70" /> Available
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="bg-cta size-3 rounded-[5px]" /> Chosen
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="size-3 rounded-[5px] bg-muted-foreground/25" /> Booked
                  </span>
                </div>

                {!dayOpen ? (
                  <p className="glass mt-3 rounded-2xl p-4 text-center text-sm text-muted-foreground">
                    No times left on this day. Please choose another date.
                  </p>
                ) : (
                  active && (
                    <div role="radiogroup" aria-label={`${active.label} times`} className="mt-3 grid grid-cols-3 gap-2">
                      {active.slots.map((s) => {
                        const chosen = draft.time === s.time;
                        const free = s.status === "available";
                        return (
                          <button
                            key={s.time}
                            type="button"
                            role="radio"
                            aria-checked={chosen}
                            aria-label={`${formatTime12(s.time)}${free ? "" : s.status === "past" ? ", passed" : ", booked"}`}
                            disabled={!free}
                            onClick={() => {
                              booking.selectTime(s.time);
                              setError(null);
                            }}
                            className={cn(
                              "rounded-full py-2.5 text-sm font-bold transition-all active:scale-95",
                              chosen
                                ? "bg-cta text-cocoa"
                                : free
                                  ? "border border-coral/70 bg-white/60 text-cocoa hover:bg-white/80"
                                  : "bg-muted-foreground/15 text-muted-foreground/70 line-through",
                            )}
                          >
                            {formatTime12(s.time)}
                          </button>
                        );
                      })}
                    </div>
                  )
                )}
              </>
            )}

            <div className="mt-5 flex items-center justify-between rounded-2xl bg-white/45 px-4 py-3">
              <span className="text-sm font-semibold text-muted-foreground">Consultation fee</span>
              <span className="text-base font-extrabold text-cocoa">{formatFee(doctor.fee)}</span>
            </div>
          </>
        )}
      </Hydrated>
    </Screen>
  );
}
