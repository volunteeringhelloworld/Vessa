import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { Accent, OnboardingScreen, ScreenTitle, StepBadge } from "@/components/vessa/OnboardingScreen";
import { YesNoChoice } from "@/components/vessa/YesNoChoice";
import { PROGRESS, routeAfterSurgeryAnswer } from "@/lib/profile-logic";
import { useProfile } from "@/lib/profile-store";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/profile/history/")({
  head: () => pageHead("Medical history", "Share any previous surgeries with VessA."),
  component: HistoryStep,
});

function HistoryStep() {
  const navigate = useNavigate();
  const value = useProfile((s) => s.hadSurgery);
  const set = useProfile((s) => s.setHadSurgery);

  return (
    <OnboardingScreen title="Medical History" progress={PROGRESS.history} className="items-center text-center">
      <ScreenTitle>
        Let&rsquo;s learn about your <Accent>Medical History</Accent>
      </ScreenTitle>
      <div className="mt-10">
        <StepBadge n={1} />
      </div>
      <p className="mt-5 text-xl font-medium text-ink">Have you had any previous surgeries?</p>
      <div className="mt-10 w-full">
        <YesNoChoice
          shape="circle"
          value={value}
          onSelect={(v) => {
            set(v);
            navigate({ to: routeAfterSurgeryAnswer(v ? "yes" : "no") });
          }}
        />
      </div>
    </OnboardingScreen>
  );
}
