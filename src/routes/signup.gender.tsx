import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowRight, Mars, Venus, Sparkles } from "lucide-react";
import { AppScreen } from "@/components/vessa/AppScreen";
import { FlowHeader } from "@/components/vessa/FlowHeader";
import { Button } from "@/components/ui/button";
import { useRequireDraft } from "@/hooks/use-guards";
import { useVessa, type Gender } from "@/lib/store";
import { useT, type TKey } from "@/lib/i18n";
import { pageHead } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/signup/gender")({
  head: () => pageHead("Gender", "Choose the gender that best describes you."),
  component: SignupGender,
});

const OPTIONS: { id: Gender; label: TKey; icon: typeof Venus }[] = [
  { id: "female", label: "gender.female", icon: Venus },
  { id: "male", label: "gender.male", icon: Mars },
  { id: "other", label: "gender.other", icon: Sparkles },
];

function SignupGender() {
  const t = useT();
  const navigate = useNavigate();
  const gender = useVessa((s) => s.draft.gender);
  const updateDraft = useVessa((s) => s.updateDraft);
  useRequireDraft((s) => s.draft.name.trim().length > 0, "/signup/profile");

  const startIndex = Math.max(
    0,
    OPTIONS.findIndex((o) => o.id === gender),
  );
  const [emblaRef, embla] = useEmblaCarousel({
    align: "center",
    containScroll: false,
    startIndex,
    skipSnaps: false,
  });

  const onSelect = useCallback(() => {
    if (!embla) return;
    const g = OPTIONS[embla.selectedScrollSnap()]?.id;
    if (g && useVessa.getState().draft.gender !== g) updateDraft({ gender: g });
  }, [embla, updateDraft]);

  useEffect(() => {
    if (!embla) return;
    embla.on("select", onSelect);
    return () => {
      embla.off("select", onSelect);
    };
  }, [embla, onSelect]);

  // Sync wheel to a value restored from saved state.
  useEffect(() => {
    if (embla && embla.selectedScrollSnap() !== startIndex) embla.scrollTo(startIndex, true);
  }, [embla, startIndex]);

  const selectedIndex = startIndex;

  return (
    <AppScreen>
      <FlowHeader label={t("gender.section")} />
      <h1 className="mt-10 animate-rise text-[2.5rem] font-normal leading-[1.05]">
        {t("gender.title")}
      </h1>

      <div
        className="-mx-6 mt-12 animate-rise overflow-hidden py-6 [animation-delay:100ms]"
        ref={emblaRef}
        role="radiogroup"
        aria-label={t("gender.title")}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") embla?.scrollNext();
          if (e.key === "ArrowLeft") embla?.scrollPrev();
        }}
      >
        <div className="flex touch-pan-y">
          {OPTIONS.map((o, i) => {
            const active = i === selectedIndex;
            const Icon = o.icon;
            return (
              <div key={o.id} className="min-w-0 shrink-0 grow-0 basis-[46%] px-2">
                <button
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => embla?.scrollTo(i)}
                  className={cn(
                    "glass mx-auto flex aspect-[3/4] w-full flex-col items-center justify-center gap-4 rounded-[2rem] transition-all duration-500 ease-out",
                    active
                      ? "glass-strong scale-100 opacity-100 ring-2 ring-coral"
                      : "scale-[0.74] opacity-55",
                  )}
                >
                  <span
                    className={cn(
                      "grid h-20 w-20 place-items-center rounded-full transition-colors duration-500",
                      active
                        ? "bg-gradient-accent text-espresso"
                        : "bg-cream/70 text-muted-foreground",
                    )}
                  >
                    <Icon className="h-10 w-10" strokeWidth={1.6} />
                  </span>
                  <span
                    className={cn("font-display transition-all", active ? "text-2xl" : "text-xl")}
                  >
                    {t(o.label)}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-2 flex items-center justify-center gap-2" aria-hidden>
        {OPTIONS.map((o, i) => (
          <span
            key={o.id}
            className={cn(
              "h-1.5 rounded-full transition-all",
              i === selectedIndex ? "w-6 bg-terracotta" : "w-1.5 bg-terracotta/30",
            )}
          />
        ))}
      </div>
      <p className="mt-3 text-center text-sm text-muted-foreground">{t("gender.hint")}</p>

      <Button
        variant="hero"
        size="xl"
        className="mt-auto w-full"
        onClick={() => navigate({ to: "/signup/verification" })}
      >
        {t("common.next")} <ArrowRight />
      </Button>
    </AppScreen>
  );
}
