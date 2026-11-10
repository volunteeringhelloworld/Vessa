import { createFileRoute, notFound } from "@tanstack/react-router";

import { CustomAllergyScreen } from "@/components/vessa/CustomAllergyScreen";
import { CUSTOM_TITLES, isCustomGroup, type CustomGroup } from "@/lib/profile-options";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/profile/allergies/$category/custom")({
  beforeLoad: ({ params }) => {
    if (!isCustomGroup(params.category)) throw notFound();
  },
  head: ({ params }) => {
    const label = CUSTOM_TITLES[params.category as CustomGroup]?.title ?? "Other";
    return pageHead(`Add ${label.toLowerCase()} allergy`, `Add your own ${label.toLowerCase()} allergies to VessA.`);
  },
  component: CustomStep,
});

function CustomStep() {
  const { category } = Route.useParams();
  return <CustomAllergyScreen group={category as CustomGroup} />;
}
