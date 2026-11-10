import { Check } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import type { Option } from "@/lib/profile-options";
import { cn } from "@/lib/utils";

interface Props {
  options: Option[];
  selected: string[];
  onToggle: (id: string) => void;
}

/**
 * Swipeable carousel with a rotating "wheel" effect: the centred card is largest,
 * neighbours shrink and turn away. Tapping a card centres it and toggles selection.
 */
export function ConditionCarousel({ options, selected, onToggle }: Props) {
  const scroller = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLButtonElement | null)[]>([]);
  const [active, setActive] = useState(0);

  const update = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    const center = el.scrollLeft + el.clientWidth / 2;
    let best = 0;
    let bestDist = Infinity;
    cards.current.forEach((card, i) => {
      if (!card) return;
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const d = (cardCenter - center) / card.offsetWidth;
      const ad = Math.min(Math.abs(d), 2.2);
      const scale = 1 - ad * 0.16;
      const rotate = Math.max(-40, Math.min(40, -d * 22));
      card.style.transform = `perspective(700px) rotateY(${rotate}deg) scale(${scale})`;
      card.style.opacity = String(1 - ad * 0.28);
      card.style.zIndex = String(10 - Math.round(ad * 3));
      if (Math.abs(d) < bestDist) {
        bestDist = Math.abs(d);
        best = i;
      }
    });
    setActive(best);
  }, []);

  const centre = useCallback((i: number, smooth = true) => {
    const el = scroller.current;
    const card = cards.current[i];
    if (!el || !card) return;
    el.scrollTo({
      left: card.offsetLeft + card.offsetWidth / 2 - el.clientWidth / 2,
      behavior: smooth ? "smooth" : "auto",
    });
  }, []);

  useEffect(() => {
    centre(1, false);
    update();
    const onResize = () => update();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [centre, update]);

  return (
    <div className="-mx-6">
      <div
        ref={scroller}
        onScroll={update}
        className="no-scrollbar flex snap-x snap-mandatory items-center gap-1 overflow-x-auto px-[calc(50%-4.75rem)] py-6"
      >
        {options.map((o, i) => {
          const isSel = selected.includes(o.id);
          const Icon = o.icon;
          return (
            <button
              key={o.id}
              ref={(el) => {
                cards.current[i] = el;
              }}
              type="button"
              aria-pressed={isSel}
              onClick={() => {
                centre(i);
                onToggle(o.id);
              }}
              className={cn(
                "relative flex h-48 w-[9.5rem] shrink-0 snap-center flex-col items-center justify-center gap-4 rounded-3xl px-3 text-center transition-[background-color,box-shadow] duration-300 will-change-transform",
                isSel ? "glass glass-strong ring-2 ring-coral shadow-lift" : "glass",
              )}
            >
              {isSel && (
                <span className="absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-full bg-gradient-primary text-ink">
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                </span>
              )}
              <span
                className={cn(
                  "grid h-16 w-16 place-items-center rounded-full transition-colors",
                  isSel ? "bg-gradient-primary text-ink" : "bg-cream text-accent-ink",
                )}
              >
                <Icon className="h-7 w-7" strokeWidth={1.75} />
              </span>
              <span className="text-sm font-semibold leading-tight text-ink">{o.label}</span>
            </button>
          );
        })}
      </div>
      <div className="flex justify-center gap-2" role="tablist" aria-label="Carousel position">
        {options.map((o, i) => (
          <button
            key={o.id}
            type="button"
            role="tab"
            aria-selected={i === active}
            aria-label={`Show ${o.label}`}
            onClick={() => centre(i)}
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              i === active ? "w-6 bg-coral" : "w-2 bg-track",
            )}
          />
        ))}
      </div>
    </div>
  );
}
