import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppScreen } from "@/components/vessa/AppScreen";
import { useVessa } from "@/lib/store";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: () =>
    pageHead(
      "Vessa",
      "Your calm, warm healthcare companion for records, medication and appointments.",
    ),
  component: Splash,
});

const LETTERS = ["V", "e", "s", "s", "a"];
const STAGGER = 240;
const LETTER_MS = 750;
const HOLD_MS = 1100;

function Splash() {
  const navigate = useNavigate();
  const hydrated = useVessa((s) => s.hydrated);
  const loggedIn = useVessa((s) => s.loggedIn && !!s.account);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const total = STAGGER * (LETTERS.length - 1) + LETTER_MS + HOLD_MS + 300;
    const id = setTimeout(() => setDone(true), total);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    if (done && hydrated) navigate({ to: loggedIn ? "/home" : "/onboarding", replace: true });
  }, [done, hydrated, loggedIn, navigate]);

  return (
    <AppScreen variant="splash" className="items-center justify-center">
      <h1
        aria-label="Vessa"
        className="flex font-display text-[4.5rem] font-light italic leading-none text-on-splash"
      >
        {LETTERS.map((l, i) => (
          <span
            key={i}
            aria-hidden
            className="inline-block animate-letter [text-shadow:0_6px_30px_oklch(0.35_0.08_40/0.35)]"
            style={{ animationDelay: `${300 + i * STAGGER}ms` }}
          >
            {l}
          </span>
        ))}
      </h1>
    </AppScreen>
  );
}
