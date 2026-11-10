import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Lock } from "lucide-react";
import { AppScreen } from "@/components/vessa/AppScreen";
import { LogoMark } from "@/components/vessa/Logo";
import { PhoneField } from "@/components/vessa/PhoneField";
import { FieldError, FieldLabel, PasswordField } from "@/components/vessa/Field";
import { Button } from "@/components/ui/button";
import { useVessa } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { isValidPhone } from "@/lib/vessa-rules";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/login")({
  head: () => pageHead("Log in", "Welcome back to VessA. Log in with your mobile number."),
  component: Login,
});

function Login() {
  const t = useT();
  const navigate = useNavigate();
  const account = useVessa((s) => s.account);
  const [countryCode, setCountryCode] = useState(account?.countryCode ?? "TH");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [phoneErr, setPhoneErr] = useState<string | null>(null);
  const [pwErr, setPwErr] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const pErr = !isValidPhone(countryCode, phone) ? t("phone.invalid") : null;
    const wErr = !password ? t("common.required") : null;
    setPhoneErr(pErr);
    setPwErr(wErr);
    if (pErr || wErr) return;
    const res = useVessa.getState().login(countryCode, phone, password);
    if (res === "no-account") return setPhoneErr(t("login.noAccount"));
    if (res === "wrong-password") return setPwErr(t("login.wrongPassword"));
    navigate({ to: "/home", replace: true });
  };

  return (
    <AppScreen>
      <header className="flex items-center">
        <Link to="/welcome" aria-label="Vessa">
          <LogoMark className="h-12 w-12 drop-shadow-[0_8px_16px_oklch(0.56_0.14_38/0.3)]" />
        </Link>
      </header>

      <form noValidate onSubmit={submit} className="flex flex-1 flex-col">
        <h1 className="mt-10 animate-rise text-[2.75rem] font-normal leading-[1.02]">
          {t("login.title")}
        </h1>
        <p className="mt-3 animate-rise text-[15px] text-muted-foreground [animation-delay:80ms]">
          {t("login.subtitle")}
        </p>

        <div className="mt-10 animate-rise [animation-delay:140ms]">
          <FieldLabel htmlFor="login-phone">{t("phone.label")}</FieldLabel>
          <PhoneField
            id="login-phone"
            countryCode={countryCode}
            phone={phone}
            onCountryChange={setCountryCode}
            onPhoneChange={(v) => {
              setPhone(v);
              setPhoneErr(null);
            }}
            invalid={!!phoneErr}
            errorId="login-phone-error"
          />
          <FieldError id="login-phone-error">{phoneErr}</FieldError>
        </div>

        <div className="mt-5 animate-rise [animation-delay:180ms]">
          <FieldLabel htmlFor="login-password">{t("login.password")}</FieldLabel>
          <div className="relative">
            <Lock
              aria-hidden
              className="pointer-events-none absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            />
            <PasswordField
              id="login-password"
              autoComplete="current-password"
              className="pl-11"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPwErr(null);
              }}
              aria-invalid={!!pwErr || undefined}
              aria-describedby="login-password-error"
            />
          </div>
          <FieldError id="login-password-error">{pwErr}</FieldError>
        </div>

        <div className="mt-4 flex justify-start">
          <Link
            to="/forgot-password"
            className="text-sm font-semibold text-terracotta underline-offset-4 hover:underline"
          >
            {t("login.forgot")}
          </Link>
        </div>

        <Button type="submit" variant="hero" size="xl" className="mt-8 w-full">
          {t("common.continue")}
        </Button>

        <p className="mt-auto pt-8 text-center text-sm text-muted-foreground">
          {t("login.signUp")}{" "}
          <Link
            to="/signup/phone"
            className="font-semibold text-terracotta underline-offset-4 hover:underline"
          >
            {t("login.create")}
          </Link>
        </p>
      </form>
    </AppScreen>
  );
}
