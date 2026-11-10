import { createFileRoute } from "@tanstack/react-router";
import { Pill, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OnboardingScreen, ScreenTitle } from "@/components/vessa/OnboardingScreen";
import { useSectionExit } from "@/hooks/use-section-exit";
import { PROGRESS } from "@/lib/profile-logic";
import { FREQUENCY_OPTIONS } from "@/lib/profile-options";
import { useProfile } from "@/lib/profile-store";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/profile/medications/add")({
  head: () => pageHead("Add medication", "Add the name, dosage and frequency of each medication you take."),
  component: AddMedicationStep,
});

const fieldClass =
  "glass h-14 w-full rounded-full px-5 text-base text-ink outline-none placeholder:text-ink-soft/60 focus:ring-2 focus:ring-coral";

function AddMedicationStep() {
  const exit = useSectionExit();
  const medications = useProfile((s) => s.medications);
  const add = useProfile((s) => s.addMedication);
  const remove = useProfile((s) => s.removeMedication);
  const setTakes = useProfile((s) => s.setTakesMedications);
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");

  const filled = name.trim().length > 0;

  const commit = () => {
    if (!filled) return false;
    add({ name: name.trim(), dosage: dosage.trim(), frequency });
    setName("");
    setDosage("");
    setFrequency("");
    return true;
  };

  return (
    <OnboardingScreen
      title="Medications"
      progress={PROGRESS.medicationsAdd}
      footer={
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="glass"
            size="pill"
            disabled={!filled && medications.length === 0}
            onClick={() => {
              commit();
              setTakes(true);
              exit("/profile/history");
            }}
          >
            Next
          </Button>
          <Button
            variant="vessa"
            size="pill"
            disabled={!filled}
            onClick={() => {
              if (commit()) toast.success("Medication added — add the next one.");
            }}
          >
            Add Another
          </Button>
        </div>
      }
    >
      <ScreenTitle>Tell us about your medication</ScreenTitle>

      {medications.length > 0 && (
        <ul className="mt-6 space-y-2" aria-label="Added medications">
          {medications.map((m) => (
            <li key={m.id} className="glass flex items-center gap-3 rounded-2xl px-4 py-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-primary text-ink">
                <Pill className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink">{m.name}</p>
                <p className="truncate text-xs text-ink-soft">
                  {[m.dosage, m.frequency].filter(Boolean).join(" · ") || "No details"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => remove(m.id)}
                aria-label={`Remove ${m.name}`}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-ink-soft hover:bg-glass-strong"
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <form
        className="mt-6 space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          if (commit()) toast.success("Medication added — add the next one.");
        }}
      >
        <div>
          <label htmlFor="med-name" className="mb-2 block px-2 text-sm font-medium text-accent-ink">
            Medication name
          </label>
          <input id="med-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Metformin" className={fieldClass} />
        </div>
        <div>
          <label htmlFor="med-dosage" className="mb-2 block px-2 text-sm font-medium text-accent-ink">
            Dosage
          </label>
          <input id="med-dosage" value={dosage} onChange={(e) => setDosage(e.target.value)} placeholder="e.g. 500 mg" className={fieldClass} />
        </div>
        <div>
          <label htmlFor="med-frequency" className="mb-2 block px-2 text-sm font-medium text-accent-ink">
            How often do you take it?
          </label>
          <Select value={frequency} onValueChange={setFrequency}>
            <SelectTrigger id="med-frequency" className="glass h-14 rounded-full border-glass-border px-5 text-base text-ink">
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl">
              {FREQUENCY_OPTIONS.map((f) => (
                <SelectItem key={f} value={f} className="rounded-xl py-2.5">
                  {f}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <button type="submit" className="sr-only">
          Add medication
        </button>
      </form>
    </OnboardingScreen>
  );
}
