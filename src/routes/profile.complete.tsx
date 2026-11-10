import { Link, createFileRoute } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Confetti } from "@/components/vessa/Confetti";
import { Accent, OnboardingScreen } from "@/components/vessa/OnboardingScreen";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/profile/complete")({
  head: () => pageHead("You are all set", "Your VessA health profile is ready."),
  component: CompleteStep,
});

function CompleteStep() {
  return (
    <>
      <Confetti />
      <OnboardingScreen
        className="items-center justify-center pb-10 text-center"
        footer={
          <Button asChild variant="vessa" size="pill" className="w-full">
            <Link to="/">Go to Home</Link>
          </Button>
        }
      >
        <div className="glass animate-pop grid h-32 w-32 place-items-center rounded-full shadow-lift">
          <div className="grid h-24 w-24 place-items-center rounded-full bg-gradient-primary">
            <svg viewBox="0 0 48 48" className="h-12 w-12 text-ink" fill="none" aria-hidden>
              <path
                d="M12 25l8 8 16-17"
                stroke="currentColor"
                strokeWidth="4.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="animate-draw"
              />
            </svg>
          </div>
        </div>
        <h1 className="mt-10 text-[2.5rem] font-semibold leading-none tracking-tight text-ink">
          YOU ARE ALL SET!
        </h1>
        <p className="mt-5 font-display text-xl">
          <Accent>Your health profile is ready.</Accent>
        </p>
        <p className="mt-2 text-sm text-ink-soft">You can review or update whatever you need.</p>
      </OnboardingScreen>
    </>
  );
}
