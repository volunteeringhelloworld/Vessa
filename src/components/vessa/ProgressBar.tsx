import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

// Remembers the previous screen's value so the bar animates forward from where it was.
let lastValue = 0;

export function ProgressBar({ value, className }: { value: number; className?: string }) {
  const [shown, setShown] = useState(lastValue);

  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(value));
    lastValue = value;
    return () => cancelAnimationFrame(id);
  }, [value]);

  const pct = Math.round(value * 100);

  return (
    <div className={cn("w-full", className)}>
      <div
        role="progressbar"
        aria-label="Health profile progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        className="relative h-2 w-full overflow-hidden rounded-full bg-track"
      >
        <div
          className="h-full rounded-full bg-gradient-progress shadow-soft transition-[width] duration-700 ease-out"
          style={{ width: `${shown * 100}%` }}
        />
      </div>
      <div className="mt-2 flex items-center justify-between text-[11px] font-medium tracking-wide text-ink-soft">
        <span>{pct}% complete</span>
        <span>{pct >= 100 ? "All done" : `${100 - pct}% to go`}</span>
      </div>
    </div>
  );
}
