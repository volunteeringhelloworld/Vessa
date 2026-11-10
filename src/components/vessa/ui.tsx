import { Link, useRouter } from "@tanstack/react-router";
import { cva, type VariantProps } from "class-variance-authority";
import { ArrowLeft, Bell, CalendarDays, FileHeart, Heart, Home, Sparkles, UserRound } from "lucide-react";
import { forwardRef, useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import logo from "@/assets/vessa-logo.png";
import pet from "@/assets/streak-pet.png";
import type { DoseStatus } from "@/lib/med-logic";

export const MED_BG: Record<string, string> = {
  "med-red": "bg-med-red",
  "med-blue": "bg-med-blue",
  "med-amber": "bg-med-amber",
  "med-green": "bg-med-green",
  "med-violet": "bg-med-violet",
};

export function Screen({ children, className, nav }: { children: ReactNode; className?: string; nav?: boolean }) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col">
      <main className={cn("flex flex-1 flex-col px-5 pt-safe", nav ? "pb-28" : "pb-safe", className)}>
        {children}
      </main>
      {nav && <BottomNav />}
    </div>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <img src={logo} alt="VessA" className="h-8 w-auto" />
      <span className="font-display text-xl font-semibold text-ink">VessA</span>
    </div>
  );
}

export function BackButton({ to }: { to?: string }) {
  const router = useRouter();
  const cls = "glass grid size-10 place-items-center rounded-full text-ink";
  if (to)
    return (
      <Link to={to} aria-label="Back" className={cls}>
        <ArrowLeft className="size-5" />
      </Link>
    );
  return (
    <button aria-label="Back" className={cls} onClick={() => router.history.back()}>
      <ArrowLeft className="size-5" />
    </button>
  );
}

export function StepHeader({ step, back }: { step: number; back: string }) {
  return (
    <header className="flex items-center gap-4 py-2">
      <BackButton to={back} />
      <div className="flex-1">
        <div className="mb-1.5 flex justify-between text-xs font-semibold text-muted-foreground">
          <span>Step {step} of 7</span>
          <span>{Math.round((step / 7) * 100)}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={step} aria-valuemax={7}>
          <div className="h-full rounded-full bg-gradient-primary transition-all duration-500" style={{ width: `${(step / 7) * 100}%` }} />
        </div>
      </div>
    </header>
  );
}

export function Title({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mt-6 mb-6">
      <h1 className="text-[28px] leading-tight font-semibold text-ink">{title}</h1>
      {sub && <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{sub}</p>}
    </div>
  );
}

const btn = cva(
  "inline-flex w-full items-center justify-center gap-2 rounded-full font-semibold transition active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary: "bg-gradient-primary text-primary-foreground shadow-glow h-14 text-base",
        glass: "glass text-ink h-14 text-base",
        ghost: "text-muted-foreground h-12 text-[15px] hover:text-ink",
        small: "glass h-9 w-auto px-4 text-sm text-ink",
        smallPrimary: "bg-gradient-primary text-primary-foreground h-9 w-auto px-4 text-sm shadow-glow",
      },
    },
    defaultVariants: { variant: "primary" },
  },
);

export const VButton = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof btn>
>(({ className, variant, ...p }, ref) => <button ref={ref} className={cn(btn({ variant }), className)} {...p} />);
VButton.displayName = "VButton";

export function Glass({ children, className, ...p }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("glass rounded-3xl p-4", className)} {...p}>
      {children}
    </div>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn("relative h-7 w-12 shrink-0 rounded-full transition", checked ? "bg-gradient-primary" : "bg-muted")}
    >
      <span className={cn("absolute top-1 size-5 rounded-full bg-card shadow transition-all glass-strong", checked ? "left-6" : "left-1")} />
    </button>
  );
}

export function Capsule({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 28" className={className} aria-hidden>
      <rect x="1" y="1" width="62" height="26" rx="13" fill="var(--cream)" stroke="var(--ink)" strokeWidth="2" />
      <path d="M14 1h18v26H14A13 13 0 0 1 14 1Z" fill="var(--rose)" stroke="var(--ink)" strokeWidth="2" />
      <rect x="8" y="6" width="14" height="4" rx="2" fill="var(--cream)" opacity=".7" />
    </svg>
  );
}

/** The VessA streak pet (no personal name). cheer key change triggers a celebration. */
export function StreakPet({ size = 220, cheer = 0, capsule = true }: { size?: number; cheer?: number; capsule?: boolean }) {
  const [burst, setBurst] = useState(0);
  useEffect(() => {
    if (cheer > 0) setBurst((b) => b + 1);
  }, [cheer]);
  return (
    <div className="relative mx-auto" style={{ width: size, height: size * 0.95 }}>
      <Sparkles className="animate-twinkle absolute top-2 left-0 size-5 text-coral" />
      <Heart className="animate-twinkle absolute top-6 right-2 size-5 fill-rose text-rose [animation-delay:0.8s]" />
      <Heart className="animate-twinkle absolute bottom-10 -left-2 size-4 fill-blush text-rose [animation-delay:1.4s]" />
      <Sparkles className="animate-twinkle absolute right-0 bottom-16 size-4 text-med-amber [animation-delay:0.4s]" />
      <div className="animate-float absolute inset-x-4 top-4 bottom-0">
        <img key={burst} src={pet} alt="VessA streak pet" className={cn("size-full object-contain drop-shadow-xl", burst > 0 && "animate-squish")} />
        {capsule && <Capsule className="absolute right-1 bottom-6 w-[30%] rotate-[-30deg] drop-shadow-md" />}
      </div>
      {burst > 0 && (
        <div key={`b${burst}`} className="pointer-events-none absolute inset-0">
          {[15, 35, 55, 75].map((l, i) => (
            <Heart key={l} className="animate-rise absolute bottom-1/3 size-5 fill-rose text-rose" style={{ left: `${l}%`, animationDelay: `${i * 0.12}s` }} />
          ))}
        </div>
      )}
      <div className="absolute inset-x-10 -bottom-1 h-4 rounded-full bg-apricot/60 blur-md" />
    </div>
  );
}

