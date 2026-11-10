import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, CalendarDays, Clock, FileText, HeartPulse, MapPin, NotebookPen, Phone, Stethoscope, Video, Wallet } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Screen } from "@/components/vessa/Screen";
import { TopBar } from "@/components/vessa/TopBar";
import { EmptyState, Hydrated, SectionTitle } from "@/components/vessa/bits";
import { AddToCalendarMenu, DirectionsButton, StatusBadge, isUpcoming } from "@/components/vessa/appointment-bits";
import { categoryLabel, formatFee, getDoctor, getFacility, mapsDirectionsUrl } from "@/lib/booking/data";
import { formatLongDate, formatTime12 } from "@/lib/booking/schedule";
import { booking, useBooking } from "@/lib/booking/store";

export const Route = createFileRoute("/appointments/$appointmentId")({
  head: () => ({
    meta: [
      { title: "Appointment details — VessA" },
      { name: "description", content: "Date, time, place and visit details for your VessA appointment." },
      { property: "og:title", content: "Appointment details — VessA" },
      { property: "og:description", content: "Date, time, place and visit details for your VessA appointment." },
    ],
  }),
  component: AppointmentDetails,
});

function AppointmentDetails() {
  const { appointmentId } = Route.useParams();
  const { appointments } = useBooking();
  const a = appointments.find((x) => x.id === appointmentId);
  const doctor = getDoctor(a?.doctorId);
  const facility = getFacility(a?.facilityId);
  const upcoming = a ? isUpcoming(a) : false;

  return (
    <Screen nav>
      <TopBar back="/appointments/history" center={<span className="font-display text-lg font-semibold text-cocoa">Appointment</span>} />

      <Hydrated>
        {!a ? (
          <EmptyState
            title="Appointment not found"
            body="It may have been removed from this device."
            action={
              <Button asChild variant="cta" size="xl" className="w-full">
                <Link to="/appointments/history">See my appointments</Link>
              </Button>
            }
          />
        ) : (
          <>
            <section className="glass-strong animate-rise mt-1 rounded-[28px] p-4">
              <div className="flex items-center gap-3">
                {doctor && <img src={doctor.photo} alt={doctor.name} width={320} height={320} className="size-16 rounded-full object-cover ring-2 ring-coral/60" />}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-xl font-semibold leading-tight text-cocoa">{doctor?.name}</p>
                  <p className="truncate text-[13px] font-semibold text-primary">{doctor?.specialty}</p>
                  <div className="mt-1">
                    <StatusBadge status={a.status} past={!upcoming && a.status === "confirmed"} />
                  </div>
                </div>
              </div>
              <div className="my-3.5 h-px bg-coral/30" />
              <Line icon={CalendarDays} label="Date" value={formatLongDate(a.date)} />
              <Line icon={Clock} label="Time" value={`${formatTime12(a.time)} · ${a.consultType === "online" ? "Online" : "In-person"}`} />
              <Line icon={Wallet} label="Consultation fee" value={formatFee(a.fee)} />
              <p className="mt-2 rounded-xl bg-white/55 px-3 py-2 text-center text-xs font-semibold text-muted-foreground">
                Reference <span className="font-mono font-bold tracking-wider text-cocoa">{a.ref}</span>
              </p>
            </section>

            {a.status === "confirmed" && upcoming && (
              <div className="mt-3 grid grid-cols-2 gap-2">
                <AddToCalendarMenu appointment={a} />
                {facility && <DirectionsButton href={mapsDirectionsUrl(facility)} />}
              </div>
            )}

            {facility && (
              <>
                <SectionTitle>Hospital / Clinic</SectionTitle>
                <Link to="/facility/$facilityId" params={{ facilityId: facility.id }} className="glass flex gap-3 rounded-[24px] p-3">
                  <img src={facility.image} alt="" className="size-16 rounded-2xl object-cover" loading="lazy" />
                  <div className="min-w-0 flex-1 text-sm">
                    <p className="flex items-center gap-1.5 font-bold text-cocoa">
                      <Building2 className="size-3.5 text-primary" /> {facility.name}
                    </p>
                    <p className="mt-0.5 flex gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="mt-0.5 size-3 shrink-0" /> {facility.address}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Phone className="size-3 shrink-0" /> {facility.phone}
                    </p>
                  </div>
                </Link>
              </>
            )}

            <SectionTitle>Visit details</SectionTitle>
            <section className="glass rounded-[24px] p-4">
              <Line icon={HeartPulse} label="Type of care" value={a.categories.map(categoryLabel).join(", ")} />
              <Line icon={Stethoscope} label="Reason for visit" value={a.reason} />
              {a.concern && <Line icon={NotebookPen} label="Your concern" value={a.concern} />}
              {a.note && <Line icon={NotebookPen} label="Note for your doctor" value={a.note} />}
              {a.consultType === "online" && (
                <Line icon={Video} label="Online visit" value="Your doctor will send a video link before the appointment." />
              )}
              {a.attachments.length > 0 && (
                <div className="py-1.5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Attachments</p>
                  <ul className="mt-1 space-y-1">
                    {a.attachments.map((f) => (
                      <li key={f.id} className="flex items-center gap-2 text-sm font-semibold text-cocoa">
                        <FileText className="size-3.5 text-primary" />
                        <span className="truncate">{f.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>

            {a.status === "confirmed" && upcoming && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="pill" className="mt-5 w-full font-bold text-destructive hover:bg-destructive/10 hover:text-destructive">
                    Cancel appointment
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="glass-strong max-w-[360px] rounded-[28px]">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="font-display text-xl text-cocoa">Cancel this appointment?</AlertDialogTitle>
                    <AlertDialogDescription>
                      {doctor?.name} on {formatLongDate(a.date)} at {formatTime12(a.time)}. The time will be released for other patients.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="gap-2">
                    <AlertDialogCancel className="rounded-full">Keep it</AlertDialogCancel>
                    <AlertDialogAction
                      className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={() => {
                        booking.cancelAppointment(a.id);
                        toast("Appointment cancelled");
                      }}
                    >
                      Yes, cancel
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </>
        )}
      </Hydrated>
    </Screen>
  );
}

function Line({ icon: Icon, label, value }: { icon: typeof Clock; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 py-1.5">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-peach text-primary">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="text-[15px] font-bold text-cocoa">{value}</p>
      </div>
    </div>
  );
}
