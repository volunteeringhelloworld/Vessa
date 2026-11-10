import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  EMPTY_HEALTH,
  createOtpTicket,
  normalizePhone,
  phoneKey,
  type HealthProfile,
  type OtpPurpose,
  type OtpTicket,
} from "./vessa-rules";

export type Lang = "en" | "th";
export type Gender = "female" | "male" | "other";
export type Intent = "book" | "find" | "records" | "meds" | "explore";
export type Slot = "morning" | "noon" | "evening" | "bedtime";
export type Dob = { day: number; month: number; year: number };

export type Account = {
  countryCode: string;
  phone: string;
  password: string;
  name: string;
  dob: Dob;
  gender: Gender;
  createdAt: string;
};

export type Draft = {
  countryCode: string;
  phone: string;
  name: string;
  dob: Dob;
  gender: Gender;
  otpVerified: boolean;
};

export type Medication = {
  id: string;
  name: string;
  dose: string;
  times: Slot[];
  taken: Record<string, Slot[]>;
};

export type Appointment = {
  id: string;
  providerId: string;
  date: string;
  time: string;
  reason: string;
  status: "booked" | "cancelled";
};

const DEFAULT_DRAFT: Draft = {
  countryCode: "TH",
  phone: "",
  name: "",
  dob: { day: 1, month: 1, year: 1995 },
  gender: "female",
  otpVerified: false,
};

type State = {
  hydrated: boolean;
  lang: Lang;
  intents: Intent[];
  draft: Draft;
  account: Account | null;
  loggedIn: boolean;
  otp: OtpTicket | null;
  resetPhoneKey: string | null;
  resetVerified: boolean;
  health: HealthProfile;
  meds: Medication[];
  appointments: Appointment[];
  connectedProviders: string[];
};

type Actions = {
  setLang: (l: Lang) => void;
  toggleIntent: (i: Intent) => void;
  updateDraft: (p: Partial<Draft>) => void;
  issueOtp: (purpose: OtpPurpose, countryCode: string, phone: string) => OtpTicket;
  clearOtp: () => void;
  completeSignup: (password: string) => void;
  login: (
    countryCode: string,
    phone: string,
    password: string,
  ) => "ok" | "no-account" | "wrong-password";
  logout: () => void;
  startReset: (key: string) => void;
  markResetVerified: () => void;
  resetPassword: (password: string) => void;
  updateHealth: (p: Partial<HealthProfile>) => void;
  addMed: (m: Omit<Medication, "id" | "taken">) => void;
  removeMed: (id: string) => void;
  toggleTaken: (id: string, day: string, slot: Slot) => void;
  addAppointment: (a: Omit<Appointment, "id" | "status">) => void;
  cancelAppointment: (id: string) => void;
  toggleProvider: (id: string) => void;
};

const uid = () => Math.random().toString(36).slice(2, 10);

export const useVessa = create<State & Actions>()(
  persist(
    (set, get) => ({
      hydrated: false,
      lang: "en",
      intents: [],
      draft: DEFAULT_DRAFT,
      account: null,
      loggedIn: false,
      otp: null,
      resetPhoneKey: null,
      resetVerified: false,
      health: EMPTY_HEALTH,
      meds: [],
      appointments: [],
      connectedProviders: [],

      setLang: (lang) => set({ lang }),
      toggleIntent: (i) =>
        set((s) => ({
          intents: s.intents.includes(i) ? s.intents.filter((x) => x !== i) : [...s.intents, i],
        })),
      updateDraft: (p) => set((s) => ({ draft: { ...s.draft, ...p } })),
      issueOtp: (purpose, countryCode, phone) => {
        const ticket = createOtpTicket(purpose, phoneKey(countryCode, phone), Date.now());
        set({ otp: ticket });
        return ticket;
      },
      clearOtp: () => set({ otp: null }),
      completeSignup: (password) => {
        const d = get().draft;
        set({
          account: {
            countryCode: d.countryCode,
            phone: normalizePhone(d.phone),
            password,
            name: d.name.trim(),
            dob: d.dob,
            gender: d.gender,
            createdAt: new Date().toISOString(),
          },
          loggedIn: true,
          otp: null,
          health: EMPTY_HEALTH,
          meds: [],
          appointments: [],
          connectedProviders: [],
        });
      },
      login: (countryCode, phone, password) => {
        const a = get().account;
        if (!a || phoneKey(a.countryCode, a.phone) !== phoneKey(countryCode, phone))
          return "no-account";
        if (a.password !== password) return "wrong-password";
        set({ loggedIn: true });
        return "ok";
      },
      logout: () => set({ loggedIn: false }),
      startReset: (key) => set({ resetPhoneKey: key, resetVerified: false }),
      markResetVerified: () => set({ resetVerified: true, otp: null }),
      resetPassword: (password) =>
        set((s) => ({
          account: s.account ? { ...s.account, password } : s.account,
          resetPhoneKey: null,
          resetVerified: false,
        })),
      updateHealth: (p) => set((s) => ({ health: { ...s.health, ...p } })),
      addMed: (m) => set((s) => ({ meds: [...s.meds, { ...m, id: uid(), taken: {} }] })),
      removeMed: (id) => set((s) => ({ meds: s.meds.filter((m) => m.id !== id) })),
      toggleTaken: (id, day, slot) =>
        set((s) => ({
          meds: s.meds.map((m) => {
            if (m.id !== id) return m;
            const cur = m.taken[day] ?? [];
            const next = cur.includes(slot) ? cur.filter((x) => x !== slot) : [...cur, slot];
            return { ...m, taken: { ...m.taken, [day]: next } };
          }),
        })),
      addAppointment: (a) =>
        set((s) => ({ appointments: [...s.appointments, { ...a, id: uid(), status: "booked" }] })),
      cancelAppointment: (id) =>
        set((s) => ({
          appointments: s.appointments.map((a) =>
            a.id === id ? { ...a, status: "cancelled" } : a,
          ),
        })),
      toggleProvider: (id) =>
        set((s) => ({
          connectedProviders: s.connectedProviders.includes(id)
            ? s.connectedProviders.filter((x) => x !== id)
            : [...s.connectedProviders, id],
        })),
    }),
    {
      name: "vessa-state-v1",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: ({ hydrated: _h, ...rest }) => rest,
      onRehydrateStorage: () => () => {
        useVessa.setState({ hydrated: true });
      },
    },
  ),
);
