import { Check, Plus, X } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  kind?: "toggle" | "add" | "remove";
}

export function ChoiceChip({ selected, kind = "toggle", className, children, ...rest }: Props) {
  return (
    <button
      type="button"
      aria-pressed={kind === "toggle" ? !!selected : undefined}
      className={cn(
        "inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm font-medium transition-all active:scale-[0.97]",
        selected ? "bg-gradient-primary text-ink shadow-soft" : "glass text-ink hover:bg-glass-strong",
        kind === "add" && "border-dashed",
        className,
      )}
      {...rest}
    >
      {kind === "toggle" && selected && <Check className="h-4 w-4" strokeWidth={2.5} />}
      {kind === "add" && <Plus className="h-4 w-4" strokeWidth={2.5} />}
      <span>{children}</span>
      {kind === "remove" && <X className="h-3.5 w-3.5 opacity-70" strokeWidth={2.5} />}
    </button>
  );
}
