import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";
import { Bell, CalendarDays, Clock, Pencil, Repeat } from "lucide-react";
import type { ReactNode } from "react";
import { Glass, GoogleCalendarIcon, MedIcon, Screen, StepHeader, Title, VButton } from "@/components/vessa/ui";
import { FREQUENCY_LABELS, WEEKDAYS, fmtTime, parseDateKey } from "@/lib/med-logic";
import { useMed } from "@/lib/med-store";

export const Route = createFileRoute("/medication/review")({
  head: () => ({
    meta: [
      { title: "Review Your Medication Schedule – VessA" },
      { name: "description", content: "Review your medication information and reminder schedule before saving." },
      { property: "og:title", content: "Review Your Medication Schedule – VessA" },
      { property: "og:description", content: "Review your medication information and reminder schedule before saving." },
    ],
  }),
  component: Review,
});

function Section({ title, to, children }: { title: string; to: "/medication/add" | "/medication/schedule" | "/medication/reminders" | "/medication/calendar"; children: ReactNode }) {
  return (
    <Glass>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-bold tracking-wider text-muted-foreground uppercase">{title}</p>
        <Link to={to} aria-label={`Edit ${title}`} className="grid size-8 place-items-center rounded-full bg-peach text-primary">
          <Pencil className="size-4" />
        </Link>
      </div>
      {children}
    </Glass>
  );
}

const Row = ({ icon: I, children }: { icon: typeof Clock; children: ReactNode }) => (
  <div className="flex items-start gap-2.5 py-1 text-sm">
    <I className="mt-0.5 size-4 shrink-0 text-coral" />
    <span>{children}</span>
  </div>
);

function Review() {
  const navigate = useNavigate();
  const { draft, calendar, saveDraft } = useMed();
  const valid = draft.name && draft.type && draft.dosage && draft.frequency && draft.times.length > 0;
  const prefs = [
    draft.reminders.atTime && "At medication time",
    draft.reminders.before10 && "10 minutes before",
    draft.reminders.repeat && "Repeat if I forget",
    draft.reminders.sound && "Sound on",
  ].filter(Boolean);

  if (!valid)
    return (
      <Screen>
        <StepHeader step={5} back="/medication/calendar" />
        <Title title="Let’s finish your details first." sub="Some medication information is missing." />
        <VButton onClick={() => navigate({ to: "/medication/add" })}>Add Medication Details</VButton>
      </Screen>
    );

  return (
    <Screen>
      <StepHeader step={5} back="/medication/calendar" />
      <Title title="Your medication plan is ready!" sub="Review your medication information and reminder schedule before saving." />
      <div className="space-y-3">
        <Section title="Medication Details" to="/medication/add">
          <div className="flex items-center gap-3">
            <MedIcon photo={draft.photo} color="med-red" size="size-16" />
            <div>
              <p className="font-display text-xl font-semibold">{draft.name}</p>
              <p className="text-sm text-muted-foreground">
                {draft.type} · {draft.dosage}
              </p>
            </div>
          </div>
        </Section>
        <Section title="Schedule" to="/medication/schedule">
          <Row icon={Repeat}>
            {FREQUENCY_LABELS[draft.frequency as keyof typeof FREQUENCY_LABELS]}
            {draft.frequency === "hours" && ` (every ${draft.intervalHours}h)`}
            {draft.weekdays.length > 0 && ` · ${draft.weekdays.map((d) => WEEKDAYS[d]).join(", ")}`}
          </Row>
          <Row icon={Clock}>{draft.times.map(fmtTime).join(" · ")}</Row>
          <Row icon={CalendarDays}>
            Starts {format(parseDateKey(draft.startDate), "MMM d, yyyy")}
            {draft.endDate && ` · Ends ${format(parseDateKey(draft.endDate), "MMM d, yyyy")}`}
          </Row>
        </Section>
        <Section title="Reminder Preferences" to="/medication/reminders">
          <Row icon={Bell}>{prefs.length ? prefs.join(" · ") : "Reminders off"}</Row>
        </Section>
        <Section title="Google Calendar" to="/medication/calendar">
          <div className="flex items-center gap-2.5 text-sm">
            <GoogleCalendarIcon className="size-6" />
            {calendar.connected ? (
              <span className="font-semibold text-success">Connected · {calendar.calendar}</span>
            ) : (
              <span className="text-muted-foreground">Not Connected</span>
            )}
          </div>
        </Section>
      </div>
      <div className="mt-auto space-y-2.5 pt-6">
        <VButton variant="glass" onClick={() => navigate({ to: "/medication/schedule" })}>
          Edit Schedule
        </VButton>
        <VButton
          onClick={() => {
            saveDraft();
            if (calendar.connected) useMed.getState().setCalendar({ lastSync: new Date().toISOString() });
            navigate({ to: "/medication/activated" });
          }}
        >
          Confirm &amp; Save
        </VButton>
      </div>
    </Screen>
  );
}
