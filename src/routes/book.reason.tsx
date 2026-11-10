import { useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { FileText, ImageIcon, Paperclip, PenLine, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Screen } from "@/components/vessa/Screen";
import { PageIntro, StepHeader } from "@/components/vessa/TopBar";
import { Hydrated, SectionTitle } from "@/components/vessa/bits";
import { cn } from "@/lib/utils";
import { REASONS } from "@/lib/booking/data";
import { nextAfter } from "@/lib/booking/flow";
import { booking, useBooking } from "@/lib/booking/store";

const MAX_FILES = 5;
const MAX_SIZE = 10 * 1024 * 1024;

export const Route = createFileRoute("/book/reason")({
  head: () => ({
    meta: [
      { title: "Tell us what’s going on — VessA" },
      { name: "description", content: "Tell us a little about what you’re experiencing before your visit." },
      { property: "og:title", content: "Tell us what’s going on — VessA" },
      { property: "og:description", content: "Tell us a little about what you’re experiencing before your visit." },
    ],
  }),
  component: Reason,
});

const formatSize = (n: number) => (n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

function Reason() {
  const navigate = useNavigate();
  const { draft } = useBooking();
  const fileInput = useRef<HTMLInputElement>(null);
  const [error, setError] = useState(false);

  const onFiles = (list: FileList | null) => {
    if (!list) return;
    const room = MAX_FILES - draft.attachments.length;
    const files = Array.from(list);
    const tooBig = files.filter((f) => f.size > MAX_SIZE);
    const ok = files.filter((f) => f.size <= MAX_SIZE).slice(0, Math.max(0, room));
    if (tooBig.length) toast.error("Some files are over 10 MB and weren’t added.");
    if (files.length - tooBig.length > room) toast.error(`You can attach up to ${MAX_FILES} files.`);
    booking.addAttachments(
      ok.map((f) => ({ id: `${f.name}-${f.size}-${Math.random().toString(36).slice(2, 7)}`, name: f.name, size: f.size, type: f.type })),
    );
    if (fileInput.current) fileInput.current.value = "";
  };

  const onContinue = () => {
    if (!draft.reason) {
      setError(true);
      return;
    }
    navigate({ to: nextAfter("/book/facilities") });
  };

  return (
    <Screen
      footer={
        <div className="space-y-2">
          {error && !draft.reason && (
            <p role="alert" className="text-center text-sm font-semibold text-destructive">
              Please choose a reason for your visit.
            </p>
          )}
          <Button variant="cta" size="xl" className="w-full" onClick={onContinue}>
            Continue
          </Button>
        </div>
      }
    >
      <StepHeader step={2} back="/book/care" />
      <PageIntro
        title={
          <>
            How can we make your visit <span className="italic text-primary">better?</span>
          </>
        }
        subtitle="Tell us a little about what you’re experiencing."
      />

      <Hydrated>
        <div role="radiogroup" aria-label="Reason for visit" className="space-y-2.5">
          {REASONS.map((r) => {
            const selected = draft.reason === r;
            return (
              <button
                key={r}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => {
                  booking.setReason(r);
                  setError(false);
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-full px-5 py-3.5 text-left text-[15px] font-bold text-cocoa transition-all active:scale-[0.99]",
                  selected ? "glass-tint border-2! border-coral!" : "glass",
                )}
              >
                <span
                  className={cn(
                    "grid size-5 shrink-0 place-items-center rounded-full border-2",
                    selected ? "border-primary" : "border-muted-foreground/40",
                  )}
                >
                  {selected && <span className="size-2.5 rounded-full bg-primary" />}
                </span>
                {r}
              </button>
            );
          })}
        </div>

        <SectionTitle>Anything else? (optional)</SectionTitle>
        <label className="glass flex gap-3 rounded-3xl px-4 py-3.5 focus-within:ring-2 focus-within:ring-ring">
          <PenLine className="mt-0.5 size-5 shrink-0 text-primary" />
          <span className="sr-only">Describe your concern</span>
          <textarea
            value={draft.concern}
            onChange={(e) => booking.setConcern(e.target.value)}
            placeholder="Describe your concern…"
            rows={3}
            maxLength={500}
            className="w-full resize-none bg-transparent text-[15px] text-cocoa placeholder:text-muted-foreground focus:outline-none"
          />
        </label>
        <p className="mt-1.5 px-2 text-xs text-muted-foreground">Share only what you’re comfortable with — your doctor will ask the rest.</p>

        <input
          ref={fileInput}
          type="file"
          accept="image/*,application/pdf"
          multiple
          className="hidden"
          onChange={(e) => onFiles(e.target.files)}
        />
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          disabled={draft.attachments.length >= MAX_FILES}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-coral/70 bg-white/30 px-4 py-4 text-sm font-bold text-cocoa transition-colors hover:bg-white/50 disabled:opacity-50"
        >
          <Paperclip className="size-4 text-primary" />
          Attach medical documents or images
        </button>

        {draft.attachments.length > 0 && (
          <ul className="mt-3 space-y-2">
            {draft.attachments.map((a) => (
              <li key={a.id} className="glass flex items-center gap-3 rounded-2xl px-3 py-2.5">
                <span className="grid size-9 place-items-center rounded-xl bg-peach text-primary">
                  {a.type.startsWith("image/") ? <ImageIcon className="size-4" /> : <FileText className="size-4" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-cocoa">{a.name}</span>
                  <span className="text-xs text-muted-foreground">{formatSize(a.size)}</span>
                </span>
                <button
                  type="button"
                  aria-label={`Remove ${a.name}`}
                  onClick={() => booking.removeAttachment(a.id)}
                  className="grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-white/60 hover:text-cocoa"
                >
                  <X className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Hydrated>
    </Screen>
  );
}
