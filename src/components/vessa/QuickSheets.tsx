import { Link } from "@tanstack/react-router";
import { Check, MapPin, Navigation, Phone, Plus, Siren } from "lucide-react";
import { BottomSheet } from "./BottomSheet";
import { Button } from "@/components/ui/button";
import { useVessa } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { PROVIDERS, mapsSearchUrl } from "@/lib/providers";
import { cn } from "@/lib/utils";

type SheetProps = { open: boolean; onOpenChange: (o: boolean) => void };

export function HospitalSheet({ open, onOpenChange }: SheetProps) {
  const t = useT();
  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title={t("hospital.title")}
      description={t("hospital.subtitle")}
    >
      <Button asChild variant="hero" size="xl" className="mb-5 w-full">
        <a href={mapsSearchUrl("hospital near me")} target="_blank" rel="noreferrer">
          <Navigation /> {t("hospital.search")}
        </a>
      </Button>
      <ul className="space-y-3 pb-4">
        {PROVIDERS.map((p) => (
          <li key={p.id} className="glass flex items-center gap-3 rounded-2xl p-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-accent text-espresso">
              <MapPin className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-semibold">{p.name}</p>
              <p className="text-xs text-muted-foreground">
                {p.area} · {p.distanceKm} km
              </p>
            </div>
            <Button asChild variant="glass" size="pill" className="shrink-0">
              <a href={mapsSearchUrl(`${p.name} Bangkok`)} target="_blank" rel="noreferrer">
                {t("hospital.directions")}
              </a>
            </Button>
          </li>
        ))}
      </ul>
    </BottomSheet>
  );
}

export function ProviderSheet({ open, onOpenChange }: SheetProps) {
  const t = useT();
  const connected = useVessa((s) => s.connectedProviders);
  const toggle = useVessa((s) => s.toggleProvider);
  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title={t("provider.title")}
      description={t("provider.subtitle")}
    >
      <ul className="space-y-3 pb-4">
        {PROVIDERS.map((p) => {
          const on = connected.includes(p.id);
          return (
            <li
              key={p.id}
              className={cn(
                "glass flex items-center gap-3 rounded-2xl p-3 transition-all",
                on && "glass-strong ring-2 ring-coral/60",
              )}
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-semibold">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.area}</p>
              </div>
              <Button
                variant={on ? "hero" : "glass"}
                size="pill"
                aria-pressed={on}
                onClick={() => toggle(p.id)}
                className="shrink-0"
              >
                {on ? <Check /> : <Plus />}
                {on ? t("provider.connected") : t("provider.connect")}
              </Button>
            </li>
          );
        })}
      </ul>
    </BottomSheet>
  );
}

export function EmergencySheet({ open, onOpenChange }: SheetProps) {
  const t = useT();
  const health = useVessa((s) => s.health);
  const info: [string, string][] = [
    [t("health.bloodType"), health.bloodType],
    [t("health.allergies"), health.allergies],
    [t("health.conditions"), health.conditions],
  ];
  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title={t("emergency.title")}
      description={t("emergency.subtitle")}
    >
      <div className="space-y-3 pb-4">
        <Button asChild variant="hero" size="xl" className="w-full">
          <a href="tel:1669">
            <Siren /> {t("emergency.call")}
          </a>
        </Button>
        {health.emergencyName && health.emergencyPhone ? (
          <Button asChild variant="glass" size="xl" className="w-full">
            <a href={`tel:${health.emergencyPhone.replace(/[^\d+]/g, "")}`}>
              <Phone /> {t("emergency.contact", { name: health.emergencyName })}
            </a>
          </Button>
        ) : (
          <p className="glass rounded-2xl p-4 text-sm text-muted-foreground">
            {t("emergency.noContact")}
          </p>
        )}
        <div className="glass rounded-2xl p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {t("emergency.info")}
          </p>
          <dl className="space-y-2">
            {info.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 text-sm">
                <dt className="text-muted-foreground">{k}</dt>
                <dd
                  className={cn(
                    "text-right font-semibold",
                    !v && "font-normal italic text-muted-foreground",
                  )}
                >
                  {v || t("emergency.unknown")}
                </dd>
              </div>
            ))}
          </dl>
        </div>
        <Button asChild variant="quiet" className="w-full">
          <Link to="/health-profile" onClick={() => onOpenChange(false)}>
            {t("emergency.addInfo")}
          </Link>
        </Button>
      </div>
    </BottomSheet>
  );
}
