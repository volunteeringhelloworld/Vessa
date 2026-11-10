import { useNavigate } from "@tanstack/react-router";

import { useProfile } from "@/lib/profile-store";

type ExitPath = "/profile/conditions" | "/profile/allergies" | "/profile/medications" | "/profile/history";

/**
 * Leaves a profile section. When the user arrived from the review screen's edit button,
 * they go straight back to review; otherwise they continue to the next section.
 */
export function useSectionExit() {
  const navigate = useNavigate();
  const returnToReview = useProfile((s) => s.returnToReview);
  return (next: ExitPath) => {
    if (returnToReview) navigate({ to: "/profile/review" });
    else navigate({ to: next });
  };
}
