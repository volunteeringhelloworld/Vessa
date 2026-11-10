import { describe, it, expect } from "vitest";
import { computeStreak, timesOn, doseKey, intervalTimes, type Medication } from "./med-logic";

const base: Medication = {
  id: "m1", name: "Vitamin D", type: "Tablet", dosage: "1 tablet", frequency: "days",
  intervalHours: 4, weekdays: [1, 3, 5], times: ["09:00"], startDate: "2026-11-01",
  reminders: { atTime: true, before10: false, repeat: false, sound: true },
  color: "red", active: true, createdAt: "2026-11-01",
};

describe("medication streak", () => {
  it("days without scheduled medication do not break the streak", () => {
    // Mon 2 Nov, Wed 4 Nov, Fri 6 Nov scheduled; now Sat 7 Nov (unscheduled)
    const logs = {
      [doseKey("m1", "2026-11-02", "09:00")]: { status: "taken" as const, at: "" },
      [doseKey("m1", "2026-11-04", "09:00")]: { status: "taken" as const, at: "" },
      [doseKey("m1", "2026-11-06", "09:00")]: { status: "taken" as const, at: "" },
    };
    expect(computeStreak([base], logs, new Date(2026, 10, 7, 12))).toBe(3);
  });
  it("a missed scheduled dose breaks the streak", () => {
    const logs = {
      [doseKey("m1", "2026-11-02", "09:00")]: { status: "taken" as const, at: "" },
      [doseKey("m1", "2026-11-06", "09:00")]: { status: "taken" as const, at: "" },
    };
    expect(computeStreak([base], logs, new Date(2026, 10, 7, 12))).toBe(1);
  });
  it("no doses taken means zero streak", () => {
    expect(computeStreak([base], {}, new Date(2026, 10, 7, 12))).toBe(0);
  });
  it("specific days schedule only on selected weekdays", () => {
    expect(timesOn(base, "2026-11-03")).toEqual([]);
    expect(timesOn(base, "2026-11-04")).toEqual(["09:00"]);
  });
  it("every 6 hours from 08:00 gives 3 doses in the day", () => {
    expect(intervalTimes("08:00", 6)).toEqual(["08:00", "14:00", "20:00"]);
  });
});
