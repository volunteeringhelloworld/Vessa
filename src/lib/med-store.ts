import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  dateKey,
  DEFAULT_TIMES,
  type DoseLog,
  type Frequency,
  type Medication,
  type ReminderPrefs,
} from "./med-logic";

export const MED_COLORS = ["med-red", "med-blue", "med-amber", "med-green", "med-violet"];

export interface Draft {
  editingId?: string | undefined;
  name: string;
  type: string;
  dosage: string;
  photo?: string | undefined;
  frequency: Frequency | "";
  intervalHours: number;
  weekdays: number[];
  times: string[];
  startDate: string;
  endDate: string;
  reminders: ReminderPrefs;
}

export interface CalendarState {
  connected: boolean;
  account?: string | undefined;
  calendar?: undefined | "Personal Calendar" | "Health Calendar" | "VessA Medications";
  skipped: boolean;
  lastSync?: string | undefined;
}

const emptyDraft = (): Draft => ({
  name: "",
  type: "",
  dosage: "",
  photo: undefined,
  frequency: "",
  intervalHours: 4,
  weekdays: [],
  times: [],
  startDate: dateKey(new Date()),
  endDate: "",
  reminders: { atTime: true, before10: false, repeat: false, sound: true },
});

interface State {
  draft: Draft;
  meds: Medication[];
  logs: Record<string, DoseLog>;
  snoozed: Record<string, string>;
  notified: Record<string, boolean>;
  calendar: CalendarState;
  lastSavedId?: string | undefined;
  petCheer: number;
  updateDraft: (p: Partial<Draft>) => void;
  resetDraft: () => void;
  editMed: (id: string) => void;
  saveDraft: () => string;
  discontinue: (id: string) => void;
  logDose: (key: string, status: DoseLog["status"]) => void;
  undoDose: (key: string) => void;
  snooze: (key: string, minutes: number) => void;
  markNotified: (key: string) => void;
  setCalendar: (p: Partial<CalendarState>) => void;
}

export const useMed = create<State>()(
  persist(
    (set, get) => ({
      draft: emptyDraft(),
      meds: [],
      logs: {},
      snoozed: {},
      notified: {},
      calendar: { connected: false, skipped: false },
      petCheer: 0,
      updateDraft: (p) => set((s) => ({ draft: { ...s.draft, ...p } })),
      resetDraft: () => set({ draft: emptyDraft() }),
      editMed: (id) => {
        const m = get().meds.find((x) => x.id === id);
        if (!m) return;
        set({
          draft: {
            editingId: m.id,
            name: m.name,
            type: m.type,
            dosage: m.dosage,
            photo: m.photo,
            frequency: m.frequency,
            intervalHours: m.intervalHours,
            weekdays: m.weekdays,
            times: m.times,
            startDate: m.startDate,
            endDate: m.endDate ?? "",
            reminders: m.reminders,
          },
        });
      },
      saveDraft: () => {
        const { draft, meds } = get();
        const id = draft.editingId ?? crypto.randomUUID();
        const existing = meds.find((m) => m.id === id);
        const med: Medication = {
          id,
          name: draft.name.trim(),
          type: draft.type,
          dosage: draft.dosage.trim(),
          photo: draft.photo,
          frequency: (draft.frequency || "once") as Frequency,
          intervalHours: draft.intervalHours,
          weekdays: draft.weekdays,
          times: [...new Set(draft.times)].sort(),
          startDate: draft.startDate,
          endDate: draft.endDate || undefined,
          reminders: draft.reminders,
          color: existing?.color ?? MED_COLORS[meds.length % MED_COLORS.length] ?? "med-red",
          active: true,
          createdAt: existing?.createdAt ?? new Date().toISOString(),
        };
        set({
          meds: existing ? meds.map((m) => (m.id === id ? med : m)) : [...meds, med],
          lastSavedId: id,
          draft: emptyDraft(),
        });
        return id;
      },
      // Keeps the record and its history; just stops future doses.
      discontinue: (id) =>
        set((s) => ({
          meds: s.meds.map((m) =>
            m.id === id ? { ...m, active: false, discontinuedAt: new Date().toISOString() } : m,
          ),
        })),
      logDose: (key, status) =>
        set((s) => ({
          logs: { ...s.logs, [key]: { status, at: new Date().toISOString() } },
          petCheer: status === "taken" ? s.petCheer + 1 : s.petCheer,
        })),
      undoDose: (key) =>
        set((s) => {
          const logs = { ...s.logs };
          delete logs[key];
          return { logs };
        }),
      snooze: (key, minutes) =>
        set((s) => ({
          snoozed: { ...s.snoozed, [key]: new Date(Date.now() + minutes * 60000).toISOString() },
          notified: { ...s.notified, [key]: false },
        })),
      markNotified: (key) => set((s) => ({ notified: { ...s.notified, [key]: true } })),
      setCalendar: (p) => set((s) => ({ calendar: { ...s.calendar, ...p } })),
    }),
    { name: "vessa-medication" },
  ),
);

export { DEFAULT_TIMES };
