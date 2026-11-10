import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { AppScreen } from "@/components/vessa/AppScreen";
import { FlowHeader } from "@/components/vessa/FlowHeader";
import { FieldError, TextField } from "@/components/vessa/Field";
import { Button } from "@/components/ui/button";
import { useRequireDraft } from "@/hooks/use-guards";
import { useVessa } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/signup/profile")({
  head: () => pageHead("Personal profile", "Tell VessA what you'd like to be called."),
  component: SignupProfile,
});

function SignupProfile() {
  const t = useT();
  const navigate = useNavigate();
  const name = useVessa((s) => s.draft.name);
  const updateDraft = useVessa((s) => s.updateDraft);
  const [touched, setTouched] = useState(false);
  const ready = useRequireDraft((s) => s.draft.otpVerified);
  const invalid = name.trim().length === 0;

  return (
    <AppScreen>
      <FlowHeader label={t("profile.section")} />
      <form
        noValidate
        className="flex flex-1 flex-col"
        onSubmit={(e) => {
          e.preventDefault();
          setTouched(true);
          if (invalid || !ready) return;
          updateDraft({ name: name.trim() });
          navigate({ to: "/signup/dob" });
        }}
      >
        <h1 className="mt-10 animate-rise text-[2.5rem] font-normal leading-[1.05]">
          {t("profile.title")}
        </h1>
        <label
          htmlFor="pref-name"
          className="mt-8 block animate-rise font-display text-xl text-terracotta [animation-delay:80ms]"
        >
          {t("profile.question")}
        </label>
        <TextField
          id="pref-name"
          autoFocus
          autoComplete="nickname"
          maxLength={40}
          placeholder={t("profile.placeholder")}
          value={name}
          onChange={(e) => updateDraft({ name: e.target.value })}
          aria-invalid={(touched && invalid) || undefined}
          aria-describedby="pref-name-error"
          className="mt-4 animate-rise [animation-delay:140ms]"
        />
        <FieldError id="pref-name-error">
          {touched && invalid ? t("profile.required") : null}
        </FieldError>

        <Button type="submit" variant="hero" size="xl" className="mt-8 w-full">
          {t("common.next")} <ArrowRight />
        </Button>
      </form>
    </AppScreen>
  );
}
