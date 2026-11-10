import { useSyncExternalStore } from "react";
import { getDoctor, getFacility, type CategoryId, type ConsultType, type Reason } from "./data";
import { isSlotBookable } from "./schedule";

export type Attachment = { id: string; name: string; size: number; type: string };

export type Draft = {
  categories: CategoryId[];
  reason: Reason | null;
  concern: string;
  attachments: Attachment[];
  facilityId: string | null;
  doctorId: string | null;
  consultType: ConsultType;
  date: string | null;
  time: string | null;
  note: string;
};

export type Appointment = {
  id: string;
  ref: string;
  doctorId: string;
  facilityId: string;
  date: string;
  time: string;
  consultType: ConsultType;
  categories: CategoryId[];
  reason: Reason;
  concern: string;
  attachments: Attachment[];
  note: string;
  fee: number;
  status: "confirmed" | "cancelled";
  createdAt: string;
};

export type FacilityPrefs = {
  query: string;
  location: string; // "all" | city
  specialty: "all" | CategoryId;
  sort: "recommended" | "distance" | "rating";
  favoritesOnly: boolean;
};

export type DoctorPrefs = {
  query: string;
  availability: "any" | "today" | "week";
  consult: "any" | ConsultType;
};

export type BookingState = {
  hydrated: boolean;
  draft: Draft;
  facilityPrefs: FacilityPrefs;
  doctorPrefs: DoctorPrefs;
  favorites: string[];
  appointments: Appointment[];
  editingFromReview: boolean;
  lastConfirmedId: string | null;
};

export const emptyDraft: Draft = {
  categories: [],
  reason: null,
  concern: "",
  attachments: [],
  facilityId: null,
  doctorId: null,
  consultType: "in-person",
  date: null,
  time: null,
  note: "",
};

const initialState: BookingState = {
  hydrated: false,
  draft: emptyDraft,
  facilityPrefs: { query: "", location: "all", specialty: "all", sort: "recommended", favoritesOnly: false },
  doctorPrefs: { query: "", availability: "any", consult: "any" },
  favorites: [],
  appointments: [],
  editingFromReview: false,
  lastConfirmedId: null,
};

const STORAGE_KEY = "vessa.booking.v1";
let state: BookingState = initialState;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const saved = raw ? (JSON.parse(raw) as Partial<BookingState>) : {};
    state = {
      ...initialState,
      ...saved,
      draft: { ...emptyDraft, ...saved.draft },
      facilityPrefs: { ...initialState.facilityPrefs, ...saved.facilityPrefs },
      doctorPrefs: { ...initialState.doctorPrefs, ...saved.doctorPrefs },
      hydrated: true,
    };
  } catch {
    state = { ...initialState, hydrated: true };
  }
}

function persist() {
  try {
    const { hydrated: _h, ...rest } = state;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
  } catch {
    /* storage full or unavailable — keep in memory */
  }
}

