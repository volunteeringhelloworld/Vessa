import { useMemo } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowUpDown, Heart, MapPin, Search, Sparkles, Stethoscope, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Screen } from "@/components/vessa/Screen";
import { PageIntro, StepHeader } from "@/components/vessa/TopBar";
import { Chip, EmptyState, Hydrated, Rating } from "@/components/vessa/bits";
import { PillSelect } from "@/components/vessa/PillSelect";
import { cn } from "@/lib/utils";
import { CATEGORIES, FACILITIES, LOCATIONS, type Facility } from "@/lib/booking/data";
import { booking, useBooking, type FacilityPrefs } from "@/lib/booking/store";

export const Route = createFileRoute("/book/facilities")({
  head: () => ({
    meta: [
      { title: "Find a hospital or clinic — VessA" },
      { name: "description", content: "Explore healthcare facilities that match your needs." },
      { property: "og:title", content: "Find a hospital or clinic — VessA" },
      { property: "og:description", content: "Explore healthcare facilities that match your needs." },
    ],
  }),
  component: Facilities,
});

const SORTS: { value: FacilityPrefs["sort"]; label: string }[] = [
  { value: "recommended", label: "Recommended" },
  { value: "distance", label: "Nearest" },
  { value: "rating", label: "Top rated" },
];
const LOCATION_OPTIONS = [{ value: "all", label: "All locations" }, ...LOCATIONS.map((l) => ({ value: l, label: l }))];
const SPECIALTY_OPTIONS = [
  { value: "all", label: "All specialties" },
  ...CATEGORIES.filter((c) => c.id !== "other").map((c) => ({ value: c.id, label: c.label })),
] as { value: FacilityPrefs["specialty"]; label: string }[];

