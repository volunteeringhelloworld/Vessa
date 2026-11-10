import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  variant?: "warm" | "glow" | "splash";
  className?: string;
  withNav?: boolean;
};

/** Mobile-first frame (designed for 393×852) that respects iOS safe areas. */
export function AppScreen({ children, variant = "warm", className, withNav }: Props) {
  const bg = variant === "splash" ? "bg-splash" : variant === "glow" ? "bg-glow" : "bg-warm";
  return (
    <div className={cn("min-h-dvh w-full", bg)}>
      <main
        className={cn(
          "relative mx-auto flex min-h-dvh w-full max-w-[430px] flex-col px-6 pt-safe",
          withNav ? "pb-nav" : "pb-safe",
          className,
        )}
      >
        {children}
      </main>
    </div>
  );
}
