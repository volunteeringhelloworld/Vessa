import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useVessa } from "@/lib/store";

/** App screens: send signed-out visitors back to the welcome screen once saved state has loaded. */
export function useRequireSession() {
  const hydrated = useVessa((s) => s.hydrated);
  const ok = useVessa((s) => s.loggedIn && !!s.account);
  const navigate = useNavigate();
  useEffect(() => {
    if (hydrated && !ok) navigate({ to: "/welcome", replace: true });
  }, [hydrated, ok, navigate]);
  return hydrated && ok;
}

/** Sign-up steps: if an earlier step is missing, return to the first step. */
export function useRequireDraft(
  check: (s: ReturnType<typeof useVessa.getState>) => boolean,
  to: "/signup/phone" | "/signup/profile" = "/signup/phone",
) {
  const hydrated = useVessa((s) => s.hydrated);
  const ok = useVessa(check);
  const navigate = useNavigate();
  useEffect(() => {
    if (hydrated && !ok) navigate({ to, replace: true });
  }, [hydrated, ok, navigate, to]);
  return hydrated && ok;
}
