import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { Logo } from "./Logo";
import { ProgressBar } from "./ProgressBar";

interface Props {
  title?: string;
  progress?: number;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

/** Shared frame for every onboarding screen: logo top-left, section title top-right, progress bar. */
export function OnboardingScreen({ title, progress, children, footer, className }: Props) {
  return (
    <div className="relative z-10 flex min-h-dvh flex-col px-6 safe-top safe-bottom">
      <header className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 pt-2">
        <Link to="/" aria-label="VessA home" className="shrink-0">
          <Logo className="h-10" />
        </Link>
        {title ? (
          <p className="truncate text-right font-display text-base italic text-ink-soft">{title}</p>
        ) : (
          <span />
        )}
      </header>
      {progress !== undefined && <ProgressBar value={progress} className="mt-6" />}
      <main className={cn("flex flex-1 flex-col pt-8 animate-rise", className)}>{children}</main>
      {footer && <footer className="pt-6">{footer}</footer>}
    </div>
  );
}

export function ScreenTitle({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h1 className={cn("text-[2rem] font-medium leading-[1.1] text-ink text-balance", className)}>
      {children}
    </h1>
  );
}

export function Accent({ children }: { children: ReactNode }) {
  return <span className="italic text-accent-ink">{children}</span>;
}

export function StepBadge({ n }: { n: number }) {
  return (
    <span className="glass grid h-12 w-12 place-items-center rounded-full font-display text-xl text-accent-ink">
      {n}
    </span>
  );
}
