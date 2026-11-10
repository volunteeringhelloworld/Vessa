import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { EntryInput } from "@/components/vessa/EntryInput";
import { OnboardingScreen, ScreenTitle, StepBadge } from "@/components/vessa/OnboardingScreen";
import { PROGRESS } from "@/lib/profile-logic";
import { useProfile } from "@/lib/profile-store";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/profile/family")({
  head: () => pageHead("Family history", "Add any medical conditions that run in your family."),
  component: FamilyStep,
});

function FamilyStep() {
  const navigate = useNavigate();
  const items = useProfile((s) => s.familyHistory);
  const add = useProfile((s) => s.addFamilyHistory);
  const remove = useProfile((s) => s.removeFamilyHistory);
  const [value, setValue] = useState("");

  const commit = () => {
    if (value.trim()) add(value);
    setValue("");
  };
  const hasEntries = items.length > 0 || value.trim().length > 0;

  return (
    <OnboardingScreen
      title="Medical History"
      progress={PROGRESS.family}
      footer={
        <Button
          variant={hasEntries ? "vessa" : "glass"}
          size="pill"
          className="w-full"
          onClick={() => {
            commit();
            navigate({ to: "/profile/review" });
          }}
        >
          {hasEntries ? "Next" : "Skip for now"}
        </Button>
      }
    >
      <div className="flex flex-col items-center text-center">
        <div className="mt-2">
          <StepBadge n={3} />
        </div>
        <ScreenTitle className="mt-6">Does your family have a history of medical conditions?</ScreenTitle>
      </div>
      <div className="mt-10">
        <EntryInput
          label="Family condition"
          value={value}
          onChange={setValue}
          onAdd={commit}
          items={items}
          onRemove={remove}
          placeholder="e.g. Diabetes (mother)"
        />
      </div>
    </OnboardingScreen>
  );
}
