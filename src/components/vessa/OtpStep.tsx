import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FieldError } from "./Field";
import { useVessa } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { OTP_LENGTH, verifyOtp, type OtpPurpose } from "@/lib/vessa-rules";
import { cn } from "@/lib/utils";

type Props = {
  purpose: OtpPurpose;
  countryCode: string;
  phone: string;
  phoneDisplay: string;
  onVerified: () => void;
  onChangeNumber: () => void;
};

export function sendDemoOtp(
  purpose: OtpPurpose,
  countryCode: string,
  phone: string,
  message: (code: string) => string,
) {
  const ticket = useVessa.getState().issueOtp(purpose, countryCode, phone);
  toast(message(ticket.code), { duration: 8000 });
  return ticket;
}

export function OtpStep({
  purpose,
  countryCode,
  phone,
  phoneDisplay,
  onVerified,
  onChangeNumber,
}: Props) {
  const t = useT();
  const ticket = useVessa((s) => s.otp);
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [error, setError] = useState<string | null>(null);
  const [shakeKey, setShakeKey] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  // Make sure a valid code exists for this number.
  useEffect(() => {
    const s = useVessa.getState();
    if (!s.otp || s.otp.purpose !== purpose) {
      sendDemoOtp(purpose, countryCode, phone, (code) => t("otp.demo", { code }));
    }
    refs.current[0]?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, []);

  const remaining = ticket ? Math.max(0, Math.ceil((ticket.expiresAt - now) / 1000)) : 0;
  const expired = remaining === 0;

  const submit = (code: string) => {
    const result = verifyOtp(useVessa.getState().otp, code, Date.now());
    if (result === "ok") {
      setError(null);
      onVerified();
      return;
    }
    setError(result === "wrong" ? t("otp.wrong") : t("otp.expiredErr"));
    setShakeKey((k) => k + 1);
    if (result === "wrong") {
      setDigits(Array(OTP_LENGTH).fill(""));
      refs.current[0]?.focus();
    }
  };

  const setAt = (i: number, v: string) => {
    const next = [...digits];
    next[i] = v;
    setDigits(next);
    setError(null);
    return next;
  };

  const onChange = (i: number, raw: string) => {
    const only = raw.replace(/\D/g, "");
    if (only.length > 1) {
      // paste / autofill
      const next = [...digits];
      only
        .slice(0, OTP_LENGTH - i)
        .split("")
        .forEach((d, k) => (next[i + k] = d));
      setDigits(next);
      const last = Math.min(i + only.length, OTP_LENGTH) - 1;
      refs.current[Math.min(last + 1, OTP_LENGTH - 1)]?.focus();
      if (next.every(Boolean)) submit(next.join(""));
      return;
    }
    const next = setAt(i, only);
    if (only && i < OTP_LENGTH - 1) refs.current[i + 1]?.focus();
    if (only && next.every(Boolean)) submit(next.join(""));
  };

  const onKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      e.preventDefault();
      setAt(i - 1, "");
      refs.current[i - 1]?.focus();
    } else if (e.key === "ArrowLeft" && i > 0) refs.current[i - 1]?.focus();
    else if (e.key === "ArrowRight" && i < OTP_LENGTH - 1) refs.current[i + 1]?.focus();
  };

  const resend = () => {
    sendDemoOtp(purpose, countryCode, phone, (code) => t("otp.demo", { code }));
    setDigits(Array(OTP_LENGTH).fill(""));
    setError(null);
    setNow(Date.now());
    refs.current[0]?.focus();
  };

  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");

  return (
    <div className="flex flex-1 flex-col">
      <h1 className="mt-8 animate-rise text-[2.5rem] leading-[1.05]">{t("otp.title")}</h1>
      <p className="mt-3 text-sm text-muted-foreground">{t("otp.sentTo")}</p>
      <p className="mt-1 flex flex-wrap items-center gap-x-3 text-base font-semibold">
        {phoneDisplay}
        <button
          type="button"
          onClick={onChangeNumber}
          className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
        >
          {t("otp.changeNumber")}
        </button>
      </p>

      <form
        className="mt-10"
        onSubmit={(e) => {
          e.preventDefault();
          if (digits.every(Boolean)) submit(digits.join(""));
        }}
      >
        <div
          key={shakeKey}
          className={cn("grid grid-cols-4 gap-3", shakeKey > 0 && "animate-shake")}
        >
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => {
                refs.current[i] = el;
              }}
              value={d}
              onChange={(e) => onChange(i, e.target.value)}
              onKeyDown={(e) => onKeyDown(i, e)}
              onFocus={(e) => e.target.select()}
              inputMode="numeric"
              autoComplete={i === 0 ? "one-time-code" : "off"}
              maxLength={OTP_LENGTH}
              aria-label={t("otp.digit", { n: i + 1 })}
              aria-invalid={!!error || undefined}
              className={cn(
                "glass h-16 w-full rounded-2xl text-center font-display text-3xl outline-none transition-all focus-visible:ring-2 focus-visible:ring-coral",
                d && "glass-strong",
                error && "ring-2 ring-destructive/60",
              )}
            />
          ))}
        </div>
        <FieldError>{error}</FieldError>

        <div className="mt-6 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {t("otp.ref")}{" "}
            <span className="font-semibold tracking-widest text-foreground">
              {ticket?.ref ?? "----"}
            </span>
          </span>
        </div>
        <div className="mt-2 text-sm" aria-live="polite">
          {expired ? (
            <span className="flex items-center gap-3">
              <span className="text-muted-foreground">{t("otp.expired")}</span>
              <button
                type="button"
                onClick={resend}
                className="font-semibold text-primary underline-offset-4 hover:underline"
              >
                {t("otp.resend")}
              </button>
            </span>
          ) : (
            <span className="text-muted-foreground">
              {t("otp.expiresIn")}{" "}
              <span className="font-semibold tabular-nums text-terracotta">
                {mm}:{ss}
              </span>
            </span>
          )}
        </div>

        <div className="mt-auto" />
        <Button
          type="submit"
          variant="hero"
          size="xl"
          className="mt-10 w-full"
          disabled={!digits.every(Boolean)}
        >
          {t("otp.verify")} <ArrowRight />
        </Button>
      </form>
    </div>
  );
}
