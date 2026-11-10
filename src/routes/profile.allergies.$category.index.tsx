import { Link, createFileRoute, notFound, useNavigate } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { ChoiceChip } from "@/components/vessa/ChoiceChip";
import { CustomAllergyScreen } from "@/components/vessa/CustomAllergyScreen";
import { OnboardingScreen, ScreenTitle } from "@/components/vessa/OnboardingScreen";
import { useSectionExit } from "@/hooks/use-section-exit";
import { PROGRESS } from "@/lib/profile-logic";
import { ALLERGY_GROUPS, isCustomGroup, type AllergyGroup } from "@/lib/profile-options";
import { useProfile } from "@/lib/profile-store";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/profile/allergies/$category/")({
  beforeLoad: ({ params }) => {
    if (!isCustomGroup(params.category)) throw notFound();
  },
  head: ({ params }) => {
    const label = params.category === "other" ? "Other" : (ALLERGY_GROUPS[params.category as AllergyGroup]?.title ?? "Allergy");
    return pageHead(`${label} allergies`, `Select your ${label.toLowerCase()} allergies in VessA.`);
  },
  component: CategoryStep,
});

function CategoryStep() {
  const { category } = Route.useParams();
  if (category === "other") return <CustomAllergyScreen group="other" />;
  return <GroupScreen group={category as AllergyGroup} />;
}

/** Frames 7.2.1 – 7.2.4 */
function GroupScreen({ group }: { group: AllergyGroup }) {
  const navigate = useNavigate();
  const exit = useSectionExit();
  const meta = ALLERGY_GROUPS[group];
  const selected = useProfile((s) => s.allergies[group]);
  const custom = useProfile((s) => s.customAllergies[group]);
  const toggle = useProfile((s) => s.toggleAllergy);
  const removeCustom = useProfile((s) => s.removeCustomAllergy);
  const Icon = meta.icon;

  return (
    <OnboardingScreen
      title="Allergies"
      progress={PROGRESS.allergyDetail}
      footer={
        <div className="grid grid-cols-2 gap-3">
          <Button variant="glass" size="pill" onClick={() => exit("/profile/medications")}>
            Next
          </Button>
          <Button variant="vessa" size="pill" onClick={() => navigate({ to: "/profile/allergies" })}>
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
        <p className="mt-3 text-sm text-ink-soft">Select all that apply.</p>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-2.5">
        {meta.options.map((o) => (
          <ChoiceChip key={o} selected={selected.includes(o)} onClick={() => toggle(group, o)}>
            {o}
          </ChoiceChip>
        ))}
        {custom.map((c) => (
          <ChoiceChip key={c} kind="remove" selected onClick={() => removeCustom(group, c)} aria-label={`Remove ${c}`}>
            {c}
          </ChoiceChip>
        ))}
        <Link
          to="/profile/allergies/$category/custom"
          params={{ category: group }}
          className="glass inline-flex h-11 items-center gap-2 rounded-full border-dashed px-4 text-sm font-semibold text-accent-ink transition-all active:scale-[0.97]"
        >
          {meta.otherLabel} (+)
        </Link>
      </div>
    </OnboardingScreen>
  );
}
