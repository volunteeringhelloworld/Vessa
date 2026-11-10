import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { OnboardingScreen, ScreenTitle } from "@/components/vessa/OnboardingScreen";
import { useSectionExit } from "@/hooks/use-section-exit";
import { PROGRESS } from "@/lib/profile-logic";
import { ALLERGY_CATEGORIES, isAllergyGroup, type AllergyCategory } from "@/lib/profile-options";
import { useProfile } from "@/lib/profile-store";
import { pageHead } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/profile/allergies/")({
  head: () => pageHead("Allergies", "Tell VessA about any allergies we should know about."),
  component: AllergiesStep,
});

function AllergiesStep() {
  const navigate = useNavigate();
  const exit = useSectionExit();
  const categories = useProfile((s) => s.allergyCategories);
  const allergies = useProfile((s) => s.allergies);
  const custom = useProfile((s) => s.customAllergies);
  const select = useProfile((s) => s.selectAllergyCategory);
  const toggle = useProfile((s) => s.toggleAllergyCategory);
  const remove = useProfile((s) => s.removeAllergyCategory);

  const countFor = (c: AllergyCategory) => {
    if (c === "none") return 0;
    const presets = isAllergyGroup(c) ? allergies[c].length : 0;
    return presets + custom[c].length;
  };

  const open = (c: AllergyCategory) => {
    if (c === "none") {
      toggle("none");
      return;
    }
    select(c);
    navigate({ to: "/profile/allergies/$category", params: { category: c } });
  };

  return (
    <OnboardingScreen
      title="Allergies"
      progress={PROGRESS.allergies}
      footer={
        <Button
          variant="vessa"
          size="pill"
          className="w-full"
          disabled={categories.length === 0}
          onClick={() => exit("/profile/medications")}
        >
          Next
        </Button>
      }
    >
      <ScreenTitle>Do you have any allergies we should know about?</ScreenTitle>
      <p className="mt-3 text-sm text-ink-soft">Choose every category that applies — tap one to add details.</p>

      <div className="mt-8 grid grid-cols-2 gap-3">
        {ALLERGY_CATEGORIES.map((c) => {
          const isSel = categories.includes(c.id);
          const Icon = c.icon;
          const count = countFor(c.id);
          return (
            <div key={c.id} className="relative">
              <button
                type="button"
                aria-pressed={isSel}
                onClick={() => open(c.id)}
                className={cn(
                  "flex h-32 w-full flex-col items-center justify-center gap-3 rounded-3xl transition-all active:scale-[0.97]",
                  isSel ? "glass glass-strong ring-2 ring-coral shadow-lift" : "glass hover:bg-glass-strong",
                )}
              >
                <span
                  className={cn(
                    "grid h-12 w-12 place-items-center rounded-full",
                    isSel ? "bg-gradient-primary text-ink" : "bg-cream text-accent-ink",
                  )}
                >
                  <Icon className="h-6 w-6" strokeWidth={1.75} />
                </span>
                <span className="text-sm font-semibold text-ink">{c.label}</span>
                {isSel && c.id !== "none" && (
                  <span className="-mt-2 text-[11px] font-medium text-ink-soft">
                    {count > 0 ? `${count} added` : "Tap to add"}
                  </span>
                )}
              </button>
              {isSel && (
                <button
                  type="button"
                  onClick={() => remove(c.id)}
                  aria-label={`Remove ${c.label}`}
                  className="absolute right-2.5 top-2.5 grid h-7 w-7 place-items-center rounded-full bg-gradient-primary text-ink shadow-soft"
                >
                  {c.id === "none" ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : <X className="h-3.5 w-3.5" strokeWidth={3} />}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </OnboardingScreen>
  );
}
