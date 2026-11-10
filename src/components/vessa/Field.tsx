import { forwardRef, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";

export const fieldClass =
  "glass h-14 w-full rounded-2xl px-4 text-base text-foreground outline-none placeholder:text-muted-foreground/70 focus-visible:ring-2 focus-visible:ring-coral aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-destructive/60";

export function FieldLabel({ htmlFor, children }: { htmlFor?: string; children: ReactNode }) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground"
    >
      {children}
    </label>
  );
}

export function FieldError({ id, children }: { id?: string; children?: ReactNode }) {
  if (!children) return null;
  return (
    <p id={id} role="alert" className="mt-2 animate-rise text-sm font-medium text-destructive">
      {children}
    </p>
  );
}

export const TextField = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input ref={ref} className={cn(fieldClass, className)} {...props} />
  ),
);
TextField.displayName = "TextField";

export const PasswordField = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    const [show, setShow] = useState(false);
    const t = useT();
    return (
      <div className="relative">
        <input
          ref={ref}
          type={show ? "text" : "password"}
          className={cn(fieldClass, "pr-14", className)}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? t("common.hidePassword") : t("common.showPassword")}
          aria-pressed={show}
          className="absolute right-2 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full text-muted-foreground hover:text-foreground"
        >
          {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
    );
  },
);
PasswordField.displayName = "PasswordField";
