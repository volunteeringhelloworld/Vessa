import { useState } from "react";
import { toast } from "sonner";
import { Check, Clock3, SkipForward, Undo2 } from "lucide-react";
import { StatusPill, VButton } from "./ui";
import { doseKey, doseStatus, fmtTime, partOfDay, at, countdown, type Medication } from "@/lib/med-logic";
import { useMed } from "@/lib/med-store";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

/** One scheduled dose with its status; tap to see details and act on it. */
export function DoseRow({ med, day, time, now }: { med: Medication; day: string; time: string; now: Date }) {
  const key = doseKey(med.id, day, time);
  const { logs, snoozed, logDose, undoDose, snooze } = useMed();
  const [open, setOpen] = useState(false);
  const log = logs[key];
  const status = doseStatus(day, time, log, now, snoozed[key]);
  const future = at(day, time).getTime() - now.getTime() > 12 * 3600000;

  return (
    <div className="rounded-2xl bg-cream/60">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left" aria-expanded={open}>
        <span className={cn("grid size-6 place-items-center rounded-full", status === "taken" ? "bg-success-soft text-success" : status === "missed" ? "bg-danger-soft text-danger" : "bg-info-soft text-info")}>
          {status === "taken" ? <Check className="size-3.5" /> : <Clock3 className="size-3.5" />}
        </span>
        <span className="flex-1 text-sm">
          <span className="font-semibold">{partOfDay(time)}</span>
          <span className="text-muted-foreground"> · {fmtTime(time)}</span>
        </span>
        <StatusPill status={status} />
      </button>
      {open && (
        <div className="space-y-2 px-3 pb-3 text-xs text-muted-foreground">
          <p>
            {med.name} · {med.dosage} · {format(at(day, time), "EEE, MMM d")}
            {log && ` · recorded ${format(new Date(log.at), "h:mm a")}`}
            {!log && status === "upcoming" && ` · ${countdown(snoozed[key] ? new Date(snoozed[key]) : at(day, time), now)}`}
          </p>
          {log ? (
            <VButton variant="small" onClick={() => undoDose(key)}>
              <Undo2 className="size-4" /> Undo
            </VButton>
          ) : future ? (
            <p>You can record this dose closer to its time.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              <VButton
                variant="smallPrimary"
                onClick={() => {
                  logDose(key, "taken");
                  toast.success(`${med.name} marked as taken`);
                }}
              >
                <Check className="size-4" /> Mark as Taken
              </VButton>
              <VButton
                variant="small"
                onClick={() => {
                  snooze(key, 10);
                  toast(`Snoozed ${med.name} for 10 minutes`);
                }}
              >
                Snooze 10m
              </VButton>
              <VButton variant="small" onClick={() => logDose(key, "skipped")}>
                <SkipForward className="size-4" /> Skip
              </VButton>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
