import { useVessa, type Lang } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function LanguageSwitch({ className }: { className?: string }) {
  const lang = useVessa((s) => s.lang);
  const setLang = useVessa((s) => s.setLang);
  const t = useT();
  const opts: { v: Lang; label: string }[] = [
    { v: "th", label: "TH" },
    { v: "en", label: "ENG" },
  ];
  return (
    <div
      role="radiogroup"
      aria-label={t("welcome.language")}
      className={cn("glass inline-flex rounded-full p-1", className)}
    >
      {opts.map((o) => (
        <button
          key={o.v}
          type="button"
          role="radio"
          aria-checked={lang === o.v}
          onClick={() => setLang(o.v)}
          className={cn(
            "h-8 min-w-12 rounded-full px-3 text-xs font-bold tracking-wider transition-all",
            lang === o.v
              ? "bg-gradient-primary text-primary-foreground shadow-cta"
              : "text-muted-foreground",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
