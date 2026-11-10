import { cn } from "@/lib/utils";

interface Props {
  value: boolean | null;
  onSelect: (v: boolean) => void;
  shape?: "pill" | "circle";
}

export function YesNoChoice({ value, onSelect, shape = "pill" }: Props) {
  const base =
    shape === "circle"
      ? "h-24 w-24 rounded-full font-display text-2xl"
      : "h-16 flex-1 rounded-2xl text-lg font-semibold";
  return (
    <div className={cn("flex w-full items-center gap-4", shape === "circle" ? "justify-center gap-10" : "")}>
      {[
        { v: true, label: "Yes" },
        { v: false, label: "No" },
      ].map((o) => {
        const selected = value === o.v;
        return (
          <button
            key={o.label}
            type="button"
            aria-pressed={selected}
            onClick={() => onSelect(o.v)}
            className={cn(
              base,
              "transition-all active:scale-95",
              selected ? "bg-gradient-primary text-ink shadow-lift" : "glass text-accent-ink hover:bg-glass-strong",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
