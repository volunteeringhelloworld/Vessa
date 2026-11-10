import type { ReactNode } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

/** Compact glass dropdown used for filters and sorting. */
export function PillSelect<T extends string>({
  value,
  onChange,
  options,
  label,
  icon,
  className,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  label: string;
  icon?: ReactNode;
  className?: string;
}) {
  const active = value !== options[0]?.value;
  return (
    <Select value={value} onValueChange={(v) => onChange(v as T)}>
      <SelectTrigger
        aria-label={label}
        className={cn(
          "h-9 w-auto shrink-0 gap-1.5 rounded-full border-0 px-3.5 text-[13px] font-bold text-cocoa shadow-none focus:ring-2 focus:ring-ring",
          active ? "bg-cta" : "glass",
          className,
        )}
      >
        {icon}
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="glass-strong rounded-2xl">
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value} className="rounded-xl py-2 font-semibold">
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
