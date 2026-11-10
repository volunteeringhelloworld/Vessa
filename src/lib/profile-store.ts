import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { addUnique, toggleExclusive } from "./profile-logic";
import type { AllergyCategory, AllergyGroup, CustomGroup } from "./profile-options";

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
}

export interface ProfileData {
  fullName: string;
  conditions: string[];
  otherCondition: string;
  allergyCategories: AllergyCategory[];
  allergies: Record<AllergyGroup, string[]>;
  customAllergies: Record<CustomGroup, string[]>;
  takesMedications: boolean | null;
  medications: Medication[];
  hadSurgery: boolean | null;
  surgeries: string[];
  hospitalized: boolean | null;
  familyHistory: string[];
  completed: boolean;
}

interface ProfileState extends ProfileData {
  hydrated: boolean;
  /** Set when the user taps edit on the review screen; the section then returns to review. */
  returnToReview: boolean;
  setReturnToReview: (v: boolean) => void;
  setFullName: (v: string) => void;
  toggleCondition: (id: string) => void;
  setOtherCondition: (v: string) => void;
  toggleAllergyCategory: (c: AllergyCategory) => void;
  selectAllergyCategory: (c: AllergyCategory) => void;
  removeAllergyCategory: (c: AllergyCategory) => void;
  toggleAllergy: (g: AllergyGroup, item: string) => void;
  addCustomAllergy: (g: CustomGroup, v: string) => void;
  removeCustomAllergy: (g: CustomGroup, v: string) => void;
  setTakesMedications: (v: boolean) => void;
  addMedication: (m: Omit<Medication, "id">) => void;
  removeMedication: (id: string) => void;
  setHadSurgery: (v: boolean) => void;
  addSurgery: (v: string) => void;
  removeSurgery: (v: string) => void;
  setHospitalized: (v: boolean) => void;
  addFamilyHistory: (v: string) => void;
  removeFamilyHistory: (v: string) => void;
  complete: () => void;
}

const emptyGroups = () => ({ medication: [], food: [], environmental: [], insect: [] });

export const initialProfile: ProfileData = {
  fullName: "",
  conditions: [],
  otherCondition: "",
  allergyCategories: [],
  allergies: emptyGroups(),
  customAllergies: { ...emptyGroups(), other: [] },
  takesMedications: null,
  medications: [],
  hadSurgery: null,
  surgeries: [],
  hospitalized: null,
  familyHistory: [],
  completed: false,
};

function clearCategory(s: ProfileData, c: AllergyCategory): Partial<ProfileData> {
  if (c === "none") return {};
  const custom = { ...s.customAllergies, [c]: [] };
  if (c === "other") return { customAllergies: custom };
  return { allergies: { ...s.allergies, [c]: [] }, customAllergies: custom };
}

export const useProfile = create<ProfileState>()(
  persist(
    (set) => ({
      ...initialProfile,
      hydrated: false,
      returnToReview: false,
      setReturnToReview: (v) => set({ returnToReview: v }),
      setFullName: (v) => set({ fullName: v }),
      toggleCondition: (id) => set((s) => ({ conditions: toggleExclusive(s.conditions, id, "none") })),
      setOtherCondition: (v) => set({ otherCondition: v }),
      toggleAllergyCategory: (c) =>
        set((s) => {
          const next = toggleExclusive(s.allergyCategories, c, "none");
          // Clear data for anything that got deselected (including when "None" wipes the rest).
          let patch: Partial<ProfileData> = { allergyCategories: next };
          for (const old of s.allergyCategories) {
            if (!next.includes(old)) patch = { ...patch, ...clearCategory({ ...s, ...patch }, old) };
          }
          return patch;
        }),
      selectAllergyCategory: (c) =>
        set((s) =>
          s.allergyCategories.includes(c)
            ? {}
            : { allergyCategories: toggleExclusive(s.allergyCategories, c, "none") },
        ),
      removeAllergyCategory: (c) =>
        set((s) => ({
          allergyCategories: s.allergyCategories.filter((x) => x !== c),
          ...clearCategory(s, c),
        })),
      toggleAllergy: (g, item) =>
        set((s) => {
          const list = s.allergies[g];
          return {
            allergies: {
              ...s.allergies,
              [g]: list.includes(item) ? list.filter((x) => x !== item) : [...list, item],
            },
          };
        }),
      addCustomAllergy: (g, v) =>
        set((s) => ({ customAllergies: { ...s.customAllergies, [g]: addUnique(s.customAllergies[g], v) } })),
      removeCustomAllergy: (g, v) =>
        set((s) => ({
          customAllergies: { ...s.customAllergies, [g]: s.customAllergies[g].filter((x) => x !== v) },
        })),
      setTakesMedications: (v) => set({ takesMedications: v }),
      addMedication: (m) =>
        set((s) => ({
          medications: [...s.medications, { ...m, id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}` }],
        })),
      removeMedication: (id) => set((s) => ({ medications: s.medications.filter((m) => m.id !== id) })),
      setHadSurgery: (v) => set({ hadSurgery: v }),
      addSurgery: (v) => set((s) => ({ surgeries: addUnique(s.surgeries, v) })),
      removeSurgery: (v) => set((s) => ({ surgeries: s.surgeries.filter((x) => x !== v) })),
      setHospitalized: (v) => set({ hospitalized: v }),
      addFamilyHistory: (v) => set((s) => ({ familyHistory: addUnique(s.familyHistory, v) })),
      removeFamilyHistory: (v) => set((s) => ({ familyHistory: s.familyHistory.filter((x) => x !== v) })),
      complete: () => set({ completed: true, returnToReview: false }),
    }),
    {
      name: "vessa-health-profile",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (s) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { hydrated, ...rest } = s;
        return rest;
      },
      onRehydrateStorage: () => () => {
        useProfile.setState({ hydrated: true });
      },
    },
  ),
);
