import { useRouter } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { LogoMark } from "./Logo";
import { useT } from "@/lib/i18n";

/** Small logo top-left with a section label, plus an optional back control. */
export function FlowHeader({
  label,
  showLogo = true,
  back = true,
}: {
  label?: string;
  showLogo?: boolean;
  back?: boolean;
}) {
  const router = useRouter();
  const t = useT();
  return (
    <header className="flex min-h-11 items-center gap-2">
      {back && (
        <button
          type="button"
          onClick={() => router.history.back()}
          aria-label={t("common.back")}
          className="glass -ml-1 grid h-10 w-10 shrink-0 place-items-center rounded-full"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}
      {showLogo && <LogoMark className="h-8 w-8 shrink-0" />}
      {label && (
        <span className="min-w-0 truncate font-display text-sm italic text-muted-foreground">
          {label}
        </span>
      )}
    </header>
  );
}
