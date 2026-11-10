import { createFileRoute } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Accent, OnboardingScreen, ScreenTitle } from "@/components/vessa/OnboardingScreen";
import { useSectionExit } from "@/hooks/use-section-exit";
import { PROGRESS } from "@/lib/profile-logic";
import { useProfile } from "@/lib/profile-store";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/profile/name")({
  head: () => pageHead("Your name", "Tell VessA your full name to start your health profile."),
  component: NameStep,
});

function NameStep() {
  const fullName = useProfile((s) => s.fullName);
  const setFullName = useProfile((s) => s.setFullName);
  const exit = useSectionExit();
  const valid = fullName.trim().length > 1;

  return (
    <OnboardingScreen
      title="About You"
      progress={PROGRESS.name}
      footer={
        <Button
          variant="vessa"
          size="pill"
          className="w-full"
          disabled={!valid}
          onClick={() => {
            setFullName(fullName.trim());
            exit("/profile/conditions");
          }}
        >
          Next
        </Button>
      }
    >
      <ScreenTitle className="text-[2.4rem]">
        What&rsquo;s your <br />
        <Accent>full name?</Accent>
      </ScreenTitle>
      <form
        className="mt-10"
        onSubmit={(e) => {
          e.preventDefault();
          if (valid) exit("/profile/conditions");
        }}
      >
        <label htmlFor="full-name" className="sr-only">
          Full name
        </label>
        <input
          id="full-name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="e.g. Momo Aung"
          autoComplete="name"
          autoFocus
          className="glass h-16 w-full rounded-full px-6 text-lg text-ink outline-none placeholder:text-ink-soft/60 focus:ring-2 focus:ring-coral"
        />
      </form>
      <p className="mt-4 px-2 text-sm text-ink-soft">We&rsquo;ll use this to personalise your care.</p>
    </OnboardingScreen>
  );
}
