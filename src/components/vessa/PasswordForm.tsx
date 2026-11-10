import { useState } from "react";
import { Check, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FieldError, FieldLabel, PasswordField } from "./Field";
import { useT, type TKey } from "@/lib/i18n";
import { passwordIssues } from "@/lib/vessa-rules";
import { cn } from "@/lib/utils";

type Props = {
  idPrefix: string;
  passwordLabel: string;
  confirmLabel: string;
  submitLabel: string;
  password: string;
  confirm: string;
  onPassword: (v: string) => void;
  onConfirm: (v: string) => void;
  onSubmit: () => void;
};

const RULES: { issue: "length" | "number" | "letter"; label: TKey }[] = [
  { issue: "length", label: "verify.rule.length" },
  { issue: "letter", label: "verify.rule.letter" },
  { issue: "number", label: "verify.rule.number" },
];

export function PasswordForm(p: Props) {
  const t = useT();
  const [submitted, setSubmitted] = useState(false);
  const issues = passwordIssues(p.password);
  const pwError = submitted
    ? issues.includes("required")
      ? t("common.required")
      : issues.length
        ? t("verify.weak")
        : null
    : null;
  const confirmError = submitted
    ? !p.confirm
      ? t("common.required")
      : p.confirm !== p.password
        ? t("verify.mismatch")
        : null
    : null;

  return (
    <form
      noValidate
      className="mt-8 flex flex-1 flex-col"
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(true);
        if (issues.length === 0 && p.confirm && p.confirm === p.password) p.onSubmit();
      }}
    >
      <div>
        <FieldLabel htmlFor={`${p.idPrefix}-pw`}>{p.passwordLabel}</FieldLabel>
        <PasswordField
          id={`${p.idPrefix}-pw`}
          autoComplete="new-password"
          value={p.password}
          onChange={(e) => p.onPassword(e.target.value)}
          aria-invalid={!!pwError || undefined}
          aria-describedby={`${p.idPrefix}-pw-error ${p.idPrefix}-pw-rules`}
        />
        <FieldError id={`${p.idPrefix}-pw-error`}>{pwError}</FieldError>
        <ul id={`${p.idPrefix}-pw-rules`} className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
          {RULES.map((r) => {
            const ok = p.password.length > 0 && !issues.includes(r.issue);
            return (
              <li
                key={r.issue}
                className={cn(
                  "flex items-center gap-1.5 text-xs font-medium transition-colors",
                  ok ? "text-success" : "text-muted-foreground",
                )}
              >
                {ok ? (
                  <Check className="h-3.5 w-3.5 animate-check" strokeWidth={3} />
                ) : (
                  <Circle className="h-3 w-3" />
                )}
                {t(r.label)}
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-6">
        <FieldLabel htmlFor={`${p.idPrefix}-confirm`}>{p.confirmLabel}</FieldLabel>
        <PasswordField
          id={`${p.idPrefix}-confirm`}
          autoComplete="new-password"
          value={p.confirm}
          onChange={(e) => p.onConfirm(e.target.value)}
          aria-invalid={!!confirmError || undefined}
          aria-describedby={`${p.idPrefix}-confirm-error`}
        />
        <FieldError id={`${p.idPrefix}-confirm-error`}>{confirmError}</FieldError>
      </div>

      <Button type="submit" variant="hero" size="xl" className="mt-auto w-full">
        {p.submitLabel}
      </Button>
    </form>
  );
}
