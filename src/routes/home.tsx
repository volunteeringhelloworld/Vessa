import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import {
  Bell,
  CalendarClock,
  CalendarDays,
  ChevronRight,
  ClipboardPlus,
  Hospital,
  Link2,
  Pill,
  Siren,
  Sparkles,
  Stethoscope,
  Syringe,
  UserRound,
  Video,
} from "lucide-react";
import { AppScreen } from "@/components/vessa/AppScreen";
import { LogoMark } from "@/components/vessa/Logo";
import { BottomNav } from "@/components/vessa/BottomNav";
import { BottomSheet } from "@/components/vessa/BottomSheet";
import { EmergencySheet, HospitalSheet, ProviderSheet } from "@/components/vessa/QuickSheets";
import { Button } from "@/components/ui/button";
import { useRequireSession } from "@/hooks/use-guards";
import { useVessa } from "@/lib/store";
import { useLocale, useT, type TKey } from "@/lib/i18n";
import { dateKey, profileCompletion, shouldShowCompletionWidget } from "@/lib/vessa-rules";
import { providerName } from "@/lib/providers";
import { pageHead } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/home")({
  head: () =>
    pageHead("Home", "Your VessA dashboard: today's activities, quick access and health profile."),
  component: Home,
});

type SheetKind = "hospital" | "provider" | "emergency" | "notifications" | null;

