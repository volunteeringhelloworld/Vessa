import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import { IntentOptions } from "@/components/vessa/IntentOptions";
import { AppScreen } from "@/components/vessa/AppScreen";
import { Button } from "@/components/ui/button";
import { useVessa } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/onboarding")({
  head: () =>
    pageHead(
      "What brings you here?",
      "Tell VessA what you'd like help with: appointments, providers, records or medication.",
    ),
  component: Onboarding,
});

function Onboarding() {
  const t = useT();
  const navigate = useNavigate();
  const count = useVessa((s) => s.intents.length);
  const start = useRef<{ x: number; y: number } | null>(null);

  const next = () => navigate({ to: "/welcome" });

  return (
    <AppScreen variant="warm">
      <div
        className="flex flex-1 flex-col"
        onTouchStart={(e) =>
          (start.current = { x: e.touches[0]?.clientX ?? 0, y: e.touches[0]?.clientY ?? 0 })
        }
        onTouchEnd={(e) => {
          if (!start.current) return;
          const dx = (e.changedTouches[0]?.clientX ?? 0) - start.current.x;
          const dy = (e.changedTouches[0]?.clientY ?? 0) - start.current.y;
          start.current = null;
          if (dx < -60 && Math.abs(dx) > Math.abs(dy) * 1.5) next();
        }}
      >
        <h1 className="mt-10 animate-rise text-[2.75rem] font-normal leading-[1.02] text-terracotta">
          {t("onb.title")}
        </h1>
        <p className="mt-3 animate-rise text-[15px] text-muted-foreground [animation-delay:80ms]">
          {t("onb.subtitle")}
        </p>

        <div className="mt-8 animate-rise [animation-delay:160ms]">
          <IntentOptions />
        </div>

        <p className="mt-4 h-5 text-sm font-medium text-muted-foreground" aria-live="polite">
          {count > 0 ? t("onb.selected", { n: count }) : ""}
        </p>

        <div className="mt-auto flex items-center justify-between pt-6">
          <div className="flex items-center gap-2" aria-label={t("onb.swipe")}>
            <span aria-current="step" className="h-2 w-8 rounded-full bg-terracotta" />
            <Link
              to="/welcome"
              aria-label={t("onb.slide", { n: 2 })}
              className="grid h-6 w-6 place-items-center"
            >
              <span className="h-2 w-2 rounded-full bg-terracotta/30" />
            </Link>
          </div>
          <Button variant="hero" size="icon-lg" onClick={next} aria-label={t("common.next")}>
            <ArrowRight />
          </Button>
        </div>
      </div>
    </AppScreen>
  );
}
