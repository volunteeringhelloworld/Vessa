import { createFileRoute, Link } from "@tanstack/react-router";
import { BadgeCheck, Building2, CalendarDays, ChevronRight, Hash, House, Stethoscope } from "lucide-react";
import mascot from "@/assets/mascot-success.png";
import { Button } from "@/components/ui/button";
import { Screen } from "@/components/vessa/Screen";
import { EmptyState, Hydrated } from "@/components/vessa/bits";
import { AddToCalendarMenu, DirectionsButton } from "@/components/vessa/appointment-bits";
import { getDoctor, getFacility, mapsDirectionsUrl } from "@/lib/booking/data";
import { formatLongDate, formatTime12 } from "@/lib/booking/schedule";
import { useBooking } from "@/lib/booking/store";

export const Route = createFileRoute("/book/confirmed")({
  head: () => ({
    meta: [
      { title: "You’re all set! — VessA" },
      { name: "description", content: "Your appointment has been successfully scheduled." },
      { property: "og:title", content: "You’re all set! — VessA" },
      { property: "og:description", content: "Your appointment has been successfully scheduled." },
    ],
  }),
  component: Confirmed,
});

function Confirmed() {
  const { appointments, lastConfirmedId } = useBooking();
  const appointment = appointments.find((a) => a.id === lastConfirmedId && a.status === "confirmed");
  const doctor = getDoctor(appointment?.doctorId);
  const facility = getFacility(appointment?.facilityId);

  return (
    <Screen className="safe-top">
      <Hydrated>
        {!appointment ? (
          <EmptyState
            title="No new booking yet"
            body="Once you confirm an appointment, its details will show here."
            action={
              <Button asChild variant="cta" size="xl" className="w-full">
                <Link to="/appointments">Go to Appointments</Link>
              </Button>
            }
          />
        ) : (
          <>
            <div className="relative mx-auto mt-4 grid w-[62%] max-w-[240px] place-items-center">
              <div className="glass-tint absolute inset-[6%] rounded-full" />
              <img
                src={mascot}
                alt="VessA heart mascot cheering with a calendar"
                width={560}
                height={525}
                className="animate-float relative w-full drop-shadow-[0_18px_22px_oklch(0.6_0.14_30/0.28)]"
              />
            </div>

            <section className="animate-rise mt-4 text-center">
              <h1 className="text-[32px] font-semibold leading-[1.1] text-cocoa">You’re all set!</h1>
              <p className="mx-auto mt-2 max-w-[310px] text-[15px] leading-relaxed text-muted-foreground">
                Your appointment has been successfully scheduled. We’ll help you stay prepared for your visit.
              </p>
            </section>

            <Link
              to="/appointments/$appointmentId"
              params={{ appointmentId: appointment.id }}
              aria-label="View appointment details"
              className="glass-tint mt-5 flex items-center gap-3 rounded-[26px] border-2! border-coral/60! p-3.5 transition-transform active:scale-[0.99]"
            >
              <span className="bg-cta grid size-12 shrink-0 place-items-center rounded-2xl text-cocoa">
                <CalendarDays className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-lg font-semibold leading-tight text-cocoa">
                  {formatLongDate(appointment.date)}
                </span>
                <span className="block text-[15px] font-bold text-primary">{formatTime12(appointment.time)}</span>
              </span>
              <ChevronRight className="size-5 text-cocoa" />
            </Link>

            <dl className="glass mt-3 space-y-2.5 rounded-[24px] p-4 text-sm">
              <Item icon={Stethoscope} label="Doctor" value={doctor?.name ?? "—"} />
              <Item icon={Building2} label="Hospital / Clinic" value={facility?.name ?? "—"} />
              <Item icon={Hash} label="Reference number" value={appointment.ref} mono />
              <div className="flex items-center gap-3">
                <BadgeCheck className="size-4 shrink-0 text-success" />
                <dt className="flex-1 font-semibold text-muted-foreground">Booking status</dt>
                <dd className="rounded-full bg-success/15 px-2.5 py-1 text-xs font-bold text-success">Confirmed</dd>
              </div>
            </dl>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <AddToCalendarMenu appointment={appointment} />
              {facility && <DirectionsButton href={mapsDirectionsUrl(facility)} />}
            </div>

            <div className="mt-6 space-y-3">
              <Button asChild variant="cta" size="xl" className="w-full">
                <Link to="/appointments/$appointmentId" params={{ appointmentId: appointment.id }}>
                  View My Appointment
                </Link>
              </Button>
              <Button asChild variant="glass" size="xl" className="w-full">
                <Link to="/home">
                  <House /> Back to Home
                </Link>
              </Button>
            </div>
          </>
        )}
      </Hydrated>
    </Screen>
  );
}

function Item({ icon: Icon, label, value, mono }: { icon: typeof Hash; label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="size-4 shrink-0 text-primary" />
      <dt className="flex-1 font-semibold text-muted-foreground">{label}</dt>
      <dd className={mono ? "font-mono text-[13px] font-bold tracking-wider text-cocoa" : "text-right font-bold text-cocoa"}>{value}</dd>
    </div>
  );
}
