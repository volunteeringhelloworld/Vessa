import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppScreen } from "@/components/vessa/AppScreen";
import { FlowHeader } from "@/components/vessa/FlowHeader";
import { PasswordForm } from "@/components/vessa/PasswordForm";
import { useRequireDraft } from "@/hooks/use-guards";
import { useVessa } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/signup/verification")({
  head: () => pageHead("Verification", "Secure your VessA account with a password."),
  component: SignupVerification,
});

function SignupVerification() {
  const t = useT();
  const navigate = useNavigate();
  const ready = useRequireDraft((s) => s.draft.otpVerified && s.draft.name.trim().length > 0);
  // Kept in memory only so the password never sits in storage before the account exists.
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");

  return (
    <AppScreen>
      <FlowHeader label={t("verify.section")} showLogo={false} />
      <h1 className="mt-8 animate-rise text-[2.5rem] font-normal leading-[1.05]">
        {t("verify.title").split(" ").slice(0, -2).join(" ")}{" "}
        <span className="italic text-terracotta">
          {t("verify.title").split(" ").slice(-2).join(" ")}
        </span>
      </h1>
      <p className="mt-3 animate-rise text-[15px] text-muted-foreground [animation-delay:80ms]">
        {t("verify.subtitle")}
      </p>

      <PasswordForm
        idPrefix="signup"
        passwordLabel={t("verify.password")}
        confirmLabel={t("verify.confirm")}
        submitLabel={t("verify.submit")}
        password={pw}
        confirm={confirm}
        onPassword={setPw}
        onConfirm={setConfirm}
        onSubmit={() => {
          if (!ready) return;
          useVessa.getState().completeSignup(pw);
          navigate({ to: "/signup/success", replace: true });
        }}
      />
    </AppScreen>
  );
}
