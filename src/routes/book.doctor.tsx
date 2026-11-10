import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { addDays, format } from "date-fns";
import { Award, Building2, CalendarCheck, Check, Languages, MapPin, Search, Video, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Screen } from "@/components/vessa/Screen";
import { PageIntro, StepHeader } from "@/components/vessa/TopBar";
import { Chip, EmptyState, Hydrated, Rating } from "@/components/vessa/bits";
import { PillSelect } from "@/components/vessa/PillSelect";
import { cn } from "@/lib/utils";
import { doctorsAt, formatFee, getFacility, type Doctor } from "@/lib/booking/data";
import { nextAfter } from "@/lib/booking/flow";
import { nextAvailableDate, parseISODate, toISODate } from "@/lib/booking/schedule";
import { booking, useBooking, type DoctorPrefs } from "@/lib/booking/store";

export const Route = createFileRoute("/book/doctor")({
  head: () => ({
    meta: [
      { title: "Choose a doctor — VessA" },
      { name: "description", content: "Find a healthcare professional who suits your needs." },
      { property: "og:title", content: "Choose a doctor — VessA" },
      { property: "og:description", content: "Find a healthcare professional who suits your needs." },
    ],
  }),
  component: ChooseDoctor,
});

const AVAILABILITY: { value: DoctorPrefs["availability"]; label: string }[] = [
  { value: "any", label: "Any availability" },
  { value: "today", label: "Available today" },
  { value: "week", label: "Within 7 days" },
];
const CONSULT: { value: DoctorPrefs["consult"]; label: string }[] = [
  { value: "any", label: "In-person & online" },
  { value: "in-person", label: "In-person" },
  { value: "online", label: "Online" },
];

function availabilityLabel(next: string | null, now: Date) {
  if (!next) return { text: "Fully booked", tone: "bg-muted text-muted-foreground" };
  if (next === toISODate(now)) return { text: "Available today", tone: "bg-success/15 text-success" };
  if (next === toISODate(addDays(now, 1))) return { text: "Next: tomorrow", tone: "bg-butter text-cocoa" };
  return { text: `Next: ${format(parseISODate(next), "EEE d MMM")}`, tone: "bg-butter text-cocoa" };
}

