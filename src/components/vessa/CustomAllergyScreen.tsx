import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useSectionExit } from "@/hooks/use-section-exit";
import { PROGRESS } from "@/lib/profile-logic";
import { CUSTOM_TITLES, type CustomGroup } from "@/lib/profile-options";
import { useProfile } from "@/lib/profile-store";

import { EntryInput } from "./EntryInput";
import { OnboardingScreen, ScreenTitle } from "./OnboardingScreen";

/** Frames 7.2.1.1 / 7.2.2.1 / 7.2.3.1 / 7.2.4.1 / 7.2.5 — free-text allergy entries. */
export function CustomAllergyScreen({ group }: { group: CustomGroup }) {
  const navigate = useNavigate();
  const exit = useSectionExit();
  const items = useProfile((s) => s.customAllergies[group]);
  const add = useProfile((s) => s.addCustomAllergy);
  const removeItem = useProfile((s) => s.removeCustomAllergy);
  const [value, setValue] = useState("");
  const meta = CUSTOM_TITLES[group];
  const Icon = meta.icon;

  const commit = () => {
    if (value.trim()) add(group, value);
    setValue("");
  };
  const hasEntries = items.length > 0 || value.trim().length > 0;

  return (
    <OnboardingScreen
      title="Allergies"
      progress={PROGRESS.allergyCustom}
      footer={
        <div className={hasEntries ? "grid grid-cols-2 gap-3" : ""}>
          {hasEntries && (
            <Button
              variant="glass"
              size="pill"
              onClick={() => {
                commit();
                exit("/profile/medications");
              }}
            >
              Next
            </Button>
          )}
          <Button
            variant="vessa"
            size="pill"
            className="w-full"
            onClick={() => {
              commit();
              navigate({ to: "/profile/allergies" });
            }}
          >
            Add Another
          </Button>
        </div>
      }
    >
      <div className="flex flex-col items-center text-center">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-gradient-primary text-ink shadow-soft">
          <Icon className="h-7 w-7" strokeWidth={1.75} />
        </span>
        <p className="mt-3 font-display text-lg italic text-accent-ink">{meta.title}</p>
        <ScreenTitle className="mt-1">What are you allergic to?</ScreenTitle>
        <p className="mt-3 text-sm text-ink-soft">Type an allergy and tap + to add as many as you need.</p>
      </div>
      <div className="mt-8">
        <EntryInput
          label={`${meta.title} allergy`}
          value={value}
          onChange={setValue}
          onAdd={commit}
          items={items}
          onRemove={(v) => removeItem(group, v)}
          placeholder={meta.placeholder}
        />
      </div>
      {group !== "other" && (
        <Link
          to="/profile/allergies/$category"
          params={{ category: group }}
          onClick={commit}
          className="mt-6 self-center text-sm font-medium text-ink-soft underline-offset-4 hover:underline"
        >
          Back to {meta.title.toLowerCase()} list
        </Link>
      )}
    </OnboardingScreen>
  );
}
