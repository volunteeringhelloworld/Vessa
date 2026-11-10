import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarClock, CalendarPlus, ChevronRight } from "lucide-react";
import mascot from "@/assets/mascot-welcome.png";
import { Button } from "@/components/ui/button";
import { Screen } from "@/components/vessa/Screen";
import { TopBar } from "@/components/vessa/TopBar";
import { VessaLogo } from "@/components/vessa/Logo";
import { isUpcoming } from "@/components/vessa/appointment-bits";
import { booking, useBooking } from "@/lib/booking/store";

export const Route = createFileRoute("/appointments/")({
  head: () => ({
    meta: [
      { title: "Find the right care — VessA" },
      { name: "description", content: "Find the right specialist and schedule an appointment that fits your needs." },
      { property: "og:title", content: "Find the right care — VessA" },
      { property: "og:description", content: "Find the right specialist and schedule an appointment that fits your needs." },
    ],
  }),
  component: FindCare,
});

function FindCare() {
  const { appointments, hydrated } = useBooking();
  const upcoming = hydrated ? appointments.filter((a) => isUpcoming(a)).length : 0;

  return (
    <Screen nav>
      <TopBar back="/home" center={<VessaLogo />} />

      <section className="animate-rise mt-4 text-center">
        <h1 className="mx-auto max-w-[300px] text-[32px] font-semibold leading-[1.1] text-cocoa">
          Let’s find the right care for you.
        </h1>
        <p className="mx-auto mt-3 max-w-[300px] text-[15px] leading-relaxed text-muted-foreground">
          Find the right specialist and schedule an appointment that fits your needs.
        </p>
      </section>

      <div className="relative mx-auto my-6 grid aspect-square w-[78%] max-w-[300px] place-items-center">
        <div className="glass-tint absolute inset-0 rounded-full" />
        <div className="absolute inset-6 rounded-full bg-white/35" />
        <img
          src={mascot}
          alt="VessA heart mascot waving with a stethoscope"
          width={535}
          height={560}
          className="animate-float relative w-[78%] drop-shadow-[0_18px_22px_oklch(0.6_0.14_30/0.28)]"
        />
      </div>

      <div className="mt-auto space-y-3">
        <Button asChild variant="cta" size="xl" className="w-full">
          <Link to="/book/care" onClick={() => booking.setEditingFromReview(false)}>
            <CalendarPlus /> Book New Appointment
          </Link>
        </Button>
        <Button asChild variant="glass" size="xl" className="w-full justify-between px-6">
          <Link to="/appointments/history">
            <span className="flex items-center gap-2">
              <CalendarClock /> My Existing Appointments
            </span>
            <span className="flex items-center gap-1.5">
              {upcoming > 0 && (
                <span className="grid size-6 place-items-center rounded-full bg-cta text-xs font-bold">{upcoming}</span>
              )}
              <ChevronRight className="text-muted-foreground" />
            </span>
          </Link>
        </Button>
      </div>
    </Screen>
  );
}
