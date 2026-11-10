import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Camera, ChevronDown, X } from "lucide-react";
import { useRef, useState } from "react";
import { z } from "zod";
import { Field, Screen, StepHeader, Title, VButton, inputCls } from "@/components/vessa/ui";
import { useMed } from "@/lib/med-store";

export const Route = createFileRoute("/medication/add")({
  head: () => ({
    meta: [
      { title: "Add Your Medication – VessA" },
      { name: "description", content: "Add your medication details to create a personalized reminder." },
      { property: "og:title", content: "Add Your Medication – VessA" },
      { property: "og:description", content: "Add your medication details to create a personalized reminder." },
    ],
  }),
  component: AddMedication,
});

const TYPES = ["Tablet", "Capsule", "Liquid", "Injection", "Drops", "Inhaler", "Cream", "Patch", "Other"];

const schema = z.object({
  name: z.string().trim().min(1, "Please enter the medication name").max(80),
  type: z.string().min(1, "Please choose a medication type"),
  dosage: z.string().trim().min(1, "Please enter the dosage").max(40),
});

function resize(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => {
      const s = Math.min(1, 480 / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = img.width * s;
      c.height = img.height * s;
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
      res(c.toDataURL("image/jpeg", 0.8));
    };
    img.onerror = rej;
    img.src = URL.createObjectURL(file);
  });
}

function AddMedication() {
  const navigate = useNavigate();
  const { draft, updateDraft } = useMed();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  const submit = () => {
    const r = schema.safeParse(draft);
    if (!r.success) {
      setErrors(Object.fromEntries(r.error.issues.map((i) => [i.path[0], i.message])));
      return;
    }
    navigate({ to: "/medication/schedule" });
  };

  return (
    <Screen>
      <StepHeader step={1} back={draft.editingId ? "/medication/review" : "/"} />
      <Title title="What medication are you taking?" sub="Add your medication details to create a personalized reminder." />

      <div className="space-y-4">
        <div className="flex justify-center">
          <button
            onClick={() => fileRef.current?.click()}
            className="glass relative grid size-32 place-items-center overflow-hidden rounded-3xl border-dashed text-muted-foreground"
          >
            {draft.photo ? (
              <img src={draft.photo} alt="Medication" className="absolute inset-0 size-full object-cover" />
            ) : (
              <span className="flex flex-col items-center gap-1 text-sm font-semibold">
                <Camera className="size-7 text-coral" />
                Add photo
                <span className="text-xs font-normal">(optional)</span>
              </span>
            )}
          </button>
          {draft.photo && (
            <button aria-label="Remove photo" onClick={() => updateDraft({ photo: undefined })} className="glass -ml-6 grid size-8 place-items-center self-start rounded-full">
              <X className="size-4" />
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (f) updateDraft({ photo: await resize(f) });
              e.target.value = "";
            }}
          />
        </div>

        <Field label="Medication Name" error={errors["name"]}>
          <input className={inputCls} placeholder="e.g. Paracetamol" value={draft.name} maxLength={80} onChange={(e) => updateDraft({ name: e.target.value })} />
        </Field>
        <Field label="Medication Type" error={errors["type"]}>
          <div className="relative">
            <select className={`${inputCls} appearance-none`} value={draft.type} onChange={(e) => updateDraft({ type: e.target.value })}>
              <option value="" disabled>
                Choose a type
              </option>
              {TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute top-3.5 right-4 size-5 text-muted-foreground" />
          </div>
        </Field>
        <Field label="Dosage" error={errors["dosage"]}>
          <input className={inputCls} placeholder="e.g. 1 tablet, 500 mg" value={draft.dosage} maxLength={40} onChange={(e) => updateDraft({ dosage: e.target.value })} />
        </Field>
      </div>

      <div className="mt-auto pt-8">
        <VButton onClick={submit}>Continue</VButton>
      </div>
    </Screen>
  );
}
