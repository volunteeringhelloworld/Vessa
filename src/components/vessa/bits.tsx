import type { ReactNode } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBooking } from "@/lib/booking/store";

export function Rating({ value, count, className }: { value: number; count?: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs font-semibold text-cocoa", className)}>
      <Star className="size-3.5 fill-coral text-coral" aria-hidden />
      {value.toFixed(1)}
      {count !== undefined && <span className="font-medium text-muted-foreground">({count.toLocaleString("en-US")})</span>}
    </span>
  );
}

export function Chip({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full bg-white/60 px-2.5 py-1 text-[11px] font-semibold text-cocoa", className)}>
      {children}
    </span>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-2.5 mt-6 flex items-center justify-between">
      <h2 className="font-sans text-[13px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{children}</h2>
      {action}
    </div>
  );
}

/** Waits for saved selections to load in the browser before rendering a step. */
export function Hydrated({ children }: { children: ReactNode }) {
  const { hydrated } = useBooking();
  if (!hydrated) {
    return (
      <div className="mt-4 space-y-3" aria-busy="true">
        {[0, 1, 2].map((i) => (
          <div key={i} className="glass h-20 animate-pulse rounded-3xl" />
        ))}
      </div>
    );
  }
  return <>{children}</>;
}

export function EmptyState({ title, body, action, image }: { title: string; body: string; action?: ReactNode; image?: string }) {
  return (
    <div className="glass mt-4 flex flex-col items-center rounded-[28px] px-6 py-8 text-center">
      {image && <img src={image} alt="" className="mb-3 h-28 w-auto" />}
      <h2 className="text-xl font-semibold text-cocoa">{title}</h2>
      <p className="mt-1.5 text-sm text-muted-foreground">{body}</p>
      {action && <div className="mt-5 w-full">{action}</div>}
    </div>
  );
}
