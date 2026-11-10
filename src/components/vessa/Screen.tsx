import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { BottomNav } from "./BottomNav";

/** Mobile-first page frame sized for a 393×852 viewport, centered on larger screens. */
export function Screen({
  children,
  footer,
  nav = false,
  className,
}: {
  children: ReactNode;
  /** Sticky action area pinned above the bottom edge (e.g. Continue button). */
  footer?: ReactNode;
  /** Show the five-tab app bar. */
  nav?: boolean;
  className?: string;
}) {
  return (
    <div className="relative mx-auto flex min-h-dvh w-full max-w-[430px] flex-col sm:my-0 sm:shadow-[var(--shadow-soft)]">
      <main
        className={cn(
          "flex flex-1 flex-col px-5",
          footer ? "pb-32" : nav ? "pb-28" : "pb-8",
          nav && footer && "pb-52",
          className,
        )}
      >
        {children}
      </main>
      {footer && (
        <div
          className={cn(
            "fixed inset-x-0 z-30 mx-auto w-full max-w-[430px] px-5 pt-6",
            nav ? "bottom-[76px] pb-3" : "bottom-0 safe-bottom",
          )}
          style={{
            backgroundImage:
              "linear-gradient(to top, var(--cream) 55%, color-mix(in oklab, var(--cream) 0%, transparent))",
          }}
        >
          {footer}
        </div>
      )}
      {nav && <BottomNav />}
    </div>
  );
}
