import { createFileRoute } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { ChoiceChip } from "@/components/vessa/ChoiceChip";
import { ConditionCarousel } from "@/components/vessa/ConditionCarousel";
import { OnboardingScreen, ScreenTitle } from "@/components/vessa/OnboardingScreen";
import { useSectionExit } from "@/hooks/use-section-exit";
import { PROGRESS } from "@/lib/profile-logic";
import { CONDITION_OPTIONS } from "@/lib/profile-options";
import { useProfile } from "@/lib/profile-store";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/profile/conditions")({
  head: () => pageHead("Medical conditions", "Select any existing medical conditions for your VessA profile."),
  component: ConditionsStep,
});

function ConditionsStep() {
  const conditions = useProfile((s) => s.conditions);
  const toggle = useProfile((s) => s.toggleCondition);
  const otherCondition = useProfile((s) => s.otherCondition);
  const setOther = useProfile((s) => s.setOtherCondition);
  const exit = useSectionExit();
  const showOther = conditions.includes("others");
  const valid = conditions.length > 0 && (!showOther || otherCondition.trim().length > 0);

  return (
    <OnboardingScreen
      title="Medical Conditions"
      progress={PROGRESS.conditions}
      footer={
        <Button variant="vessa" size="pill" className="w-full" disabled={!valid} onClick={() => exit("/profile/allergies")}>
          Next
        </Button>
      }
    >
      <ScreenTitle>Do you have any existing medical conditions?</ScreenTitle>
      <p className="mt-3 text-sm text-ink-soft">Swipe and tap all that apply.</p>

      <div className="mt-4">
        <ConditionCarousel options={CONDITION_OPTIONS} selected={conditions} onToggle={toggle} />
      </div>

      {showOther && (
        <div className="mt-6 animate-rise">
          <label htmlFor="other-condition" className="mb-2 block px-2 text-sm font-medium text-accent-ink">
            Other conditions
          </label>
          <input
            id="other-condition"
            value={otherCondition}
            onChange={(e) => setOther(e.target.value)}
            placeholder="e.g. Thyroid disorder, arthritis"
            className="glass h-14 w-full rounded-full px-5 text-base text-ink outline-none placeholder:text-ink-soft/60 focus:ring-2 focus:ring-coral"
          />
        </div>
      )}

      {conditions.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2" aria-label="Selected conditions">
          {conditions.map((id) => {
            const o = CONDITION_OPTIONS.find((x) => x.id === id);
            if (!o) return null;
            return (
              <ChoiceChip key={id} kind="remove" onClick={() => toggle(id)} aria-label={`Remove ${o.label}`}>
                {o.label}
              </ChoiceChip>
            );
          })}
        </div>
      )}
    </OnboardingScreen>
  );
}
