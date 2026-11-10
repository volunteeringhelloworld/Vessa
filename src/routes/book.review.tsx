import { useEffect, useState, type ReactNode } from "react";
import { createFileRoute, Link, useNavigate, type LinkProps } from "@tanstack/react-router";
import { Building2, CalendarDays, Clock, HeartPulse, Loader2, Paperclip, PenLine, Stethoscope, Video, Wallet } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Screen } from "@/components/vessa/Screen";
import { PageIntro, StepHeader } from "@/components/vessa/TopBar";
import { EmptyState, Hydrated, SectionTitle } from "@/components/vessa/bits";
import { cn } from "@/lib/utils";
import { categoryLabel, formatFee, getDoctor, getFacility } from "@/lib/booking/data";
import { formatLongDate, formatTime12 } from "@/lib/booking/schedule";
import { notifyBooked } from "@/lib/booking/notify";
import { booking, confirmBooking, missingFields, useBooking, type MissingField } from "@/lib/booking/store";

export const Route = createFileRoute("/book/review")({
  head: () => ({
    meta: [
      { title: "Review your appointment — VessA" },
      { name: "description", content: "Take a moment to review your appointment details before confirming." },
      { property: "og:title", content: "Review your appointment — VessA" },
      { property: "og:description", content: "Take a moment to review your appointment details before confirming." },
    ],
  }),
  component: Review,
});

const MISSING_TEXT: Record<MissingField, string> = {
  care: "type of care",
  reason: "reason for visit",
  facility: "hospital or clinic",
  doctor: "doctor",
  schedule: "date and time",
};

