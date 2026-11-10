import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppScreen } from "@/components/vessa/AppScreen";
import { LogoMark, Wordmark } from "@/components/vessa/Logo";
import { LanguageSwitch } from "@/components/vessa/LanguageSwitch";
import { LegalSheet, type LegalKind } from "@/components/vessa/LegalSheet";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/welcome")({
  head: () =>
    pageHead("Welcome", "Create your VessA account or log in to continue your health journey."),
  component: Welcome,
});

function Welcome() {
  const t = useT();
  const [legal, setLegal] = useState<LegalKind>(null);

  return (
    <AppScreen variant="glow">
      <header className="flex justify-end">
        <LanguageSwitch />
      </header>

      <section className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="glass grid h-40 w-40 animate-rise place-items-center rounded-full">
          <LogoMark className="h-24 w-24 drop-shadow-[0_10px_20px_oklch(0.56_0.14_38/0.35)]" />
        </div>
        <Wordmark className="mt-5 animate-rise text-4xl italic text-terracotta [animation-delay:80ms]" />
        <h1 className="mt-6 animate-rise text-[2.25rem] font-normal leading-tight [animation-delay:140ms]">
          {t("welcome.title")}
        </h1>
        <p className="mt-2 max-w-[18rem] animate-rise text-[15px] text-muted-foreground [animation-delay:200ms]">
          {t("welcome.tagline")}
        </p>
      </section>

      <div className="flex animate-rise flex-col gap-3 [animation-delay:260ms]">
        <Button asChild variant="hero" size="xl" className="w-full">
          <Link to="/signup/phone">{t("welcome.getStarted")}</Link>
        </Button>
        <Button asChild variant="glass" size="xl" className="w-full">
          <Link to="/login">{t("welcome.haveAccount")}</Link>
        </Button>
      </div>

      <nav className="mt-6 flex items-center justify-center gap-5 text-xs text-muted-foreground">
        <button
          type="button"
          onClick={() => setLegal("terms")}
          className="underline-offset-4 hover:underline"
        >
          {t("welcome.terms")}
        </button>
        <span aria-hidden className="h-1 w-1 rounded-full bg-muted-foreground/50" />
        <button
          type="button"
          onClick={() => setLegal("privacy")}
          className="underline-offset-4 hover:underline"
        >
          {t("welcome.privacy")}
        </button>
      </nav>

      <LegalSheet kind={legal} onClose={() => setLegal(null)} />
    </AppScreen>
  );
}
