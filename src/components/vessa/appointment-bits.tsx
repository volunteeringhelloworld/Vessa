import { Link } from "@tanstack/react-router";
import { CalendarPlus, ChevronRight, Clock, MapPin, Video } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { getDoctor, getFacility } from "@/lib/booking/data";
import { downloadIcs, googleCalendarUrl } from "@/lib/booking/calendar";
import { formatLongDate, formatTime12, parseISODate, splitTime } from "@/lib/booking/schedule";
import type { Appointment } from "@/lib/booking/store";

export function isUpcoming(a: Appointment, now = new Date()) {
  const [h, m] = splitTime(a.time);
  const at = parseISODate(a.date);
  at.setHours(h, m, 0, 0);
  return a.status === "confirmed" && at.getTime() > now.getTime();
}

export function sortByDate(list: Appointment[]) {
  return [...list].sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
}

export function StatusBadge({ status, past }: { status: Appointment["status"]; past?: boolean }) {
  const label = status === "cancelled" ? "Cancelled" : past ? "Completed" : "Confirmed";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold",
        status === "cancelled"
          ? "bg-muted text-muted-foreground"
          : past
            ? "bg-butter text-cocoa"
            : "bg-success/15 text-success",
      )}
    >
      <span className={cn("size-1.5 rounded-full", status === "cancelled" ? "bg-muted-foreground" : past ? "bg-coral" : "bg-success")} />
      {label}
    </span>
  );
}

export function AppointmentCard({ appointment: a }: { appointment: Appointment }) {
  const doctor = getDoctor(a.doctorId);
  const facility = getFacility(a.facilityId);
  const upcoming = isUpcoming(a);
  return (
    <Link
      to="/appointments/$appointmentId"
      params={{ appointmentId: a.id }}
      className="glass flex items-center gap-3 rounded-3xl p-3.5 transition-transform active:scale-[0.99]"
    >
      {doctor && <img src={doctor.photo} alt="" className="size-14 rounded-2xl object-cover" loading="lazy" />}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate font-bold text-cocoa">{doctor?.name}</p>
          <StatusBadge status={a.status} past={!upcoming && a.status === "confirmed"} />
        </div>
        <p className="truncate text-xs text-muted-foreground">
          {doctor?.specialty} · {facility?.name}
        </p>
        <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-cocoa">
          <Clock className="size-3.5 text-primary" />
          {formatLongDate(a.date)} · {formatTime12(a.time)}
          {a.consultType === "online" && <Video className="size-3.5 text-primary" aria-label="Online" />}
        </p>
      </div>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
    </Link>
  );
}

export function AddToCalendarMenu({ appointment, className }: { appointment: Appointment; className?: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="glass" size="pill" className={cn("w-full", className)}>
          <CalendarPlus /> Add to Calendar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="glass-strong w-56 rounded-2xl p-1.5">
        <DropdownMenuItem asChild className="rounded-xl py-2.5 font-semibold">
          <a href={googleCalendarUrl(appointment)} target="_blank" rel="noreferrer">
            Google Calendar
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="rounded-xl py-2.5 font-semibold"
          onSelect={() => {
            downloadIcs(appointment);
            toast.success("Calendar file downloaded", { description: "Open it to add to Apple or Outlook Calendar." });
          }}
        >
          Apple / Outlook (.ics)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function DirectionsButton({ href, className }: { href: string; className?: string }) {
  return (
    <Button asChild variant="glass" size="pill" className={cn("w-full", className)}>
      <a href={href} target="_blank" rel="noreferrer">
        <MapPin /> Get Directions
      </a>
    </Button>
  );
}
