import { useState } from "react";
import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ChevronDown, Clock, Heart, Mail, MapPin, Phone, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Screen } from "@/components/vessa/Screen";
import { Chip, Rating, SectionTitle } from "@/components/vessa/bits";
import { DirectionsButton } from "@/components/vessa/appointment-bits";
import { cn } from "@/lib/utils";
import { doctorsAt, formatFee, getFacility, mapEmbedUrl, mapsDirectionsUrl } from "@/lib/booking/data";
import { booking, useBooking } from "@/lib/booking/store";

export const Route = createFileRoute("/facility/$facilityId")({
  loader: ({ params }) => {
    const facility = getFacility(params.facilityId);
    if (!facility) throw notFound();
    return { name: facility.name, city: facility.city };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.name} — VessA` },
          { name: "description", content: `Hours, services, specialties and doctors at ${loaderData.name}, ${loaderData.city}.` },
          { property: "og:title", content: `${loaderData.name} — VessA` },
          { property: "og:description", content: `Hours, services, specialties and doctors at ${loaderData.name}.` },
        ]
      : [{ title: "Facility unavailable — VessA" }, { name: "robots", content: "noindex" }],
  }),
  notFoundComponent: () => (
    <Screen>
      <div className="mt-24 text-center">
        <h1 className="text-2xl font-semibold">We couldn’t find that place</h1>
        <Button asChild variant="cta" size="xl" className="mt-6 w-full">
          <Link to="/book/facilities">Back to hospitals & clinics</Link>
        </Button>
      </div>
    </Screen>
  ),
  component: FacilityDetails,
});

function FacilityDetails() {
  const { facilityId } = Route.useParams();
  const facility = getFacility(facilityId)!;
  const navigate = useNavigate();
  const { favorites, hydrated } = useBooking();
  const favorite = hydrated && favorites.includes(facility.id);
  const doctors = doctorsAt(facility.id);
  const [showDoctors, setShowDoctors] = useState(false);

  const book = (doctorId?: string) => {
    booking.selectFacility(facility.id);
    if (doctorId) booking.selectDoctor(doctorId);
    navigate({ to: "/book/doctor" });
  };

  return (
    <Screen
      className="px-0"
      footer={
        <Button variant="cta" size="xl" className="w-full" onClick={() => book()}>
          Book an Appointment
        </Button>
      }
    >
      <div className="relative">
        <img src={facility.image} alt={facility.name} width={900} height={563} className="h-72 w-full object-cover" />
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-cocoa/30 to-transparent" />
        <div className="safe-top absolute inset-x-0 top-0 flex items-center justify-between px-5">
          <Link to="/book/facilities" aria-label="Go back" className="glass-strong grid size-11 place-items-center rounded-full text-cocoa">
            <ArrowLeft className="size-5" />
          </Link>
          <button
            type="button"
            aria-pressed={favorite}
            aria-label={favorite ? "Remove from favorites" : "Save to favorites"}
            onClick={() => booking.toggleFavorite(facility.id)}
            className="glass-strong grid size-11 place-items-center rounded-full"
          >
            <Heart className={cn("size-5 text-primary", favorite && "fill-primary")} />
          </button>
        </div>
      </div>

      <div className="relative -mt-10 px-5">
        <section className="glass-strong animate-rise rounded-[30px] p-5">
          <div className="flex items-center gap-2">
            <Chip className="bg-butter">{facility.kind}</Chip>
            <Rating value={facility.rating} count={facility.reviewCount} />
          </div>
          <h1 className="mt-2 text-[26px] font-semibold leading-tight text-cocoa">{facility.name}</h1>
          <p className="mt-2 flex gap-1.5 text-sm text-muted-foreground">
            <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
            <span>
              {facility.address} · {facility.distanceKm} km away
            </span>
          </p>
        </section>

        <SectionTitle>Location</SectionTitle>
        <div className="glass overflow-hidden rounded-[26px]">
          <iframe
            title={`Map of ${facility.name}`}
            src={mapEmbedUrl(facility)}
            loading="lazy"
            className="h-44 w-full border-0 saturate-[0.85] sepia-[0.15]"
          />
          <div className="p-3">
            <DirectionsButton href={mapsDirectionsUrl(facility)} />
          </div>
        </div>

        <SectionTitle>Operating hours</SectionTitle>
        <ul className="glass divide-y divide-white/60 rounded-[26px] px-4">
          {facility.hours.map((h) => (
            <li key={h.days} className="flex items-center justify-between py-3 text-sm">
              <span className="flex items-center gap-2 font-semibold text-cocoa">
                <Clock className="size-4 text-primary" /> {h.days}
              </span>
              <span className="text-muted-foreground">{h.time}</span>
            </li>
          ))}
        </ul>

        <SectionTitle>Services</SectionTitle>
        <ul className="glass grid grid-cols-1 gap-2 rounded-[26px] p-4">
          {facility.services.map((s) => (
            <li key={s} className="flex items-center gap-2.5 text-sm font-medium text-cocoa">
              <span className="size-2 rounded-full bg-coral" /> {s}
            </li>
          ))}
        </ul>

        <SectionTitle>Specialties</SectionTitle>
        <div className="flex flex-wrap gap-2">
          {facility.specialties.map((s) => (
            <Chip key={s} className="glass px-3 py-1.5 text-xs">
              {s}
            </Chip>
          ))}
        </div>

        <SectionTitle>Available doctors</SectionTitle>
        <button
          type="button"
          aria-expanded={showDoctors}
          onClick={() => setShowDoctors((v) => !v)}
          className="glass flex w-full items-center justify-between rounded-full px-5 py-3.5 text-sm font-bold text-cocoa"
        >
          <span className="flex items-center gap-2">
            <Users className="size-4 text-primary" /> View Available Doctors ({doctors.length})
          </span>
          <ChevronDown className={cn("size-4 transition-transform", showDoctors && "rotate-180")} />
        </button>
        {showDoctors && (
          <ul className="mt-2.5 space-y-2">
            {doctors.map((d) => (
              <li key={d.id}>
                <button
                  type="button"
                  onClick={() => book(d.id)}
                  className="glass flex w-full items-center gap-3 rounded-3xl p-3 text-left active:scale-[0.99]"
                >
                  <img src={d.photo} alt="" loading="lazy" className="size-12 rounded-2xl object-cover" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-bold text-cocoa">{d.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {d.specialty} · {formatFee(d.fee)}
                    </span>
                  </span>
                  <span className="rounded-full bg-cta px-3 py-1.5 text-xs font-bold text-cocoa">Book</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        <SectionTitle>Contact</SectionTitle>
        <div className="grid grid-cols-2 gap-2">
          <Button asChild variant="glass" size="pill">
            <a href={`tel:${facility.phone.replace(/\s/g, "")}`}>
              <Phone /> Call
            </a>
          </Button>
          <Button asChild variant="glass" size="pill">
            <a href={`mailto:${facility.email}`}>
              <Mail /> Email
            </a>
          </Button>
        </div>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          {facility.phone} · {facility.email}
        </p>

        <SectionTitle action={<Rating value={facility.rating} count={facility.reviewCount} />}>Ratings & reviews</SectionTitle>
        <ul className="space-y-2.5">
          {facility.reviews.map((r) => (
            <li key={r.author} className="glass rounded-3xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-cocoa">{r.author}</span>
                <Rating value={r.rating} />
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">“{r.text}”</p>
            </li>
          ))}
        </ul>
      </div>
    </Screen>
  );
}
