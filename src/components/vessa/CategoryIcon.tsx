import type { ReactNode } from "react";
import { Brain, FlaskConical, HeartPulse, Plus, Sparkles, Stethoscope, Venus } from "lucide-react";
import type { CategoryId } from "@/lib/booking/data";

type IconProps = { className?: string | undefined };

function Tooth({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M7.5 3.5c-2.4 0-4 1.9-4 4.6 0 2 .8 3.4 1.4 5 .7 2 .9 4.6 1.6 6.2.4.9 1.6.9 2 0 .6-1.4.9-4.6 3.5-4.6s2.9 3.2 3.5 4.6c.4.9 1.6.9 2 0 .7-1.6.9-4.2 1.6-6.2.6-1.6 1.4-3 1.4-5 0-2.7-1.6-4.6-4-4.6-1.8 0-2.6 1-4.5 1s-2.7-1-4.5-1Z" />
    </svg>
  );
}

const ICONS: Record<CategoryId, (p: IconProps) => ReactNode> = {
  general: (p) => <Stethoscope className={p.className} />,
  dental: (p) => <Tooth className={p.className} />,
  skin: (p) => <Sparkles className={p.className} />,
  women: (p) => <Venus className={p.className} />,
  mental: (p) => <Brain className={p.className} />,
  specialist: (p) => <HeartPulse className={p.className} />,
  lab: (p) => <FlaskConical className={p.className} />,
  other: (p) => <Plus className={p.className} />,
};

export function CategoryIcon({ id, className }: { id: CategoryId; className?: string }) {
  return <>{ICONS[id]({ className })}</>;
}