function Facilities() {
  const { draft, facilityPrefs: p, favorites } = useBooking();

  const matchScore = (f: Facility) => draft.categories.filter((c) => f.categories.includes(c)).length;

  const results = useMemo(() => {
    const q = p.query.trim().toLowerCase();
    const list = FACILITIES.filter((f) => {
      if (q && !`${f.name} ${f.address} ${f.city} ${f.specialties.join(" ")}`.toLowerCase().includes(q)) return false;
      if (p.location !== "all" && f.city !== p.location) return false;
      if (p.specialty !== "all" && !f.categories.includes(p.specialty)) return false;
      if (p.favoritesOnly && !favorites.includes(f.id)) return false;
      return true;
    });
    return list.sort((a, b) => {
      if (p.sort === "distance") return a.distanceKm - b.distanceKm;
      if (p.sort === "rating") return b.rating - a.rating;
      return matchScore(b) - matchScore(a) || b.rating - a.rating;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p, favorites, draft.categories]);

  const filtersActive = p.query || p.location !== "all" || p.specialty !== "all" || p.favoritesOnly;

  return (
    <Screen>
      <StepHeader step={3} back="/book/reason" />
      <PageIntro title="Find a hospital or clinic." subtitle="Explore healthcare facilities that match your needs." />

      <Hydrated>
        <div className="flex gap-2">
          <label className="glass flex h-12 flex-1 items-center gap-2 rounded-full px-4 focus-within:ring-2 focus-within:ring-ring">
            <Search className="size-4 shrink-0 text-primary" />
            <span className="sr-only">Search hospitals or clinics</span>
            <input
              value={p.query}
              onChange={(e) => booking.setFacilityPrefs({ query: e.target.value })}
              placeholder="Search hospitals or clinics…"
              className="w-full bg-transparent text-[15px] text-cocoa placeholder:text-muted-foreground focus:outline-none"
            />
            {p.query && (
              <button type="button" aria-label="Clear search" onClick={() => booking.setFacilityPrefs({ query: "" })}>
                <X className="size-4 text-muted-foreground" />
              </button>
            )}
          </label>
          <button
            type="button"
            aria-pressed={p.favoritesOnly}
            aria-label="Show saved favorites only"
            onClick={() => booking.setFacilityPrefs({ favoritesOnly: !p.favoritesOnly })}
            className={cn("grid size-12 shrink-0 place-items-center rounded-full", p.favoritesOnly ? "bg-cta" : "glass")}
          >
            <Heart className={cn("size-5 text-primary", p.favoritesOnly && "fill-primary")} />
          </button>
        </div>

        <div className="no-scrollbar -mx-5 mt-3 flex gap-2 overflow-x-auto px-5 pb-1">
          <PillSelect label="Sort" value={p.sort} onChange={(sort) => booking.setFacilityPrefs({ sort })} options={SORTS} icon={<ArrowUpDown className="size-3.5" />} />
          <PillSelect label="Location" value={p.location} onChange={(location) => booking.setFacilityPrefs({ location })} options={LOCATION_OPTIONS} icon={<MapPin className="size-3.5" />} />
          <PillSelect label="Specialty" value={p.specialty} onChange={(specialty) => booking.setFacilityPrefs({ specialty })} options={SPECIALTY_OPTIONS} icon={<Stethoscope className="size-3.5" />} />
        </div>

        <div className="mb-2 mt-4 flex items-center justify-between">
          <p className="text-sm font-bold text-cocoa">
            {p.sort === "recommended" && !filtersActive ? "Recommended for you" : `${results.length} ${results.length === 1 ? "place" : "places"} found`}
          </p>
          {filtersActive && (
            <button
              type="button"
              className="text-sm font-bold text-primary"
              onClick={() => booking.setFacilityPrefs({ query: "", location: "all", specialty: "all", favoritesOnly: false })}
            >
              Clear filters
            </button>
          )}
        </div>

        {results.length === 0 ? (
          <EmptyState
            title={p.favoritesOnly ? "No saved favorites here" : "No matches yet"}
            body={p.favoritesOnly ? "Tap the heart on any facility to save it." : "Try a different name, location or specialty."}
          />
        ) : (
          <ul className="space-y-4">
            {results.map((f) => (
              <FacilityCard key={f.id} facility={f} favorite={favorites.includes(f.id)} recommended={matchScore(f) > 0} />
            ))}
          </ul>
        )}
      </Hydrated>
    </Screen>
  );
}

function FacilityCard({ facility: f, favorite, recommended }: { facility: Facility; favorite: boolean; recommended: boolean }) {
  const navigate = useNavigate();
  return (
    <li className="glass animate-rise overflow-hidden rounded-[28px]">
      <div className="relative">
        <Link to="/facility/$facilityId" params={{ facilityId: f.id }} aria-label={`Open ${f.name}`}>
          <img src={f.image} alt={f.name} loading="lazy" width={900} height={563} className="h-36 w-full object-cover" />
        </Link>
        <button
          type="button"
          aria-pressed={favorite}
          aria-label={favorite ? `Remove ${f.name} from favorites` : `Save ${f.name} to favorites`}
          onClick={() => booking.toggleFavorite(f.id)}
          className="glass-strong absolute right-3 top-3 grid size-10 place-items-center rounded-full"
        >
          <Heart className={cn("size-5 text-primary", favorite && "fill-primary")} />
        </button>
        {recommended && (
          <span className="glass-strong absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold text-cocoa">
            <Sparkles className="size-3 text-primary" /> Matches your needs
          </span>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-display text-lg font-semibold leading-tight text-cocoa">{f.name}</h3>
            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="size-3.5 shrink-0 text-primary" />
              <span className="truncate">{f.city}</span>
              <span aria-hidden>·</span>
              <span className="shrink-0">{f.distanceKm} km away</span>
            </p>
          </div>
          <Rating value={f.rating} count={f.reviewCount} className="shrink-0 pt-1" />
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <Chip className="bg-butter">{f.kind}</Chip>
          {f.specialties.slice(0, 3).map((s) => (
            <Chip key={s}>{s}</Chip>
          ))}
        </div>
        <Button
          variant="cta"
          size="pill"
          className="mt-4 w-full"
          onClick={() => navigate({ to: "/facility/$facilityId", params: { facilityId: f.id } })}
        >
          View Details
        </Button>
      </div>
    </li>
  );
}