function ChooseDoctor() {
  const navigate = useNavigate();
  const { draft, doctorPrefs: p, appointments, hydrated } = useBooking();
  const facility = getFacility(draft.facilityId);
  const [profile, setProfile] = useState<Doctor | null>(null);
  const [error, setError] = useState(false);
  const now = useMemo(() => new Date(), []);

  const doctors = useMemo(() => {
    if (!facility) return [];
    const q = p.query.trim().toLowerCase();
    const weekEnd = toISODate(addDays(now, 7));
    return doctorsAt(facility.id)
      .map((d) => ({ doctor: d, next: nextAvailableDate(d, now, appointments) }))
      .filter(({ doctor: d, next }) => {
        if (q && !`${d.name} ${d.specialty}`.toLowerCase().includes(q)) return false;
        if (p.consult !== "any" && !d.consultTypes.includes(p.consult)) return false;
        if (p.availability === "today" && next !== toISODate(now)) return false;
        if (p.availability === "week" && (!next || next > weekEnd)) return false;
        return true;
      })
      .sort((a, b) => {
        const score = (d: Doctor) => draft.categories.filter((c) => d.categories.includes(c)).length;
        return score(b.doctor) - score(a.doctor) || b.doctor.rating - a.doctor.rating;
      });
  }, [facility, p, appointments, draft.categories, now]);

  const choose = (d: Doctor) => {
    booking.selectDoctor(d.id);
    if (p.consult !== "any" && d.consultTypes.includes(p.consult)) booking.setConsultType(p.consult);
    setError(false);
  };

  const onConfirm = () => {
    const selected = doctors.find((d) => d.doctor.id === draft.doctorId);
    if (!selected) {
      setError(true);
      return;
    }
    navigate({ to: nextAfter("/book/schedule") });
  };

  return (
    <Screen
      footer={
        facility && (
          <div className="space-y-2">
            {error && (
              <p role="alert" className="text-center text-sm font-semibold text-destructive">
                Please select a doctor to continue.
              </p>
            )}
            <Button variant="cta" size="xl" className="w-full" onClick={onConfirm}>
              Confirm
            </Button>
          </div>
        )
      }
    >
      <DoctorHeader facilityId={facility?.id} />
      <PageIntro title="Choose a Doctor" subtitle="Find a healthcare professional who suits your needs." />

      <Hydrated>
        {!facility ? (
          <EmptyState
            title="Choose a place first"
            body="Pick a hospital or clinic and we’ll show the doctors available there."
            action={
              <Button asChild variant="cta" size="xl" className="w-full">
                <Link to="/book/facilities">Find a hospital or clinic</Link>
              </Button>
            }
          />
        ) : (
          <>
            <Link
              to="/book/facilities"
              className="glass-tint mb-3 flex items-center gap-2 rounded-full px-4 py-2.5 text-sm"
            >
              <Building2 className="size-4 text-primary" />
              <span className="flex-1 truncate font-bold text-cocoa">{facility.name}</span>
              <span className="font-bold text-primary">Change</span>
            </Link>

            <label className="glass flex h-12 items-center gap-2 rounded-full px-4 focus-within:ring-2 focus-within:ring-ring">
              <Search className="size-4 shrink-0 text-primary" />
              <span className="sr-only">Search by doctor’s name or specialty</span>
              <input
                value={p.query}
                onChange={(e) => booking.setDoctorPrefs({ query: e.target.value })}
                placeholder="Search by name or specialty…"
                className="w-full bg-transparent text-[15px] text-cocoa placeholder:text-muted-foreground focus:outline-none"
              />
              {p.query && (
                <button type="button" aria-label="Clear search" onClick={() => booking.setDoctorPrefs({ query: "" })}>
                  <X className="size-4 text-muted-foreground" />
                </button>
              )}
            </label>

            <div className="no-scrollbar -mx-5 mt-3 flex gap-2 overflow-x-auto px-5 pb-1">
              <PillSelect label="Availability" value={p.availability} onChange={(availability) => booking.setDoctorPrefs({ availability })} options={AVAILABILITY} icon={<CalendarCheck className="size-3.5" />} />
              <PillSelect label="Consultation type" value={p.consult} onChange={(consult) => booking.setDoctorPrefs({ consult })} options={CONSULT} icon={<Video className="size-3.5" />} />
            </div>

            {doctors.length === 0 ? (
              <EmptyState
                title="No doctors match"
                body="Try a different search or loosen the filters."
                action={
                  <Button variant="glass" size="pill" className="w-full" onClick={() => booking.setDoctorPrefs({ query: "", availability: "any", consult: "any" })}>
                    Clear filters
                  </Button>
                }
              />
            ) : (
              <ul role="radiogroup" aria-label="Doctors" className="mt-4 space-y-3">
                {doctors.map(({ doctor: d, next }) => {
                  const selected = hydrated && draft.doctorId === d.id;
                  const status = availabilityLabel(next, now);
                  return (
                    <li key={d.id}>
                      <div
                        role="radio"
                        aria-checked={selected}
                        tabIndex={0}
                        onClick={() => choose(d)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            choose(d);
                          }
                        }}
                        className={cn(
                          "animate-rise cursor-pointer rounded-[26px] p-3.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          selected ? "glass-tint border-2! border-coral! shadow-[var(--shadow-soft)]" : "glass",
                        )}
                      >
                        <div className="flex gap-3">
                          <div className="relative shrink-0">
                            <img src={d.photo} alt={d.name} loading="lazy" width={320} height={320} className="size-[72px] rounded-[20px] object-cover" />
                            {selected && (
                              <span className="absolute -right-1.5 -top-1.5 grid size-6 place-items-center rounded-full bg-cta ring-2 ring-white">
                                <Check className="size-3.5 text-cocoa" strokeWidth={3} />
                              </span>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-bold text-cocoa">{d.name}</p>
                            <p className="truncate text-[13px] font-semibold text-primary">{d.specialty}</p>
                            <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
                              <MapPin className="size-3 shrink-0" /> {facility.name}
                            </p>
                            <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                              <Rating value={d.rating} count={d.reviewCount} />
                              <span className="text-xs text-muted-foreground">· {d.years} yrs exp.</span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center gap-2">
                          <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-bold", status.tone)}>{status.text}</span>
                          {d.consultTypes.includes("online") && (
                            <Chip className="gap-1">
                              <Video className="size-3" /> Online
                            </Chip>
                          )}
                          <span className="ml-auto text-sm font-extrabold text-cocoa">{formatFee(d.fee)}</span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setProfile(d);
                          }}
                          className="mt-3 w-full rounded-full bg-white/55 py-2 text-[13px] font-bold text-cocoa hover:bg-white/75"
                        >
                          View full profile
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        )}
      </Hydrated>

      <Sheet open={!!profile} onOpenChange={(o) => !o && setProfile(null)}>
        <SheetContent side="bottom" className="glass-strong mx-auto max-h-[88dvh] max-w-[430px] overflow-y-auto rounded-t-[32px] border-0 px-5 pb-8">
          {profile && (
            <div className="pt-2">
              <div className="flex items-center gap-4">
                <img src={profile.photo} alt={profile.name} className="size-24 rounded-[26px] object-cover" />
                <div>
                  <SheetTitle className="font-display text-2xl font-semibold leading-tight text-cocoa">{profile.name}</SheetTitle>
                  <SheetDescription className="font-semibold text-primary">{profile.specialty}</SheetDescription>
                  <Rating value={profile.rating} count={profile.reviewCount} className="mt-1" />
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{profile.bio}</p>
              <dl className="mt-4 space-y-2.5 text-sm">
                {[
                  { icon: Award, label: "Experience", value: `${profile.years} years · ${profile.education}` },
                  { icon: Building2, label: "Practice", value: facility?.name ?? "" },
                  { icon: Languages, label: "Languages", value: profile.languages.join(", ") },
                  { icon: Video, label: "Consultation", value: profile.consultTypes.map((c) => (c === "online" ? "Online" : "In-person")).join(" · ") },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="glass flex gap-3 rounded-2xl p-3">
                    <Icon className="mt-0.5 size-4 shrink-0 text-primary" />
                    <div>
                      <dt className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</dt>
                      <dd className="font-semibold text-cocoa">{value}</dd>
                    </div>
                  </div>
                ))}
              </dl>
              <div className="mt-4 flex items-center justify-between rounded-2xl bg-white/50 px-4 py-3">
                <span className="text-sm font-semibold text-muted-foreground">Consultation fee</span>
                <span className="text-lg font-extrabold text-cocoa">{formatFee(profile.fee)}</span>
              </div>
              <Button
                variant="cta"
                size="xl"
                className="mt-5 w-full"
                onClick={() => {
                  choose(profile);
                  setProfile(null);
                }}
              >
                {draft.doctorId === profile.id ? "Selected" : "Select this doctor"}
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </Screen>
  );
}

function DoctorHeader({ facilityId }: { facilityId: string | undefined }) {
  return facilityId ? (
    <StepHeader step={4} back="/facility/$facilityId" backParams={{ facilityId }} />
  ) : (
    <StepHeader step={4} back="/book/facilities" />
  );
}
