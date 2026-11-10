import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

import { Accent, OnboardingScreen, ScreenTitle } from "@/components/vessa/OnboardingScreen";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/lib/profile-store";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/profile/")({
  head: () => pageHead("Build your health profile", "Let VessA get to know your health in a few short steps."),
  component: Intro,
});

function Intro() {
  const setReturnToReview = useProfile((s) => s.setReturnToReview);
  useEffect(() => setReturnToReview(false), [setReturnToReview]);

  return (
    <OnboardingScreen className="justify-center pb-16 text-center">
      <div className="glass mx-auto mb-10 h-1 w-16 rounded-full" aria-hidden />
      <ScreenTitle className="text-[2.4rem]">
        Let&rsquo;s get to know <Accent>&ldquo;Your Health&rdquo;</Accent>
      </ScreenTitle>
      <p className="mx-auto mt-5 max-w-[19rem] text-[15px] leading-relaxed text-ink-soft">
        Build your health profile so your conditions, allergies and medications live safely in one place.
      </p>
      <Button asChild variant="vessa" size="pill" className="mx-auto mt-12 w-full max-w-[17rem]">
        <Link to="/profile/name">Let&rsquo;s Build</Link>
      </Button>
      <p className="mt-5 text-sm text-ink-soft">It only takes a few minutes.</p>
    </OnboardingScreen>
  );
}
