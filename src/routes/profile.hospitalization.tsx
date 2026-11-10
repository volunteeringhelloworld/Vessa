import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { Accent, OnboardingScreen, ScreenTitle, StepBadge } from "@/components/vessa/OnboardingScreen";
import { YesNoChoice } from "@/components/vessa/YesNoChoice";
import { PROGRESS } from "@/lib/profile-logic";
import { useProfile } from "@/lib/profile-store";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/profile/hospitalization")({
  head: () => pageHead("Hospitalization", "Tell VessA whether you have ever been hospitalized."),
  component: HospitalizationStep,
});

function HospitalizationStep() {
  const navigate = useNavigate();
  const value = useProfile((s) => s.hospitalized);
  const set = useProfile((s) => s.setHospitalized);

  return (
    <OnboardingScreen title="Medical History" progress={PROGRESS.hospitalization} className="items-center text-center">
      <div className="mt-6">
        <StepBadge n={2} />
      </div>
      <ScreenTitle className="mt-6">
        Have you ever been <Accent>hospitalized</Accent>?
      </ScreenTitle>
      <div className="mt-12 w-full">
        <YesNoChoice
          shape="circle"
          value={value}
          onSelect={(v) => {
            set(v);
            navigate({ to: "/profile/family" });
          }}
        />
      </div>
    </OnboardingScreen>
  );
}
