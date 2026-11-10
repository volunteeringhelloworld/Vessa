import type { ReactNode } from "react";
import { Link, type LinkProps } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { TOTAL_STEPS } from "@/lib/booking/flow";
import { useBooking } from "@/lib/booking/store";

type BackTarget = NonNullable<LinkProps["to"]>;
type BackParams = Record<string, string> | undefined;

export function BackButton({ to, params, label = "Go back" }: { to: BackTarget; params?: BackParams; label?: string }) {
  const linkProps = (params ? { to, params } : { to }) as LinkProps;
  return (
    <Link
      {...linkProps}
      aria-label={label}
      className="glass grid size-11 shrink-0 place-items-center rounded-full text-cocoa transition-transform active:scale-95"
    >
      <ArrowLeft className="size-5" />
    </Link>
  );
}

export function TopBar({
  back,
  backParams,
  center,
  right,
  className,
}: {
  back?: BackTarget | undefined;
  backParams?: BackParams;
  center?: ReactNode;
  right?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("safe-top sticky top-0 z-20 -mx-5 px-5 pb-3", className)}>
      <div className="flex h-12 items-center gap-3">
        <div className="w-11">{back && <BackButton to={back} params={backParams} />}</div>
        <div className="flex flex-1 justify-center">{center}</div>
        <div className="flex w-11 justify-end">{right}</div>
      </div>
    </header>
  );
}

export function StepProgress({ step }: { step: number }) {
  return (
    <div className="flex w-full max-w-[220px] flex-col items-center gap-1.5" aria-label={`Step ${step} of ${TOTAL_STEPS}`}>
      <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
        Step {step} of {TOTAL_STEPS}
      </span>
      <div className="flex w-full gap-1">
        {Array.from({ length: TOTAL_STEPS }, (_, i) => (
          <span
            key={i}
            className={cn("h-1.5 flex-1 rounded-full transition-colors", i < step ? "bg-cta shadow-none" : "bg-white/60")}
          />
        ))}
      </div>
    </div>
  );
}

/** Header for the booking steps: back arrow (to review while editing) + progress. */
export function StepHeader({ step, back, backParams, right }: { step: number; back: BackTarget; backParams?: BackParams; right?: ReactNode }) {
  const { editingFromReview } = useBooking();
  const toReview = editingFromReview && step < TOTAL_STEPS;
  return (
    <TopBar
      back={toReview ? "/book/review" : back}
      backParams={toReview ? undefined : backParams}
      center={<StepProgress step={step} />}
      right={right}
    />
  );
}

export function PageIntro({ title, subtitle, className }: { title: ReactNode; subtitle?: ReactNode; className?: string }) {
  return (
    <div className={cn("animate-rise mb-5 mt-2", className)}>
      <h1 className="text-[28px] font-semibold leading-[1.12] text-cocoa">{title}</h1>
      {subtitle && <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{subtitle}</p>}
    </div>
  );
}
