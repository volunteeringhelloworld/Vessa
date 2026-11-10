import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const ITEM = 44;
const VISIBLE = 5;

type Item = { value: number; label: string };

export function WheelColumn({
  items,
  value,
  onChange,
  label,
  className,
}: {
  items: Item[];
  value: number;
  onChange: (v: number) => void;
  label: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const frame = useRef<number | null>(null);
  const mounted = useRef(false);
  const index = Math.max(
    0,
    items.findIndex((i) => i.value === value),
  );

  // Keep the wheel aligned when the value changes from outside (e.g. day clamped for February).
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const current = Math.round(el.scrollTop / ITEM);
    if (current !== index) {
      el.scrollTo({ top: index * ITEM, behavior: mounted.current ? "smooth" : "auto" });
    }
    if (!mounted.current) setScrollTop(index * ITEM);
    mounted.current = true;
  }, [index, items.length]);

  const onScroll = () => {
    if (frame.current) cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const el = ref.current;
      if (!el) return;
      setScrollTop(el.scrollTop);
      const i = Math.min(items.length - 1, Math.max(0, Math.round(el.scrollTop / ITEM)));
      const it = items[i];
      if (it && it.value !== value) onChange(it.value);
    });
  };

  const step = (dir: 1 | -1) => {
    const i = Math.min(items.length - 1, Math.max(0, index + dir));
    const it = items[i];
    if (it) onChange(it.value);
  };

  return (
    <div className={cn("relative min-w-0 flex-1", className)}>
      <div
        ref={ref}
        role="listbox"
        aria-label={label}
        aria-activedescendant={`${label}-${value}`}
        tabIndex={0}
        onScroll={onScroll}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            step(1);
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            step(-1);
          }
        }}
        className="no-scrollbar relative z-10 snap-y snap-mandatory overflow-y-scroll overscroll-contain rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-coral"
        style={{
          height: ITEM * VISIBLE,
          paddingBlock: ITEM * Math.floor(VISIBLE / 2),
          maskImage: "linear-gradient(to bottom, transparent, black 30%, black 70%, transparent)",
        }}
      >
        {items.map((it, i) => {
          const dist = Math.abs(i * ITEM - scrollTop) / ITEM;
          const active = it.value === value;
          return (
            <div
              key={it.value}
              id={`${label}-${it.value}`}
              role="option"
              aria-selected={active}
              onClick={() => ref.current?.scrollTo({ top: i * ITEM, behavior: "smooth" })}
              className={cn(
                "flex snap-center items-center justify-center whitespace-nowrap px-1 transition-colors",
                active
                  ? "font-display text-xl font-semibold text-foreground"
                  : "text-base text-muted-foreground",
              )}
              style={{
                height: ITEM,
                opacity: Math.max(0.25, 1 - dist * 0.32),
                transform: `perspective(400px) rotateX(${Math.max(-60, Math.min(60, ((i * ITEM - scrollTop) / ITEM) * -18))}deg) scale(${Math.max(0.82, 1 - dist * 0.07)})`,
              }}
            >
              {it.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function WheelHighlight() {
  return (
    <div
      aria-hidden
      className="glass pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 rounded-2xl"
      style={{ height: ITEM }}
    />
  );
}
