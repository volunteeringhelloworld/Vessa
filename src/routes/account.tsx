import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { LogOut, Heart, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LanguageSwitch } from "@/components/vessa/LanguageSwitch";
import { Screen } from "@/components/vessa/Screen";
import { TopBar } from "@/components/vessa/TopBar";
import { VessaLogo } from "@/components/vessa/Logo";
import { useVessa } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/account")({
  head: () => pageHead("Account Settings", "Manage your VessA account and language."),
  component: AccountPage,
});

function AccountPage() {
  const t = useT();
  const navigate = useNavigate();
  const account = useVessa((s) => s.account);
  const logout = useVessa((s) => s.logout);

  const phone =
    account?.phone && account?.countryCode
      ? `+${account.countryCode === "TH" ? "66" : account.countryCode} ${account.phone}`
      : account?.phone ?? "—";

  const memberSince = account?.createdAt
    ? new Date(account.createdAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <Screen nav>
      <TopBar center={<VessaLogo />} />

      <h1 className="mt-4 text-2xl font-semibold tracking-tight text-ink">
        {t("account.title")}
      </h1>

      {/* Profile summary */}
      <div className="glass mt-5 space-y-3 rounded-[24px] p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {account?.name || "Guest"}
          </p>
          <p className="mt-1 text-sm text-ink">
            {t("account.phone")}: <span className="font-medium">{phone}</span>
          </p>
          {memberSince && (
            <p className="mt-1 text-xs text-muted-foreground">
              {t("account.member", { date: memberSince })}
            </p>
          )}
        </div>
      </div>

      {/* Language */}
      <div className="glass mt-4 flex items-center justify-between rounded-[24px] px-5 py-4">
        <span className="text-sm font-semibold text-ink">{t("account.language")}</span>
        <LanguageSwitch />
      </div>

      {/* Quick links */}
      <div className="mt-4 space-y-2">
        <Link
          to="/profile"
          className="glass flex items-center gap-3 rounded-[20px] px-5 py-4 transition active:scale-[0.99]"
        >
          <Heart className="size-5 text-coral" />
          <span className="flex-1 text-sm font-semibold text-ink">Health Profile</span>
        </Link>
        <Link
          to="/records"
          className="glass flex items-center gap-3 rounded-[20px] px-5 py-4 transition active:scale-[0.99]"
        >
          <FileText className="size-5 text-honey" />
          <span className="flex-1 text-sm font-semibold text-ink">Medical Records</span>
        </Link>
      </div>

      {/* Logout */}
      <div className="mt-8">
        <Button
          variant="outline"
          className="w-full gap-2 rounded-full"
          onClick={() => {
            logout();
            navigate({ to: "/welcome" });
          }}
        >
          <LogOut className="size-4" />
          {t("account.logout")}
        </Button>
      </div>
    </Screen>
  );
}