function setState(update: (s: BookingState) => BookingState) {
  load();
  state = update(state);
  persist();
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  load();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getBookingState() {
  load();
  return state;
}

export function useBooking(): BookingState {
  return useSyncExternalStore(subscribe, getBookingState, () => initialState);
}

const patchDraft = (patch: Partial<Draft>) =>
  setState((s) => ({ ...s, draft: { ...s.draft, ...patch } }));

export const booking = {
  startNew() {
    setState((s) => ({ ...s, draft: emptyDraft, editingFromReview: false }));
  },
  toggleCategory(id: CategoryId) {
    setState((s) => {
      const has = s.draft.categories.includes(id);
      const categories = has ? s.draft.categories.filter((c) => c !== id) : [...s.draft.categories, id];
      return { ...s, draft: { ...s.draft, categories } };
    });
  },
  setReason(reason: Reason) {
    patchDraft({ reason });
  },
  setConcern(concern: string) {
    patchDraft({ concern });
  },
  addAttachments(files: Attachment[]) {
    setState((s) => ({ ...s, draft: { ...s.draft, attachments: [...s.draft.attachments, ...files] } }));
  },
  removeAttachment(id: string) {
    setState((s) => ({
      ...s,
      draft: { ...s.draft, attachments: s.draft.attachments.filter((a) => a.id !== id) },
    }));
  },
  /** Choosing a different facility clears the doctor and time, which belong to the old one. */
  selectFacility(facilityId: string) {
    setState((s) =>
      s.draft.facilityId === facilityId
        ? s
        : { ...s, draft: { ...s.draft, facilityId, doctorId: null, date: null, time: null } },
    );
  },
  /** Choosing a different doctor clears the time, which belonged to the old schedule. */
  selectDoctor(doctorId: string) {
    setState((s) => {
      if (s.draft.doctorId === doctorId) return s;
      const doctor = getDoctor(doctorId);
      const consultType =
        doctor && !doctor.consultTypes.includes(s.draft.consultType)
          ? (doctor.consultTypes[0] ?? s.draft.consultType)
          : s.draft.consultType;
      return { ...s, draft: { ...s.draft, doctorId, consultType, date: null, time: null } };
    });
  },
  setConsultType(consultType: ConsultType) {
    patchDraft({ consultType });
  },
  selectDate(date: string) {
    setState((s) => (s.draft.date === date ? s : { ...s, draft: { ...s.draft, date, time: null } }));
  },
  selectTime(time: string) {
    patchDraft({ time });
  },
  setNote(note: string) {
    patchDraft({ note });
  },
  setFacilityPrefs(patch: Partial<FacilityPrefs>) {
    setState((s) => ({ ...s, facilityPrefs: { ...s.facilityPrefs, ...patch } }));
  },
  setDoctorPrefs(patch: Partial<DoctorPrefs>) {
    setState((s) => ({ ...s, doctorPrefs: { ...s.doctorPrefs, ...patch } }));
  },
  toggleFavorite(facilityId: string) {
    setState((s) => ({
      ...s,
      favorites: s.favorites.includes(facilityId)
        ? s.favorites.filter((f) => f !== facilityId)
        : [...s.favorites, facilityId],
    }));
  },
  setEditingFromReview(editingFromReview: boolean) {
    setState((s) => ({ ...s, editingFromReview }));
  },
  cancelAppointment(id: string) {
    setState((s) => ({
      ...s,
      appointments: s.appointments.map((a) => (a.id === id ? { ...a, status: "cancelled" } : a)),
    }));
  },
};

export type MissingField = "care" | "reason" | "facility" | "doctor" | "schedule";

/** Lists the parts of the draft still needed before it can be booked. */
export function missingFields(s: BookingState, now = new Date()): MissingField[] {
  const d = s.draft;
  const missing: MissingField[] = [];
  if (d.categories.length === 0) missing.push("care");
  if (!d.reason) missing.push("reason");
  if (!getFacility(d.facilityId)) missing.push("facility");
  const doctor = getDoctor(d.doctorId);
  if (!doctor || doctor.facilityId !== d.facilityId) missing.push("doctor");
  if (!doctor || !d.date || !d.time || !isSlotBookable(doctor, d.date, d.time, now, s.appointments))
    missing.push("schedule");
  return missing;
}

export const isDraftComplete = (s: BookingState, now = new Date()) =>
  missingFields(s, now).length === 0;

function makeRef(date: string) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 4; i++) code += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `VSA-${date.slice(5).replace("-", "")}-${code}`;
}

export type ConfirmResult =
  | { ok: true; appointment: Appointment }
  | { ok: false; error: "incomplete"; missing: MissingField[] }
  | { ok: false; error: "slot-taken" };

/**
 * Validates the draft, re-checks the slot is still free, then saves the booking.
 * Nothing is marked confirmed until this resolves with ok: true.
 */
export async function confirmBooking(latencyMs = 1100): Promise<ConfirmResult> {
  const before = getBookingState();
  const missing = missingFields(before).filter((f) => f !== "schedule");
  if (missing.length || !before.draft.date || !before.draft.time) {
    return { ok: false, error: "incomplete", missing: missingFields(before) };
  }

  await new Promise((r) => setTimeout(r, latencyMs));

  const s = getBookingState();
  const d = s.draft;
  const doctor = getDoctor(d.doctorId);
  if (!doctor || !d.date || !d.time || !d.reason || !d.facilityId) {
    return { ok: false, error: "incomplete", missing: missingFields(s) };
  }
  if (!isSlotBookable(doctor, d.date, d.time, new Date(), s.appointments)) {
    return { ok: false, error: "slot-taken" };
  }

  const appointment: Appointment = {
    id: `apt_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    ref: makeRef(d.date),
    doctorId: doctor.id,
    facilityId: d.facilityId,
    date: d.date,
    time: d.time,
    consultType: d.consultType,
    categories: d.categories,
    reason: d.reason,
    concern: d.concern,
    attachments: d.attachments,
    note: d.note,
    fee: doctor.fee,
    status: "confirmed",
    createdAt: new Date().toISOString(),
  };

  setState((cur) => ({
    ...cur,
    appointments: [...cur.appointments, appointment],
    lastConfirmedId: appointment.id,
    draft: emptyDraft,
    editingFromReview: false,
  }));
  return { ok: true, appointment };
}

/** Test helper: reset the in-memory store. */
export function __resetBookingStore(next?: Partial<BookingState>) {
  loaded = true;
  state = { ...initialState, hydrated: true, ...next };
  listeners.forEach((l) => l());
}
