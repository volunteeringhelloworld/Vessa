import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { AppScreen } from "@/components/vessa/AppScreen";
import { Logo3D } from "@/components/vessa/Logo";
import { Button } from "@/components/ui/button";
import { useRequireSession } from "@/hooks/use-guards";
import { useT } from "@/lib/i18n";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/signup/success")({
  head: () => pageHead("You're all set", "Your VessA profile is ready."),
  component: SignupSuccess,
});

function SignupSuccess() {
  const t = useT();
  useRequireSession();

  return (
    <AppScreen variant="glow" className="text-center">
      <section className="flex flex-1 flex-col items-center justify-center">
        <Logo3D className="h-44 w-44 animate-rise" />
        <h1 className="mt-14 animate-rise text-[2.75rem] font-normal leading-[1.02] [animation-delay:150ms]">
          {t("success.title")}
        </h1>
        <p className="mt-3 animate-rise text-base text-muted-foreground [animation-delay:250ms]">
          {t("success.message")}
        </p>
      </section>
      <Button
        asChild
        variant="hero"
        size="xl"
        className="w-full animate-rise [animation-delay:350ms]"
      >
        <Link to="/home" replace>
          {t("success.cta")} <ArrowRight />
        </Link>
      </Button>
    </AppScreen>
  );
}
