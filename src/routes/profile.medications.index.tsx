import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { OnboardingScreen, ScreenTitle } from "@/components/vessa/OnboardingScreen";
import { YesNoChoice } from "@/components/vessa/YesNoChoice";
import { useSectionExit } from "@/hooks/use-section-exit";
import { PROGRESS, routeAfterMedicationsAnswer } from "@/lib/profile-logic";
import { useProfile } from "@/lib/profile-store";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/profile/medications/")({
  head: () => pageHead("Current medications", "Let VessA know whether you currently take any medication."),
  component: MedicationsStep,
});

function MedicationsStep() {
  const navigate = useNavigate();
  const exit = useSectionExit();
  const value = useProfile((s) => s.takesMedications);
  const set = useProfile((s) => s.setTakesMedications);

  return (
    <OnboardingScreen title="Medications" progress={PROGRESS.medications} className="pb-20">
      <ScreenTitle className="mt-6">Are you currently taking any medication?</ScreenTitle>
      <p className="mt-3 text-sm text-ink-soft">Include prescriptions, supplements and over-the-counter medicine.</p>
      <div className="mt-12">
        <YesNoChoice
          value={value}
          onSelect={(v) => {
            set(v);
            const to = routeAfterMedicationsAnswer(v ? "yes" : "no");
            if (to === "/profile/history") exit("/profile/history");
            else navigate({ to });
          }}
        />
      </div>
    </OnboardingScreen>
  );
}