function Home() {
  const t = useT();
  const locale = useLocale();
  const ready = useRequireSession();
  const account = useVessa((s) => s.account);
  const health = useVessa((s) => s.health);
  const meds = useVessa((s) => s.meds);
  const appointments = useVessa((s) => s.appointments);
  const [sheet, setSheet] = useState<SheetKind>(null);

  const today = new Date();
  const todayKey = dateKey(today);
  const pct = profileCompletion(health);

  const pendingDoses = useMemo(
    () =>
      meds.flatMap((m) =>
        m.times
          .filter((slot) => !(m.taken[todayKey] ?? []).includes(slot))
          .map((slot) => ({ m, slot })),
      ),
    [meds, todayKey],
  );
  const upcoming = useMemo(
    () =>
      appointments
        .filter((a) => a.status === "booked" && a.date >= todayKey)
        .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)),
    [appointments, todayKey],
  );
  const todaysAppts = upcoming.filter((a) => a.date === todayKey);
  const activityCount = pendingDoses.length + todaysAppts.length;
  const notifCount = pendingDoses.length + upcoming.slice(0, 3).length + (pct < 100 ? 1 : 0);

  if (!ready || !account) return <AppScreen withNav>{null}</AppScreen>;

  const day = new Intl.DateTimeFormat(locale, { day: "2-digit" }).format(today);
  const month = new Intl.DateTimeFormat(locale, { month: "short" }).format(today);
  const weekday = new Intl.DateTimeFormat(locale, { weekday: "long" }).format(today);

  const quick: {
    key: TKey;
    icon: typeof Pill;
    action: () => void;
    to?: "/medication" | "/health-profile" | "/appointments";
  }[] = [
    { key: "qa.meds", icon: Pill, action: () => {}, to: "/medication" },
    { key: "qa.hospital", icon: Hospital, action: () => setSheet("hospital") },
    { key: "qa.provider", icon: Link2, action: () => setSheet("provider") },
    { key: "qa.emergency", icon: Siren, action: () => setSheet("emergency") },
    { key: "qa.record", icon: ClipboardPlus, action: () => {}, to: "/health-profile" },
    { key: "qa.history", icon: CalendarClock, action: () => {}, to: "/appointments" },
  ];

  return (
    <AppScreen withNav>
      {/* Header */}
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <LogoMark className="h-10 w-10" />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSheet("notifications")}
            aria-label={t("home.notifications")}
            className="glass relative grid h-11 w-11 place-items-center rounded-full"
          >
            <Bell className="h-5 w-5" />
            {notifCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-terracotta px-1 text-[10px] font-bold text-primary-foreground">
                {notifCount}
              </span>
            )}
          </button>
          <Link
            to="/account"
            aria-label={t("home.profile")}
            className="glass grid h-11 w-11 place-items-center rounded-full"
          >
            <UserRound className="h-5 w-5" />
          </Link>
        </div>
      </header>

      <section className="mt-6 animate-rise">
        <h1 className="truncate text-[2.25rem] font-normal leading-tight">
          {t("home.hello", { name: account.name })}
        </h1>
        <p className="font-display text-lg italic text-terracotta">{t("home.tagline")}</p>
      </section>

      {/* Date + today's activities */}
      <section className="mt-5 flex animate-rise items-center gap-4 [animation-delay:60ms]">
        <div className="flex items-baseline gap-3">
          <span className="font-display text-5xl font-light tabular-nums">{day}</span>
          <span className="h-10 w-px self-center bg-espresso/25" />
          <span className="font-display text-3xl font-light">{month}</span>
        </div>
        <Link to="/medication" className="min-w-0 flex-1 rounded-xl px-1 py-1">
          <p className="truncate text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {weekday}
          </p>
          <p className="truncate text-sm font-semibold">
            {t("home.today")} ·{" "}
            <span className="text-terracotta">
              {activityCount > 0
                ? t("home.activities", { n: activityCount })
                : t("home.noActivities")}
            </span>
          </p>
        </Link>
        <Link
          to="/appointments"
          aria-label={t("nav.appointments")}
          className="glass grid h-11 w-11 shrink-0 place-items-center rounded-full"
        >
          <CalendarDays className="h-5 w-5" />
        </Link>
      </section>

      {/* Health profile completion — hidden automatically at 100% */}
      {shouldShowCompletionWidget(health) && (
        <section
          className="glass mt-6 animate-rise overflow-hidden rounded-3xl p-5 [animation-delay:120ms]"
          aria-label={t("home.completeTitle")}
        >
          <div className="flex items-start gap-4">
            <Ring pct={pct} />
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-normal leading-snug">{t("home.completeTitle")}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{t("home.completeBody")}</p>
            </div>
          </div>
          <Button asChild variant="hero" size="pill" className="mt-4 w-full">
            <Link to="/health-profile">
              {t("home.completeCta")} <ChevronRight />
            </Link>
          </Button>
        </section>
      )}

      {/* Quick access */}
      <section className="mt-7 animate-rise [animation-delay:180ms]">
        <h2 className="mb-3 text-xl font-normal">{t("home.quick")}</h2>
        <div className="grid grid-cols-3 gap-3">
          {quick.map((q) => {
            const Icon = q.icon;
            const inner = (
              <>
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-accent text-espresso shadow-soft">
                  <Icon className="h-[1.35rem] w-[1.35rem]" strokeWidth={1.8} />
                </span>
                <span className="text-center text-[12px] font-semibold leading-tight">
                  {t(q.key)}
                </span>
              </>
            );
            const cls =
              "glass flex h-[7.25rem] flex-col items-center justify-center gap-2.5 rounded-3xl px-2 transition-transform active:scale-95";
            return q.to ? (
              <Link key={q.key} to={q.to} className={cls}>
                {inner}
              </Link>
            ) : (
              <button key={q.key} type="button" onClick={q.action} className={cls}>
                {inner}
              </button>
            );
          })}
        </div>
      </section>

      <PromoCarousel />

      <BottomNav />

      <HospitalSheet
        open={sheet === "hospital"}
        onOpenChange={(o) => setSheet(o ? "hospital" : null)}
      />
      <ProviderSheet
        open={sheet === "provider"}
        onOpenChange={(o) => setSheet(o ? "provider" : null)}
      />
      <EmergencySheet
        open={sheet === "emergency"}
        onOpenChange={(o) => setSheet(o ? "emergency" : null)}
      />
      <BottomSheet
        open={sheet === "notifications"}
        onOpenChange={(o) => setSheet(o ? "notifications" : null)}
        title={t("home.notifications")}
      >
        <ul className="space-y-3 pb-4">
          {notifCount === 0 && (
            <li className="text-sm text-muted-foreground">{t("home.noNotifications")}</li>
          )}
          {pct < 100 && (
            <NotifItem
              to="/health-profile"
              icon={Sparkles}
              text={t("home.notif.profile", { n: pct })}
              onGo={() => setSheet(null)}
            />
          )}
          {pendingDoses.map(({ m, slot }) => (
            <NotifItem
              key={m.id + slot}
              to="/medication"
              icon={Pill}
              text={t("home.notif.med", { name: m.name, slot: t(`slot.${slot}` as TKey) })}
              onGo={() => setSheet(null)}
            />
          ))}
          {upcoming.slice(0, 3).map((a) => (
            <NotifItem
              key={a.id}
              to="/appointments"
              icon={Stethoscope}
              text={t("home.notif.appt", {
                provider: providerName(a.providerId),
                when: `${new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" }).format(new Date(a.date + "T00:00"))} ${a.time}`,
              })}
              onGo={() => setSheet(null)}
            />
          ))}
        </ul>
      </BottomSheet>
    </AppScreen>
  );
}

