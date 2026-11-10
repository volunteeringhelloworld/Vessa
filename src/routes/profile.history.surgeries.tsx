import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { EntryInput } from "@/components/vessa/EntryInput";
import { OnboardingScreen, ScreenTitle } from "@/components/vessa/OnboardingScreen";
import { PROGRESS } from "@/lib/profile-logic";
import { useProfile } from "@/lib/profile-store";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/profile/history/surgeries")({
  head: () => pageHead("Surgery details", "List the types of surgeries you have had."),
  component: SurgeriesStep,
});

function SurgeriesStep() {
  const navigate = useNavigate();
  const items = useProfile((s) => s.surgeries);
  const add = useProfile((s) => s.addSurgery);
  const remove = useProfile((s) => s.removeSurgery);
  const [value, setValue] = useState("");

  const commit = () => {
    if (value.trim()) add(value);
    setValue("");
  };

  return (
    <OnboardingScreen
      title="Medical History"
      progress={PROGRESS.surgeries}
      footer={
        <Button
          variant="vessa"
          size="pill"
          className="w-full"
          disabled={items.length === 0 && !value.trim()}
          onClick={() => {
            commit();
            navigate({ to: "/profile/hospitalization" });
          }}
        >
          Next
        </Button>
      }
    >
      <ScreenTitle>What types of surgeries did you have?</ScreenTitle>
      <p className="mt-3 text-sm text-ink-soft">Add each one with the + button. Include the year if you remember it.</p>
      <div className="mt-8">
        <EntryInput
          label="Surgery"
          value={value}
          onChange={setValue}
          onAdd={commit}
          items={items}
          onRemove={remove}
          placeholder="e.g. Appendectomy, 2019"
        />
      </div>
    </OnboardingScreen>
  );
}
