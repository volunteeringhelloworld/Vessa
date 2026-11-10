import { CalendarHeart, Check, Compass, FileHeart, Pill, Stethoscope } from "lucide-react";
import { useVessa, type Intent } from "@/lib/store";
import { useT, type TKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const OPTIONS: { id: Intent; label: TKey; icon: typeof Pill }[] = [
  { id: "book", label: "onb.book", icon: CalendarHeart },
  { id: "find", label: "onb.find", icon: Stethoscope },
  { id: "records", label: "onb.records", icon: FileHeart },
  { id: "meds", label: "onb.meds", icon: Pill },
  { id: "explore", label: "onb.explore", icon: Compass },
];

export function IntentOptions({ compact }: { compact?: boolean }) {
  const t = useT();
  const intents = useVessa((s) => s.intents);
  const toggle = useVessa((s) => s.toggleIntent);
  return (
    <ul className={cn("flex flex-col", compact ? "gap-2" : "gap-3")}>
      {OPTIONS.map((o) => {
        const active = intents.includes(o.id);
        const Icon = o.icon;
        return (
          <li key={o.id}>
            <button
              type="button"
              role="checkbox"
              aria-checked={active}
              onClick={() => toggle(o.id)}
              className={cn(
                "glass flex w-full items-center gap-4 rounded-2xl px-4 text-left transition-all duration-300",
                compact ? "h-14" : "h-[4.25rem]",
                active && "glass-strong animate-pop border-coral ring-2 ring-coral/70",
              )}
            >
              <span
                className={cn(
                  "grid h-10 w-10 shrink-0 place-items-center rounded-xl transition-colors",
                  active ? "bg-gradient-accent text-espresso" : "bg-cream/70 text-terracotta",
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={1.8} />
              </span>
              <span className="min-w-0 flex-1 text-[15px] font-semibold leading-snug">
                {t(o.label)}
              </span>
              <span
                className={cn(
                  "grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 transition-all",
                  active
                    ? "border-terracotta bg-terracotta text-primary-foreground"
                    : "border-muted-foreground/30",
                )}
              >
                {active && <Check className="h-3.5 w-3.5 animate-check" strokeWidth={3} />}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
