import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { ArrowRight, Cake } from "lucide-react";
import { AppScreen } from "@/components/vessa/AppScreen";
import { FlowHeader } from "@/components/vessa/FlowHeader";
import { FieldError } from "@/components/vessa/Field";
import { WheelColumn, WheelHighlight } from "@/components/vessa/WheelPicker";
import { Button } from "@/components/ui/button";
import { useRequireDraft } from "@/hooks/use-guards";
import { useVessa } from "@/lib/store";
import { monthNames, useLocale, useT } from "@/lib/i18n";
import { daysInMonth, isFutureDate } from "@/lib/vessa-rules";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/signup/dob")({
  head: () => pageHead("Date of birth", "Choose your date of birth with a simple wheel picker."),
  component: SignupDob,
});

function SignupDob() {
  const t = useT();
  const locale = useLocale();
  const lang = useVessa((s) => s.lang);
  const navigate = useNavigate();
  const draft = useVessa((s) => s.draft);
  const updateDraft = useVessa((s) => s.updateDraft);
  useRequireDraft((s) => s.draft.name.trim().length > 0, "/signup/profile");

  const { day, month, year } = draft.dob;
  const thisYear = new Date().getFullYear();

  const years = useMemo(
    () =>
      Array.from({ length: 111 }, (_, i) => thisYear - 110 + i).map((y) => ({
        value: y,
        label: String(y),
      })),
    [thisYear],
  );
  const months = useMemo(
    () => monthNames(lang, "short").map((label, i) => ({ value: i + 1, label })),
    [lang],
  );
  const maxDay = daysInMonth(month, year);
  const days = useMemo(
    () =>
      Array.from({ length: maxDay }, (_, i) => ({
        value: i + 1,
        label: String(i + 1).padStart(2, "0"),
      })),
    [maxDay],
  );

  const setDob = (p: Partial<typeof draft.dob>) => {
    const next = { ...draft.dob, ...p };
    next.day = Math.min(next.day, daysInMonth(next.month, next.year));
    updateDraft({ dob: next });
  };

  const future = isFutureDate(day, month, year, new Date());
  const full = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, Math.min(day, maxDay)));

  return (
    <AppScreen>
      <FlowHeader label={t("profile.section")} />
      <h1 className="mt-8 animate-rise text-[2.75rem] font-normal leading-[1.02] text-terracotta">
        {t("dob.greeting", { name: draft.name || "…" })}
      </h1>
      <p className="mt-2 animate-rise font-display text-xl [animation-delay:80ms]">
        {t("dob.question")}
      </p>

      <div className="mt-8 animate-rise [animation-delay:140ms]">
        <div className="mb-2 grid grid-cols-[1fr_1.4fr_1.2fr] gap-2 text-center text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          <span>{t("dob.day")}</span>
          <span>{t("dob.month")}</span>
          <span>{t("dob.year")}</span>
        </div>
        <div className="relative grid grid-cols-[1fr_1.4fr_1.2fr] gap-2">
          <WheelHighlight />
          <WheelColumn
            label={t("dob.day")}
            items={days}
            value={day}
            onChange={(v) => setDob({ day: v })}
          />
          <WheelColumn
            label={t("dob.month")}
            items={months}
            value={month}
            onChange={(v) => setDob({ month: v })}
          />
          <WheelColumn
            label={t("dob.year")}
            items={years}
            value={year}
            onChange={(v) => setDob({ year: v })}
          />
        </div>
      </div>

      <div className="glass mt-8 flex items-center gap-4 rounded-2xl p-4" aria-live="polite">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-accent text-espresso">
          <Cake className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {t("dob.selected")}
          </p>
          <p className="truncate font-display text-xl">{full}</p>
        </div>
      </div>
      <FieldError>{future ? t("dob.future") : null}</FieldError>

      <Button
        variant="hero"
        size="xl"
        className="mt-auto w-full"
        disabled={future}
        onClick={() => navigate({ to: "/signup/gender" })}
      >
        {t("common.next")} <ArrowRight />
      </Button>
    </AppScreen>
  );
}