function Review() {
  const navigate = useNavigate();
  const state = useBooking();
  const { draft, hydrated } = state;
  const doctor = getDoctor(draft.doctorId);
  const facility = getFacility(draft.facilityId);
  const [submitting, setSubmitting] = useState(false);
  const [problem, setProblem] = useState<"slot-taken" | "incomplete" | null>(null);

  // Arriving here ends any "edit from review" detour.
  useEffect(() => {
    if (hydrated) booking.setEditingFromReview(false);
  }, [hydrated]);

  const missing = hydrated ? missingFields(state) : [];
  const nothingStarted =
    hydrated && draft.categories.length === 0 && !draft.reason && !draft.facilityId && !draft.doctorId;

  const onConfirm = async () => {
    if (submitting) return;
    if (missing.length) {
      setProblem("incomplete");
      return;
    }
    setSubmitting(true);
    setProblem(null);
    const result = await confirmBooking();
    setSubmitting(false);
    if (result.ok) {
      void notifyBooked(result.appointment);
      navigate({ to: "/book/confirmed" });
      return;
    }
    setProblem(result.error);
    if (result.error === "slot-taken") toast.error("That time was just taken. Please choose another.");
  };

  return (
    <Screen
      footer={
        hydrated &&
        !nothingStarted && (
          <div className="space-y-2">
            {problem === "incomplete" && missing.length > 0 && (
              <p role="alert" className="text-center text-sm font-semibold text-destructive">
                Please add your {missing.map((m) => MISSING_TEXT[m]).join(", ")}.
              </p>
            )}
            {problem === "slot-taken" && (
              <div role="alert" className="glass flex items-center gap-3 rounded-2xl p-3">
                <p className="flex-1 text-sm font-semibold text-destructive">That time is no longer available.</p>
                <Button asChild variant="soft" size="pill" className="h-9">
                  <EditLink to="/book/schedule">Pick a new time</EditLink>
                </Button>
              </div>
            )}
            <Button variant="cta" size="xl" className="w-full" onClick={onConfirm} disabled={submitting} aria-busy={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="animate-spin" /> Confirming…
                </>
              ) : (
                "Confirm Appointment"
              )}
            </Button>
          </div>
        )
      }
    >
      <StepHeader step={6} back="/book/schedule" />
      <PageIntro title="Everything looks good!" subtitle="Take a moment to review your appointment details." />

      <Hydrated>
        {nothingStarted ? (
          <EmptyState
            title="No appointment in progress"
            body="Start a new booking and your details will appear here to review."
            action={
              <Button asChild variant="cta" size="xl" className="w-full">
                <Link to="/book/care">Book New Appointment</Link>
              </Button>
            }
          />
        ) : (
          <>
            {/* Doctor summary */}
            <section className="glass-strong animate-rise rounded-[28px] p-4">
              <div className="flex items-center gap-3">
                {doctor ? (
                  <img src={doctor.photo} alt={doctor.name} width={320} height={320} className="size-16 rounded-full object-cover ring-2 ring-coral/60" />
                ) : (
                  <span className="grid size-16 place-items-center rounded-full bg-muted">
                    <Stethoscope className="size-6 text-muted-foreground" />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className={cn("truncate font-display text-xl font-semibold leading-tight", doctor ? "text-cocoa" : "text-destructive")}>
                    {doctor?.name ?? "No doctor chosen"}
                  </p>
                  {doctor && <p className="truncate text-[13px] font-semibold text-primary">{doctor.specialty}</p>}
                </div>
                <EditLink to="/book/doctor" label="Edit doctor" />
              </div>

              <div className="my-3.5 h-px bg-coral/30" />

              <Row icon={CalendarDays} label="Date" to="/book/schedule" editLabel="Edit date and time" missing={missing.includes("schedule")}>
                {draft.date && !missing.includes("schedule") ? formatLongDate(draft.date) : "Choose a date"}
              </Row>
              <Row icon={Clock} label="Time" missing={missing.includes("schedule")}>
                {draft.time && !missing.includes("schedule") ? (
                  <span className="flex items-center gap-1.5">
                    {formatTime12(draft.time)}
                    <span className="rounded-full bg-white/70 px-2 py-0.5 text-[11px] font-bold text-primary">
                      {draft.consultType === "online" ? (
                        <span className="flex items-center gap-1">
                          <Video className="size-3" /> Online
                        </span>
                      ) : (
                        "In-person"
                      )}
                    </span>
                  </span>
                ) : (
                  "Choose a time"
                )}
              </Row>
              <Row icon={Building2} label="Hospital / Clinic" to="/book/facilities" editLabel="Edit hospital or clinic" missing={!facility}>
                {facility?.name ?? "Choose a hospital or clinic"}
              </Row>
              <Row icon={Wallet} label="Consultation fee">
                {doctor ? formatFee(doctor.fee) : "—"}
              </Row>
            </section>

            <SectionTitle>Visit details</SectionTitle>
            <section className="glass space-y-3 rounded-[24px] p-4">
              <Row icon={HeartPulse} label="Type of care" to="/book/care" editLabel="Edit type of care" missing={draft.categories.length === 0}>
                {draft.categories.length ? draft.categories.map(categoryLabel).join(", ") : "Choose the care you need"}
              </Row>
              <Row icon={Stethoscope} label="Reason for visit" to="/book/reason" editLabel="Edit reason for visit" missing={!draft.reason}>
                {draft.reason ?? "Choose a reason"}
                {draft.concern && <span className="mt-1 block text-[13px] font-medium text-muted-foreground">“{draft.concern}”</span>}
                {draft.attachments.length > 0 && (
                  <span className="mt-1 flex items-center gap-1 text-[12px] font-semibold text-muted-foreground">
                    <Paperclip className="size-3" /> {draft.attachments.length} file{draft.attachments.length > 1 ? "s" : ""} attached
                  </span>
                )}
              </Row>
            </section>

            <SectionTitle>Note for your doctor</SectionTitle>
            <label className="glass flex gap-3 rounded-3xl px-4 py-3.5 focus-within:ring-2 focus-within:ring-ring">
              <PenLine className="mt-0.5 size-5 shrink-0 text-primary" />
              <span className="sr-only">Add a note for your doctor</span>
              <textarea
                value={draft.note}
                onChange={(e) => booking.setNote(e.target.value)}
                placeholder="Add a note for your doctor (optional)…"
                rows={2}
                maxLength={300}
                className="w-full resize-none bg-transparent text-[15px] text-cocoa placeholder:text-muted-foreground focus:outline-none"
              />
            </label>
            <p className="mt-1.5 px-2 text-xs text-muted-foreground">
              Your appointment isn’t booked until you tap Confirm Appointment.
            </p>
          </>
        )}
      </Hydrated>
    </Screen>
  );
}

type EditTarget = Extract<NonNullable<LinkProps["to"]>, "/book/care" | "/book/reason" | "/book/facilities" | "/book/doctor" | "/book/schedule">;

/** Opens a step and remembers to come back to the review screen afterwards. */
function EditLink({
  to,
  label,
  children,
  className,
}: {
  to: EditTarget;
  label?: string | undefined;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <Link
      to={to}
      aria-label={label}
      onClick={() => booking.setEditingFromReview(true)}
      className={cn(
        !children && "shrink-0 rounded-full bg-white/65 px-3 py-1.5 text-xs font-bold text-primary transition-colors hover:bg-white/90",
        className,
      )}
    >
      {children ?? "Edit"}
    </Link>
  );
}

function Row({
  icon: Icon,
  label,
  to,
  editLabel,
  missing,
  children,
}: {
  icon: typeof Clock;
  label: string;
  to?: EditTarget;
  editLabel?: string;
  missing?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 py-1.5">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-peach text-primary">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
        <div className={cn("text-[15px] font-bold", missing ? "text-destructive" : "text-cocoa")}>{children}</div>
      </div>
      {to && <EditLink to={to} label={editLabel} />}
    </div>
  );
}
