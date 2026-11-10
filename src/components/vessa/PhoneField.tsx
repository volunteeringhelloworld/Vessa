import { ChevronDown, Smartphone } from "lucide-react";
import { COUNTRIES, findCountry } from "@/lib/vessa-rules";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type Props = {
  id: string;
  countryCode: string;
  phone: string;
  onCountryChange: (c: string) => void;
  onPhoneChange: (p: string) => void;
  invalid?: boolean;
  errorId?: string;
  autoFocus?: boolean;
};

export function PhoneField({
  id,
  countryCode,
  phone,
  onCountryChange,
  onPhoneChange,
  invalid,
  errorId,
  autoFocus,
}: Props) {
  const t = useT();
  const c = findCountry(countryCode);
  return (
    <div
      className={cn(
        "glass flex h-14 w-full items-center rounded-2xl focus-within:ring-2 focus-within:ring-coral",
        invalid && "ring-2 ring-destructive/60",
      )}
    >
      <div className="relative flex h-full shrink-0 items-center border-r border-glass-border pl-3 pr-2">
        <span
          aria-hidden
          className="pointer-events-none flex items-center gap-1.5 text-base font-semibold"
        >
          <Smartphone className="h-4 w-4 text-muted-foreground" />
          {c.flag} {c.dial}
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </span>
        <select
          aria-label={t("phone.country")}
          value={countryCode}
          onChange={(e) => onCountryChange(e.target.value)}
          className="absolute inset-0 cursor-pointer opacity-0"
        >
          {COUNTRIES.map((co) => (
            <option key={co.code} value={co.code}>
              {co.flag} {co.name} ({co.dial})
            </option>
          ))}
        </select>
      </div>
      <input
        id={id}
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        autoFocus={autoFocus}
        placeholder={t("phone.placeholder")}
        value={phone}
        onChange={(e) => onPhoneChange(e.target.value.replace(/[^\d\s-]/g, "").slice(0, 14))}
        aria-invalid={invalid || undefined}
        aria-describedby={errorId}
        className="h-full min-w-0 flex-1 bg-transparent px-3 text-base tracking-wide outline-none placeholder:text-muted-foreground/70"
      />
    </div>
  );
}
