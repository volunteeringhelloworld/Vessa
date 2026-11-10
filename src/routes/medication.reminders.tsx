import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Bell, BellRing, Music, Repeat, Timer } from "lucide-react";
import { useEffect, useState } from "react";
import { Glass, Screen, StepHeader, Title, Toggle, VButton } from "@/components/vessa/ui";
import { useMed } from "@/lib/med-store";
import type { ReminderPrefs } from "@/lib/med-logic";

export const Route = createFileRoute("/medication/reminders")({
  head: () => ({
    meta: [
      { title: "Customize Your Reminder – VessA" },
      { name: "description", content: "Choose how and when you want VessA to remind you." },
      { property: "og:title", content: "Customize Your Reminder – VessA" },
      { property: "og:description", content: "Choose how and when you want VessA to remind you." },
    ],
  }),
  component: Reminders,
});

const OPTIONS: { k: keyof ReminderPrefs; label: string; icon: typeof Bell }[] = [
  { k: "atTime", label: "Remind me at medication time", icon: Bell },
  { k: "before10", label: "Remind me 10 minutes before", icon: Timer },
  { k: "repeat", label: "Repeat reminder if I forget", icon: Repeat },
  { k: "sound", label: "Enable notification sound", icon: Music },
];

function Reminders() {
  const navigate = useNavigate();
  const { draft, updateDraft } = useMed();
  const r = draft.reminders;
  const [perm, setPerm] = useState<NotificationPermission | "unsupported">("default");
  useEffect(() => setPerm("Notification" in window ? Notification.permission : "unsupported"), []);

  const set = (k: keyof ReminderPrefs, v: boolean) => updateDraft({ reminders: { ...r, [k]: v } });
  const anyAlert = r.atTime || r.before10 || r.repeat;

  const ask = async () => {
    if ("Notification" in window) setPerm(await Notification.requestPermission());
  };

  return (
    <Screen>
      <StepHeader step={3} back="/medication/schedule" />
      <Title title="Let’s make reminders work for you." sub="Choose how and when you want VessA to remind you." />

      <Glass className="divide-y divide-border p-0">
        {OPTIONS.map(({ k, label, icon: Icon }) => (
          <div key={k} className="flex items-center gap-3 px-4 py-4">
            <span className="grid size-10 place-items-center rounded-2xl bg-peach text-primary">
              <Icon className="size-5" />
            </span>
            <span className="flex-1 text-[15px] font-medium">{label}</span>
            <Toggle checked={r[k]} onChange={(v) => set(k, v)} label={label} />
          </div>
        ))}
      </Glass>

      <p className="mt-3 text-sm text-muted-foreground">
        {anyAlert ? `On: ${OPTIONS.filter((o) => r[o.k]).map((o) => o.label.replace("Remind me ", "").replace("Enable ", "")).join(" · ")}` : "All reminders are off — you can still track doses in VessA."}
      </p>

      {anyAlert && perm !== "granted" && perm !== "unsupported" && (
        <Glass className="mt-4 flex gap-3">
          <BellRing className="size-6 shrink-0 text-coral" />
          <div className="flex-1">
            <p className="text-sm font-semibold">Allow notifications</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {perm === "denied"
                ? "Notifications are blocked in your browser settings. VessA will still show reminders inside the app."
                : "VessA needs notification permission to alert you when it’s time for a dose, even if you’re on another screen."}
            </p>
            {perm === "default" && (
              <VButton variant="smallPrimary" className="mt-3" onClick={ask}>
                Allow Notifications
              </VButton>
            )}
          </div>
        </Glass>
      )}
      {perm === "granted" && anyAlert && <p className="mt-3 text-sm font-semibold text-success">✓ Notifications allowed</p>}

      <div className="mt-auto pt-6">
        <VButton onClick={() => navigate({ to: "/medication/calendar" })}>Continue</VButton>
      </div>
    </Screen>
  );
}
