import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Pencil } from "lucide-react";
import { useEffect, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { OnboardingScreen, ScreenTitle } from "@/components/vessa/OnboardingScreen";
import { PROGRESS } from "@/lib/profile-logic";
import { ALLERGY_CATEGORIES, ALLERGY_GROUPS, CONDITION_OPTIONS, isAllergyGroup } from "@/lib/profile-options";
import { useProfile } from "@/lib/profile-store";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/profile/review")({
  head: () => pageHead("Review your profile", "Check your VessA health profile before confirming."),
  component: ReviewStep,
});

type EditTarget = "/profile/name" | "/profile/conditions" | "/profile/allergies" | "/profile/medications" | "/profile/history";

function ReviewStep() {
  const navigate = useNavigate();
  const p = useProfile();
  const { setReturnToReview } = p;

  useEffect(() => setReturnToReview(false), [setReturnToReview]);

  const edit = (to: EditTarget) => {
    setReturnToReview(true);
    navigate({ to });
  };

  const conditionLabels = p.conditions
    .map((id) => {
      if (id === "others") return p.otherCondition.trim() ? `Other: ${p.otherCondition.trim()}` : "Other";
      return CONDITION_OPTIONS.find((o) => o.id === id)?.label;
    })
    .filter(Boolean) as string[];

  const allergyRows = p.allergyCategories
    .filter((c) => c !== "none")
    .map((c) => {
      const label = ALLERGY_CATEGORIES.find((x) => x.id === c)?.label ?? c;
      const items = [...(isAllergyGroup(c) ? p.allergies[c] : []), ...p.customAllergies[c]];
      return { label: isAllergyGroup(c) ? ALLERGY_GROUPS[c].title : label, items };
    });

  return (
    <OnboardingScreen
      title="One Last Look"
      progress={PROGRESS.review}
      footer={
        <Button
          variant="vessa"
          size="pill"
          className="w-full"
          onClick={() => {
            p.complete();
            navigate({ to: "/profile/complete" });
          }}
        >
          Confirm My Profile
        </Button>
      }
    >
      <ScreenTitle>Review Your Profile</ScreenTitle>
      <p className="mt-2 text-sm text-ink-soft">Please check your information before saving.</p>

      <div className="mt-6 space-y-3">
        <Section label="Full name" onEdit={() => edit("/profile/name")}>
          <Value>{p.fullName || <Empty />}</Value>
        </Section>

        <Section label="Medical conditions" onEdit={() => edit("/profile/conditions")}>
          {conditionLabels.length ? <Tags items={conditionLabels} /> : <Empty />}
        </Section>

        <Section label="Allergies" onEdit={() => edit("/profile/allergies")}>
          {p.allergyCategories.includes("none") ? (
            <Value>No known allergies</Value>
          ) : allergyRows.length ? (
            <div className="space-y-2">
              {allergyRows.map((r) => (
                <div key={r.label}>
                  <p className="text-xs font-semibold text-ink-soft">{r.label}</p>
                  {r.items.length ? <Tags items={r.items} /> : <Value>Category selected, no details yet</Value>}
                </div>
              ))}
            </div>
          ) : (
            <Empty />
          )}
        </Section>

        <Section label="Medications" onEdit={() => edit("/profile/medications")}>
          {p.takesMedications === false ? (
            <Value>Not taking any medication</Value>
          ) : p.medications.length ? (
            <ul className="space-y-1.5">
              {p.medications.map((m) => (
                <li key={m.id} className="text-sm text-ink">
                  <span className="font-semibold">{m.name}</span>
                  {(m.dosage || m.frequency) && (
                    <span className="text-ink-soft"> · {[m.dosage, m.frequency].filter(Boolean).join(" · ")}</span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <Empty />
          )}
        </Section>

        <Section label="Medical history" onEdit={() => edit("/profile/history")}>
          <dl className="space-y-2 text-sm">
            <Row term="Surgeries">
              {p.hadSurgery === null ? "—" : p.hadSurgery ? p.surgeries.join(", ") || "Yes" : "None"}
            </Row>
            <Row term="Hospitalized">{p.hospitalized === null ? "—" : p.hospitalized ? "Yes" : "No"}</Row>
            <Row term="Family history">{p.familyHistory.length ? p.familyHistory.join(", ") : "None added"}</Row>
          </dl>
        </Section>
      </div>
    </OnboardingScreen>
  );
}

function Section({ label, onEdit, children }: { label: string; onEdit: () => void; children: ReactNode }) {
  return (
    <section className="glass rounded-3xl px-5 py-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <h2 className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-accent-ink">{label}</h2>
        <button
          type="button"
          onClick={onEdit}
          aria-label={`Edit ${label.toLowerCase()}`}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-cream text-ink-soft transition-colors hover:text-ink"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
      </div>
      {children}
    </section>
  );
}

function Value({ children }: { children: ReactNode }) {
  return <p className="text-sm font-medium text-ink">{children}</p>;
}

function Empty() {
  return <span className="text-sm italic text-ink-soft">Not provided</span>;
}

function Tags({ items }: { items: string[] }) {
  return (
    <div className="mt-1 flex flex-wrap gap-1.5">
      {items.map((t) => (
        <span key={t} className="rounded-full bg-peach px-3 py-1 text-xs font-medium text-ink">
          {t}
        </span>
      ))}
    </div>
  );
}

function Row({ term, children }: { term: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[7rem_minmax(0,1fr)] gap-2">
      <dt className="text-ink-soft">{term}</dt>
      <dd className="font-medium text-ink">{children}</dd>
    </div>
  );
}