export function MedIcon({ photo, color, size = "size-12" }: { photo?: string | undefined; color: string; size?: string }) {
  if (photo) return <img src={photo} alt="" className={cn(size, "shrink-0 rounded-2xl object-cover")} />;
  return (
    <div className={cn(size, "relative grid shrink-0 place-items-center rounded-2xl bg-cream")}>
      <Capsule className="w-3/4 -rotate-30" />
      <span className={cn("absolute top-1 right-1 size-2.5 rounded-full", MED_BG[color])} />
    </div>
  );
}

const STATUS: Record<DoseStatus, { label: string; cls: string }> = {
  taken: { label: "Taken", cls: "bg-success-soft text-success" },
  upcoming: { label: "Upcoming", cls: "bg-info-soft text-info" },
  due: { label: "Due Now", cls: "bg-butter text-ink" },
  missed: { label: "Missed", cls: "bg-danger-soft text-danger" },
  skipped: { label: "Skipped", cls: "bg-muted text-muted-foreground" },
};
export function StatusPill({ status }: { status: DoseStatus }) {
  const s = STATUS[status];
  return <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", s.cls)}>{s.label}</span>;
}

export function GoogleCalendarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-label="Google Calendar">
      <rect x="6" y="6" width="36" height="36" rx="4" fill="#fff" />
      <path d="M34 6h4a4 4 0 0 1 4 4v4h-8z" fill="#1967D2" />
      <path d="M6 34h8v8h-4a4 4 0 0 1-4-4z" fill="#188038" />
      <path d="M34 34h8l-8 8z" fill="#EA4335" />
      <path d="M14 6h20v8H14zM6 14h8v20H6z" fill="#4285F4" />
      <path d="M14 34h20v8H14z" fill="#34A853" />
      <path d="M34 14h8v20h-8z" fill="#FBBC04" />
      <path d="M6 10a4 4 0 0 1 4-4h4v8H6z" fill="#1967D2" />
      <text x="24" y="30" textAnchor="middle" fontSize="13" fontWeight="700" fill="#1967D2" fontFamily="Arial">31</text>
    </svg>
  );
}

export function AppHeader({ title }: { title?: string }) {
  return (
    <header className="flex items-center justify-between py-2">
      <Logo />
      {title && <span className="text-sm font-semibold text-muted-foreground">{title}</span>}
      <div className="flex gap-2">
        <Link to="/medication/dashboard" hash="upcoming" aria-label="Notifications" className="glass grid size-10 place-items-center rounded-full">
          <Bell className="size-5" />
        </Link>
        <button aria-label="Profile" onClick={() => toast("Profile lives in the full VessA app.")} className="glass grid size-10 place-items-center rounded-full">
          <UserRound className="size-5" />
        </button>
      </div>
    </header>
  );
}

export function BottomNav() {
  const soon = (n: string) => () => toast(`${n} is part of the full VessA app.`);
  const item = "flex flex-1 flex-col items-center gap-1 py-2 text-[11px] font-semibold";
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[430px] px-4 pb-safe">
      <div className="glass glass-strong flex rounded-3xl px-2">
        <Link to="/medication/tracker" className={item} activeProps={{ className: "text-primary" }} inactiveProps={{ className: "text-muted-foreground" }}>
          <Home className="size-5" />
          Home
        </Link>
        <button className={cn(item, "text-muted-foreground")} onClick={soon("Appointments")}>
          <CalendarDays className="size-5" />
          Appointments
        </button>
        <button className={cn(item, "text-muted-foreground")} onClick={soon("Health Records")}>
          <FileHeart className="size-5" />
          Health Records
        </button>
        <button className={cn(item, "text-muted-foreground")} onClick={soon("Profile")}>
          <UserRound className="size-5" />
          Profile
        </button>
      </div>
    </nav>
  );
}

export function Field({ label, children, error, hint }: { label: string; children: ReactNode; error?: string | undefined; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-ink">{label}</span>
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-muted-foreground">{hint}</span>}
      {error && <span className="mt-1 block text-xs font-medium text-danger">{error}</span>}
    </label>
  );
}

export const inputCls =
  "glass h-12 w-full rounded-2xl px-4 text-[15px] text-ink outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring";

/** Re-renders every `ms` so countdowns stay live. */
export function useNow(ms = 30000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), ms);
    return () => clearInterval(t);
  }, [ms]);
  return now;
}
