import { BottomSheet } from "./BottomSheet";
import { useT } from "@/lib/i18n";

export type LegalKind = "terms" | "privacy" | null;

export function LegalSheet({ kind, onClose }: { kind: LegalKind; onClose: () => void }) {
  const t = useT();
  const title = kind === "privacy" ? t("welcome.privacy") : t("welcome.terms");
  const body =
    kind === "privacy"
      ? [t("legal.privacy.body1"), t("legal.privacy.body2")]
      : [t("legal.terms.body1"), t("legal.terms.body2")];
  return (
    <BottomSheet open={kind !== null} onOpenChange={(o) => !o && onClose()} title={title}>
      <div className="space-y-4 pb-4 text-[15px] leading-relaxed text-foreground/85">
        {body.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>
    </BottomSheet>
  );
}