function NotifItem({
  to,
  icon: Icon,
  text,
  onGo,
}: {
  to: "/medication" | "/appointments" | "/health-profile";
  icon: typeof Pill;
  text: string;
  onGo: () => void;
}) {
  return (
    <li>
      <Link to={to} onClick={onGo} className="glass flex items-center gap-3 rounded-2xl p-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-accent text-espresso">
          <Icon className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1 text-sm font-medium">{text}</span>
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
      </Link>
    </li>
  );
}

function Ring({ pct }: { pct: number }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  return (
    <div
      className="relative grid h-16 w-16 shrink-0 place-items-center"
      role="img"
      aria-label={`${pct}%`}
    >
      <svg viewBox="0 0 64 64" className="absolute inset-0 -rotate-90">
        <circle cx="32" cy="32" r={r} fill="none" strokeWidth="6" className="stroke-cream" />
        <circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          strokeWidth="6"
          strokeLinecap="round"
          className="stroke-terracotta transition-[stroke-dashoffset] duration-700"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct / 100)}
        />
      </svg>
      <span className="text-sm font-bold tabular-nums">{pct}%</span>
    </div>
  );
}

const PROMOS: { title: TKey; body: TKey; icon: typeof Pill; tone: string }[] = [
  { title: "promo.1.title", body: "promo.1.body", icon: Stethoscope, tone: "bg-gradient-accent" },
  { title: "promo.2.title", body: "promo.2.body", icon: Syringe, tone: "bg-butter" },
  { title: "promo.3.title", body: "promo.3.body", icon: Video, tone: "bg-blush" },
];

function PromoCarousel() {
  const t = useT();
  const [ref, embla] = useEmblaCarousel({ align: "start", loop: true });
  const [selected, setSelected] = useState(0);

  const onSelect = useCallback(() => embla && setSelected(embla.selectedScrollSnap()), [embla]);
  useEffect(() => {
    if (!embla) return;
    embla.on("select", onSelect);
    const id = setInterval(() => embla.scrollNext(), 6000);
    return () => {
      embla.off("select", onSelect);
      clearInterval(id);
    };
  }, [embla, onSelect]);

  return (
    <section
      className="mt-7 animate-rise [animation-delay:240ms]"
      aria-roledescription="carousel"
      aria-label={t("home.promoLabel")}
    >
      <div className="-mx-6 overflow-hidden px-6" ref={ref}>
        <div className="-ml-3 flex">
          {PROMOS.map((p, i) => {
            const Icon = p.icon;
            return (
              <div
                key={p.title}
                className="min-w-0 shrink-0 grow-0 basis-full pl-3"
                aria-roledescription="slide"
                aria-label={`${i + 1} / ${PROMOS.length}`}
              >
                <div
                  className={cn(
                    "relative isolate flex h-32 items-center gap-4 overflow-hidden rounded-3xl p-5 shadow-soft",
                    p.tone,
                  )}
                >
                  <div
                    aria-hidden
                    className="absolute -right-8 -top-10 -z-10 h-36 w-36 rounded-full bg-cream/40"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-lg leading-tight">{t(p.title)}</p>
                    <p className="mt-1 text-xs text-espresso/75">{t(p.body)}</p>
                    <Button asChild variant="hero" size="sm" className="mt-3 rounded-full px-4">
                      <Link to="/appointments">{t("promo.cta")}</Link>
                    </Button>
                  </div>
                  <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-cream/60 text-terracotta">
                    <Icon className="h-8 w-8" strokeWidth={1.6} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-3 flex justify-center gap-1.5">
        {PROMOS.map((p, i) => (
          <button
            key={p.title}
            type="button"
            aria-label={`${i + 1}`}
            aria-current={i === selected}
            onClick={() => embla?.scrollTo(i)}
            className="grid h-5 place-items-center px-0.5"
          >
            <span
              className={cn(
                "block h-1.5 rounded-full transition-all",
                i === selected ? "w-6 bg-coral" : "w-1.5 bg-espresso/20",
              )}
            />
          </button>
        ))}
      </div>
    </section>
  );
}
