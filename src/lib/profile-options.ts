import {
  Bug,
  Check,
  Droplet,
  Ellipsis,
  Heart,
  HeartPulse,
  PenLine,
  Pill,
  Sprout,
  Utensils,
  Wind,
  type LucideIcon,
} from "lucide-react";

export type AllergyGroup = "medication" | "food" | "environmental" | "insect";
export type AllergyCategory = AllergyGroup | "none" | "other";
export type CustomGroup = AllergyGroup | "other";

export interface Option {
  id: string;
  label: string;
  icon: LucideIcon;
}

export const CONDITION_OPTIONS: Option[] = [
  { id: "diabetes", label: "Diabetes", icon: Droplet },
  { id: "high-blood-pressure", label: "High Blood Pressure", icon: HeartPulse },
  { id: "asthma", label: "Asthma", icon: Wind },
  { id: "heart-disease", label: "Heart Disease", icon: Heart },
  { id: "none", label: "None", icon: Check },
  { id: "others", label: "Others", icon: PenLine },
];

export const ALLERGY_CATEGORIES: (Option & { id: AllergyCategory })[] = [
  { id: "medication", label: "Medication", icon: Pill },
  { id: "food", label: "Foods", icon: Utensils },
  { id: "environmental", label: "Environmental", icon: Sprout },
  { id: "insect", label: "Insect", icon: Bug },
  { id: "other", label: "Other", icon: Ellipsis },
  { id: "none", label: "None", icon: Check },
];

export const ALLERGY_GROUPS: Record<
  AllergyGroup,
  { title: string; icon: LucideIcon; options: string[]; otherLabel: string }
> = {
  medication: {
    title: "Medication",
    icon: Pill,
    options: ["Penicillin", "Aspirin", "Ibuprofen", "Certain Antibiotics"],
    otherLabel: "Others",
  },
  food: {
    title: "Foods",
    icon: Utensils,
    options: ["Peanut", "Tree Nuts", "Wheat/Gluten", "Seafood", "Egg", "Soy"],
    otherLabel: "Other",
  },
  environmental: {
    title: "Environmental",
    icon: Sprout,
    options: ["Pollen", "Pet Dander", "Mold", "Dust Mites"],
    otherLabel: "Others",
  },
  insect: {
    title: "Insect",
    icon: Bug,
    options: ["Bee Stings", "Wasp Stings", "Mosquito Bites"],
    otherLabel: "Others",
  },
};

export const CUSTOM_TITLES: Record<CustomGroup, { title: string; icon: LucideIcon; placeholder: string }> = {
  medication: { title: "Medication", icon: Pill, placeholder: "e.g. Sulfa drugs" },
  food: { title: "Foods", icon: Utensils, placeholder: "e.g. Sesame" },
  environmental: { title: "Environmental", icon: Sprout, placeholder: "e.g. Grass" },
  insect: { title: "Insect", icon: Bug, placeholder: "e.g. Fire ant bites" },
  other: { title: "Other", icon: Ellipsis, placeholder: "e.g. Latex" },
};

export const FREQUENCY_OPTIONS = [
  "Once a day",
  "Twice a day",
  "Three times a day",
  "Every 4–6 hours",
  "Once a week",
  "As needed",
];

export function isAllergyGroup(v: string): v is AllergyGroup {
  return v === "medication" || v === "food" || v === "environmental" || v === "insect";
}

export function isCustomGroup(v: string): v is CustomGroup {
  return isAllergyGroup(v) || v === "other";
}
