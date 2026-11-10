import { Link } from "@tanstack/react-router";
import { CalendarDays, Heart, House, UserRound } from "lucide-react";
import { useT, type TKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function BunnyIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M12.2 13.2C10.6 9.4 10 4.6 12 4.1c2-.5 3.2 4 3.3 8.2" />
      <path d="M19.8 13.2c1.6-3.8 2.2-8.6.2-9.1-2-.5-3.2 4-3.3 8.2" />
      <path d="M16 12.6c4.6 0 8 3 8 7s-3.4 7.2-8 7.2-8-3.2-8-7.2 3.4-7 8-7Z" />
      <circle cx="13" cy="19" r="1" fill="currentColor" stroke="none" />
      <circle cx="19" cy="19" r="1" fill="currentColor" stroke="none" />
      <path d="M15 21.6c.6.5 1.4.5 2 0" />
      <circle cx="10.8" cy="21.8" r="1.2" fill="currentColor" stroke="none" opacity={0.25} />
      <circle cx="21.2" cy="21.8" r="1.2" fill="currentColor" stroke="none" opacity={0.25} />
    </svg>
  );
}

type Tab = {
  to: "/home" | "/appointments" | "/health-profile" | "/account";
  icon: typeof House;
  label: TKey;
};

const left: Tab[] = [
  { to: "/home", icon: House, label: "nav.home" },
  { to: "/appointments", icon: CalendarDays, label: "nav.appointments" },
];
const right: Tab[] = [
  { to: "/health-profile", icon: Heart, label: "nav.health" },
  { to: "/account", icon: UserRound, label: "nav.account" },
];

function TabLink({ tab }: { tab: Tab }) {
  const t = useT();
  const Icon = tab.icon;
  return (
    <Link
      to={tab.to}
      aria-label={t(tab.label)}
      className="group grid h-14 flex-1 place-items-center rounded-2xl text-muted-foreground transition-colors data-[status=active]:text-terracotta"
    >
      <span className="flex flex-col items-center gap-1">
        <Icon className="h-6 w-6" strokeWidth={1.8} />
        <span className="h-1 w-1 rounded-full bg-transparent group-data-[status=active]:bg-terracotta" />
      </span>
    </Link>
  );
}

export function BottomNav() {
  const t = useT();
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-safe z-40 mx-auto w-full max-w-[430px] px-4"
    >
      <div className="glass glass-strong relative flex items-center rounded-[1.75rem] px-2 shadow-soft">
        {left.map((tab) => (
          <TabLink key={tab.to} tab={tab} />
        ))}
        <div className="relative flex h-14 flex-1 justify-center">
          <Link
            to="/medication/tracker"
            aria-label={t("nav.medication")}
            className={cn(
              "absolute -top-7 z-10 grid h-[4.25rem] w-[4.25rem] place-items-center rounded-[1.6rem] border-4 border-cream bg-gradient-accent text-espresso shadow-cta transition-transform active:scale-95",
              "data-[status=active]:-translate-y-0.5",
            )}
          >
            <BunnyIcon className="h-9 w-9" />
          </Link>
        </div>
        {right.map((tab) => (
          <TabLink key={tab.to} tab={tab} />
        ))}
      </div>
    </nav>
  );
}
