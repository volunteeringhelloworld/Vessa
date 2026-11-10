/**
 * Pure rules for the health-profile onboarding. Kept free of React so they can be tested.
 */

/** Toggle `item` in a multi-select list where `noneId` is mutually exclusive with every other option. */
export function toggleExclusive<T extends string>(list: T[], item: T, noneId: T): T[] {
  if (list.includes(item)) return list.filter((x) => x !== item);
  if (item === noneId) return [noneId];
  return [...list.filter((x) => x !== noneId), item];
}

/** Add a trimmed, non-empty, case-insensitively unique entry. */
export function addUnique(list: string[], value: string): string[] {
  const v = value.trim();
  if (!v) return list;
  if (list.some((x) => x.toLowerCase() === v.toLowerCase())) return list;
  return [...list, v];
}

export type YesNo = "yes" | "no";

/** Frame 7.3: Yes → add medication (7.3.1); No → medical history (7.4). */
export function routeAfterMedicationsAnswer(answer: YesNo) {
  return answer === "yes" ? ("/profile/medications/add" as const) : ("/profile/history" as const);
}

/** Frame 7.4: Yes → surgery details (7.4.1); No → hospitalization (7.5). */
export function routeAfterSurgeryAnswer(answer: YesNo) {
  return answer === "yes" ? ("/profile/history/surgeries" as const) : ("/profile/hospitalization" as const);
}

/**
 * Progress through the profile (0–1). Each screen sits at a fixed point so the bar fills
 * steadily as the user moves forward; the review screen is always 100%.
 */
export const PROGRESS = {
  name: 0.08,
  conditions: 0.2,
  allergies: 0.32,
  allergyDetail: 0.4,
  allergyCustom: 0.46,
  medications: 0.55,
  medicationsAdd: 0.62,
  history: 0.7,
  surgeries: 0.76,
  hospitalization: 0.83,
  family: 0.91,
  review: 1,
} as const;
