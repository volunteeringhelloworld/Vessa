import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/vessa/ComingSoon";

export const Route = createFileRoute("/records")({
  head: () => ({
    meta: [
      { title: "Medical records — VessA" },
      { name: "description", content: "Medical records are coming soon to VessA." },
      { property: "og:title", content: "Medical records — VessA" },
      { property: "og:description", content: "Medical records are coming soon to VessA." },
    ],
  }),
  component: () => (
    <ComingSoon
      title="Medical records"
      body="Soon your test results, reports and documents will live here. For now, you can book and manage appointments."
    />
  ),
});
