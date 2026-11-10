import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { AppScreen } from "@/components/vessa/AppScreen";
import { FlowHeader } from "@/components/vessa/FlowHeader";
import { PhoneField } from "@/components/vessa/PhoneField";
import { FieldError, FieldLabel } from "@/components/vessa/Field";
import { OtpStep, sendDemoOtp } from "@/components/vessa/OtpStep";
import { PasswordForm } from "@/components/vessa/PasswordForm";
import { Button } from "@/components/ui/button";
import { useVessa } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { formatPhone, isValidPhone, phoneKey } from "@/lib/vessa-rules";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/forgot-password")({
  head: () =>
    pageHead(
      "Reset password",
      "Verify your mobile number with an OTP and set a new VessA password.",
    ),
  component: ForgotPassword,
});

type Step = "phone" | "otp" | "new";

function ForgotPassword() {
  const t = useT();
  const navigate = useNavigate();
  const account = useVessa((s) => s.account);
  const [step, setStep] = useState<Step>("phone");
  const [countryCode, setCountryCode] = useState(account?.countryCode ?? "TH");
  const [phone, setPhone] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");

  const sendCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidPhone(countryCode, phone)) return setErr(t("phone.invalid"));
    const acc = useVessa.getState().account;
    if (!acc || phoneKey(acc.countryCode, acc.phone) !== phoneKey(countryCode, phone))
      return setErr(t("forgot.notRegistered"));
    useVessa.getState().startReset(phoneKey(countryCode, phone));
    sendDemoOtp("reset", countryCode, phone, (code) => t("otp.demo", { code }));
    setStep("otp");
  };

  return (
    <AppScreen>
      <FlowHeader label={t("forgot.title")} />

      {step === "phone" && (
        <form noValidate onSubmit={sendCode} className="flex flex-1 flex-col">
          <h1 className="mt-8 animate-rise text-[2.5rem] font-normal leading-[1.05]">
            {t("forgot.title")}
          </h1>
          <p className="mt-3 text-[15px] text-muted-foreground">{t("forgot.subtitle")}</p>
          <div className="mt-10">
            <FieldLabel htmlFor="reset-phone">{t("phone.label")}</FieldLabel>
            <PhoneField
              id="reset-phone"
              autoFocus
              countryCode={countryCode}
              phone={phone}
              onCountryChange={setCountryCode}
              onPhoneChange={(v) => {
                setPhone(v);
                setErr(null);
              }}
              invalid={!!err}
              errorId="reset-phone-error"
            />
            <FieldError id="reset-phone-error">{err}</FieldError>
          </div>
          <Button type="submit" variant="hero" size="xl" className="mt-8 w-full">
            {t("forgot.send")} <ArrowRight />
          </Button>
        </form>
      )}

      {step === "otp" && (
        <OtpStep
          purpose="reset"
          countryCode={countryCode}
          phone={phone}
          phoneDisplay={formatPhone(countryCode, phone)}
          onChangeNumber={() => setStep("phone")}
          onVerified={() => {
            useVessa.getState().markResetVerified();
            setStep("new");
          }}
        />
      )}

      {step === "new" && (
        <>
          <h1 className="mt-8 animate-rise text-[2.5rem] font-normal leading-[1.05]">
            {t("forgot.newTitle")}
          </h1>
          <p className="mt-3 text-[15px] text-muted-foreground">{t("forgot.newSubtitle")}</p>
          <PasswordForm
            idPrefix="reset"
            passwordLabel={t("forgot.newPassword")}
            confirmLabel={t("forgot.confirm")}
            submitLabel={t("forgot.save")}
            password={pw}
            confirm={confirm}
            onPassword={setPw}
            onConfirm={setConfirm}
            onSubmit={() => {
              if (!useVessa.getState().resetVerified) return setStep("phone");
              useVessa.getState().resetPassword(pw);
              toast.success(t("forgot.done"));
              navigate({ to: "/login", replace: true });
            }}
          />
        </>
      )}
    </AppScreen>
  );
}
