import { getBookingState, isDraftComplete } from "./store";

export type StepPath =
  | "/book/care"
  | "/book/reason"
  | "/book/facilities"
  | "/book/doctor"
  | "/book/schedule"
  | "/book/review";

/** 6.1 care · 6.2 reason · 6.3/6.4 facility · 6.5 doctor · 6.6 time · 6.7 review */
export const TOTAL_STEPS = 6;

/**
 * Where "Continue" should go. When the user arrived via an Edit link on the review
 * screen and everything is still complete, return them to the review screen.
 */
export function nextAfter(next: StepPath): StepPath {
  const s = getBookingState();
  if (s.editingFromReview && isDraftComplete(s)) return "/book/review";
  return next;
}
