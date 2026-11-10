import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Screen } from "@/components/vessa/Screen";
import { PageIntro, StepHeader } from "@/components/vessa/TopBar";
import { Hydrated } from "@/components/vessa/bits";
import { CategoryIcon } from "@/components/vessa/CategoryIcon";
import { cn } from "@/lib/utils";
import { CATEGORIES } from "@/lib/booking/data";
import { nextAfter } from "@/lib/booking/flow";
import { booking, useBooking } from "@/lib/booking/store";

export const Route = createFileRoute("/book/care")({
  head: () => ({
    meta: [
      { title: "Choose your care — VessA" },
      { name: "description", content: "Choose the type of care you’re looking for." },
      { property: "og:title", content: "Choose your care — VessA" },
      { property: "og:description", content: "Choose the type of care you’re looking for." },
    ],
  }),
  component: ChooseCare,
});

function ChooseCare() {
  const navigate = useNavigate();
  const { draft } = useBooking();
  const [error, setError] = useState(false);
  const count = draft.categories.length;

  const onContinue = () => {
    if (count === 0) {
      setError(true);
      return;
    }
    navigate({ to: nextAfter("/book/reason") });
  };

  return (
    <Screen
      footer={
        <div className="space-y-2">
          {error && count === 0 && (
            <p role="alert" className="text-center text-sm font-semibold text-destructive">
              Please choose at least one type of care.
            </p>
          )}
          <Button variant="cta" size="xl" className="w-full" onClick={onContinue}>
            Continue{count > 0 && ` · ${count} selected`}
          </Button>
        </div>
      }
    >
      <StepHeader step={1} back="/appointments" />
      <PageIntro title="What can we help you with?" subtitle="Choose the type of care you’re looking for. You can pick more than one." />

      <Hydrated>
        <div className="grid grid-cols-2 gap-3" role="group" aria-label="Types of care">
          {CATEGORIES.map((c, i) => {
            const selected = draft.categories.includes(c.id);
            return (
              <button
                key={c.id}
                type="button"
                aria-pressed={selected}
                onClick={() => {
                  booking.toggleCategory(c.id);
                  setError(false);
                }}
                style={{ animationDelay: `${i * 35}ms` }}
                className={cn(
                  "animate-rise relative flex min-h-[132px] flex-col items-start justify-between rounded-[26px] p-4 text-left transition-all active:scale-[0.98]",
                  selected
                    ? "glass-tint border-2! border-coral! shadow-[var(--shadow-soft)]"
                    : "glass",
                )}
              >
                <span className={cn("grid size-12 place-items-center rounded-2xl text-primary", c.tone)}>
                  <CategoryIcon id={c.id} className="size-6" />
                </span>
                <span className="mt-3 pr-5 text-[15px] font-bold leading-snug text-cocoa">{c.label}</span>
                <span
                  className={cn(
                    "absolute right-3 top-3 grid size-6 place-items-center rounded-full border-2 transition-all",
                    selected ? "border-transparent bg-cta" : "border-white/80 bg-white/40",
                  )}
                  aria-hidden
                >
                  {selected && <Check className="size-3.5 text-cocoa" strokeWidth={3} />}
                </span>
              </button>
            );
          })}
        </div>
      </Hydrated>
    </Screen>
  );
}
