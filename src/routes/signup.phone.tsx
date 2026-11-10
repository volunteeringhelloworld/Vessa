import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { AppScreen } from "@/components/vessa/AppScreen";
import { FlowHeader } from "@/components/vessa/FlowHeader";
import { PhoneField } from "@/components/vessa/PhoneField";
import { FieldError, FieldLabel } from "@/components/vessa/Field";
import { sendDemoOtp } from "@/components/vessa/OtpStep";
import { Button } from "@/components/ui/button";
import { useVessa } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { isValidPhone } from "@/lib/vessa-rules";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/signup/phone")({
  head: () => pageHead("Enter phone number", "Sign up for VessA with your mobile number."),
  component: SignupPhone,
});

function SignupPhone() {
  const t = useT();
  const navigate = useNavigate();
  const draft = useVessa((s) => s.draft);
  const updateDraft = useVessa((s) => s.updateDraft);
  const [touched, setTouched] = useState(false);
  const valid = isValidPhone(draft.countryCode, draft.phone);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!valid) return;
    updateDraft({ otpVerified: false });
    sendDemoOtp("signup", draft.countryCode, draft.phone, (code) => t("otp.demo", { code }));
    navigate({ to: "/signup/otp" });
  };

  return (
    <AppScreen>
      <FlowHeader showLogo={false} />
      <form onSubmit={submit} className="flex flex-1 flex-col" noValidate>
        <div className="flex items-start justify-between gap-4">
          <h1 className="mt-8 animate-rise text-[2.5rem] font-normal leading-[1.05]">
            {t("phone.title")}
          </h1>
        </div>
        <p className="mt-3 animate-rise text-[15px] text-muted-foreground [animation-delay:80ms]">
          {t("phone.subtitle")}
        </p>

        <div className="mt-10 animate-rise [animation-delay:140ms]">
          <FieldLabel htmlFor="signup-phone">{t("phone.label")}</FieldLabel>
          <PhoneField
            id="signup-phone"
            autoFocus
            countryCode={draft.countryCode}
            phone={draft.phone}
            onCountryChange={(countryCode) => updateDraft({ countryCode })}
            onPhoneChange={(phone) => updateDraft({ phone })}
            invalid={touched && !valid}
            errorId="signup-phone-error"
          />
          <FieldError id="signup-phone-error">
            {touched && !valid ? t("phone.invalid") : null}
          </FieldError>
        </div>

        <Button type="submit" variant="hero" size="xl" className="mt-8 w-full">
          {t("common.next")} <ArrowRight />
        </Button>
      </form>
    </AppScreen>
  );
}
