import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Screen } from "@/components/vessa/Screen";
import { PageIntro, TopBar } from "@/components/vessa/TopBar";
import { EmptyState, Hydrated } from "@/components/vessa/bits";
import { AppointmentCard, isUpcoming, sortByDate } from "@/components/vessa/appointment-bits";
import { cn } from "@/lib/utils";
import { booking, useBooking } from "@/lib/booking/store";

export const Route = createFileRoute("/appointments/history")({
  head: () => ({
    meta: [
      { title: "My appointments — VessA" },
      { name: "description", content: "See your upcoming, past and cancelled VessA appointments." },
      { property: "og:title", content: "My appointments — VessA" },
      { property: "og:description", content: "See your upcoming, past and cancelled VessA appointments." },
    ],
  }),
  component: History,
});

function History() {
  const { appointments } = useBooking();
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const upcoming = sortByDate(appointments.filter((a) => isUpcoming(a)));
  const past = sortByDate(appointments.filter((a) => !isUpcoming(a))).reverse();
  const list = tab === "upcoming" ? upcoming : past;

  return (
    <Screen nav>
      <TopBar back="/appointments" />
      <PageIntro title="My Appointments" subtitle="Everything you’ve booked with VessA, in one place." />

      <Hydrated>
        <div role="tablist" aria-label="Appointments" className="glass grid grid-cols-2 gap-1 rounded-full p-1">
          {(
            [
              ["upcoming", `Upcoming (${upcoming.length})`],
              ["past", `Past & cancelled (${past.length})`],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={cn(
                "rounded-full py-2 text-[13px] font-bold transition-all",
                tab === id ? "bg-cta text-cocoa" : "text-muted-foreground hover:text-cocoa",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {list.length === 0 ? (
          <EmptyState
            title={tab === "upcoming" ? "No upcoming appointments" : "Nothing here yet"}
            body={
              tab === "upcoming"
                ? "When you book a visit, it will appear here."
                : "Past and cancelled appointments will show up here."
            }
            action={
              tab === "upcoming" && (
                <Button asChild variant="cta" size="xl" className="w-full">
                  <Link to="/book/care" onClick={() => booking.setEditingFromReview(false)}>
                    <CalendarPlus /> Book New Appointment
                  </Link>
                </Button>
              )
            }
          />
        ) : (
          <ul className="mt-4 space-y-3">
            {list.map((a) => (
              <li key={a.id} className="animate-rise">
                <AppointmentCard appointment={a} />
              </li>
            ))}
          </ul>
        )}
      </Hydrated>
    </Screen>
  );
}
