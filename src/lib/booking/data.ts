import tuHospital from "@/assets/facility-tu-hospital.jpg";
import lunaClinic from "@/assets/facility-luna-clinic.jpg";
import siamCare from "@/assets/facility-siam-care.jpg";
import lotusDental from "@/assets/facility-lotus-dental.jpg";
import mindfulWellness from "@/assets/facility-mindful-wellness.jpg";
import drSomjai from "@/assets/doctor-somjai.jpg";
import drPrasert from "@/assets/doctor-prasert.jpg";
import drNalin from "@/assets/doctor-nalin.jpg";
import drKittipong from "@/assets/doctor-kittipong.jpg";
import drPloy from "@/assets/doctor-ploy.jpg";
import drThanawat from "@/assets/doctor-thanawat.jpg";
import drPimchanok from "@/assets/doctor-pimchanok.jpg";
import drArthit from "@/assets/doctor-arthit.jpg";

export type CategoryId =
  | "general"
  | "dental"
  | "skin"
  | "women"
  | "mental"
  | "specialist"
  | "lab"
  | "other";

export const CATEGORIES: { id: CategoryId; label: string; tone: string }[] = [
  { id: "general", label: "General Check-up", tone: "bg-peach" },
  { id: "dental", label: "Dental Care", tone: "bg-butter" },
  { id: "skin", label: "Skin & Dermatology", tone: "bg-blush" },
  { id: "women", label: "Women’s Health", tone: "bg-apricot" },
  { id: "mental", label: "Mental Wellness", tone: "bg-honey" },
  { id: "specialist", label: "Specialist Consultation", tone: "bg-salmon" },
  { id: "lab", label: "Laboratory Tests", tone: "bg-butter" },
  { id: "other", label: "Other", tone: "bg-blush" },
];

export const REASONS = [
  "Routine Check-up",
  "New Symptoms",
  "Follow-up Visit",
  "Ongoing Treatment",
  "Health Consultation",
  "Other Concerns",
] as const;
export type Reason = (typeof REASONS)[number];

export const LOCATIONS = ["Bangkok", "Pathum Thani", "Nonthaburi"] as const;

export type Review = { author: string; rating: number; text: string };

export type Facility = {
  id: string;
  name: string;
  kind: "Hospital" | "Clinic";
  image: string;
  city: (typeof LOCATIONS)[number];
  address: string;
  distanceKm: number;
  rating: number;
  reviewCount: number;
  categories: CategoryId[];
  specialties: string[];
  services: string[];
  hours: { days: string; time: string }[];
  phone: string;
  email: string;
  lat: number;
  lng: number;
  reviews: Review[];
};

export const FACILITIES: Facility[] = [
  {
    id: "tu-hospital",
    name: "TU Hospital",
    kind: "Hospital",
    image: tuHospital,
    city: "Pathum Thani",
    address: "95 Phahonyothin Rd, Khlong Nueng, Khlong Luang, Pathum Thani 12120",
    distanceKm: 4.2,
    rating: 4.8,
    reviewCount: 1284,
    categories: ["general", "specialist", "lab", "women", "other"],
    specialties: ["Internal Medicine", "Cardiology", "Obstetrics & Gynecology", "Pathology"],
    services: ["24-hour emergency", "Outpatient clinics", "Laboratory & imaging", "Pharmacy", "Health screening"],
    hours: [
      { days: "Mon – Fri", time: "07:00 – 20:00" },
      { days: "Sat – Sun", time: "08:00 – 16:00" },
      { days: "Emergency", time: "Open 24 hours" },
    ],
    phone: "+66 2 926 9999",
    email: "care@tuhospital.example",
    lat: 14.0718,
    lng: 100.6056,
    reviews: [
      { author: "Malee K.", rating: 5, text: "Very organised and the nurses were so kind. Short wait for my check-up." },
      { author: "James R.", rating: 4, text: "Great specialists. Parking can be busy in the morning." },
    ],
  },
  {
    id: "luna-clinic",
    name: "Luna Women’s Clinic",
    kind: "Clinic",
    image: lunaClinic,
    city: "Bangkok",
    address: "88 Sukhumvit 39, Khlong Tan Nuea, Watthana, Bangkok 10110",
    distanceKm: 2.1,
    rating: 4.9,
    reviewCount: 642,
    categories: ["women", "general", "skin"],
    specialties: ["Obstetrics & Gynecology", "Family Medicine", "Aesthetic Dermatology"],
    services: ["Prenatal care", "Women’s health screening", "Fertility consultation", "Online consultation"],
    hours: [
      { days: "Mon – Sat", time: "09:00 – 19:00" },
      { days: "Sunday", time: "Closed" },
    ],
    phone: "+66 2 258 4400",
    email: "hello@lunaclinic.example",
    lat: 13.7317,
    lng: 100.5712,
    reviews: [
      { author: "Ploy S.", rating: 5, text: "Calm, private and beautiful. I felt truly listened to." },
      { author: "Anna W.", rating: 5, text: "Online follow-up was so easy. Highly recommend." },
    ],
  },
  {
    id: "siam-care",
    name: "Siam Care Medical Center",
    kind: "Hospital",
    image: siamCare,
    city: "Bangkok",
    address: "1 Rama IV Rd, Pathum Wan, Bangkok 10330",
    distanceKm: 5.6,
    rating: 4.7,
    reviewCount: 2310,
    categories: ["general", "specialist", "lab", "skin", "mental", "other"],
    specialties: ["Internal Medicine", "Dermatology", "Neurology", "Psychiatry", "Laboratory Medicine"],
    services: ["Executive health check", "Same-day lab results", "International patient desk", "Telemedicine"],
    hours: [
      { days: "Every day", time: "07:00 – 21:00" },
      { days: "Emergency", time: "Open 24 hours" },
    ],
    phone: "+66 2 011 2222",
    email: "appointments@siamcare.example",
    lat: 13.7308,
    lng: 100.5341,
    reviews: [
      { author: "Somchai P.", rating: 5, text: "Lab results came back the same afternoon. Very efficient." },
      { author: "Lena M.", rating: 4, text: "Modern and clean. English-speaking staff were helpful." },
    ],
  },
  {
    id: "lotus-dental",
    name: "Lotus Dental & Skin Clinic",
    kind: "Clinic",
    image: lotusDental,
    city: "Nonthaburi",
    address: "45/7 Ratchaphruek Rd, Bang Rak Noi, Mueang Nonthaburi 11000",
    distanceKm: 8.9,
    rating: 4.6,
    reviewCount: 418,
    categories: ["dental", "skin"],
    specialties: ["General Dentistry", "Orthodontics", "Dermatology"],
    services: ["Cleaning & whitening", "Braces & aligners", "Acne & skin care", "Laser treatment"],
    hours: [
      { days: "Tue – Sun", time: "10:00 – 20:00" },
      { days: "Monday", time: "Closed" },
    ],
    phone: "+66 2 589 1010",
    email: "smile@lotusclinic.example",
    lat: 13.8621,
    lng: 100.4733,
    reviews: [
      { author: "Nok T.", rating: 5, text: "Painless cleaning and a very gentle dentist." },
      { author: "Ben C.", rating: 4, text: "Good results for my skin. Booking ahead is a must." },
    ],
  },
  {
    id: "mindful-wellness",
    name: "Mindful Wellness Center",
    kind: "Clinic",
    image: mindfulWellness,
    city: "Bangkok",
    address: "19 Soi Ari 4, Phaya Thai, Bangkok 10400",
    distanceKm: 3.4,
    rating: 4.9,
    reviewCount: 356,
    categories: ["mental", "specialist", "other"],
    specialties: ["Psychiatry", "Clinical Psychology", "Sleep Medicine"],
    services: ["Counselling sessions", "Stress & anxiety care", "Sleep consultation", "Online therapy"],
    hours: [
      { days: "Mon – Fri", time: "10:00 – 20:00" },
      { days: "Saturday", time: "09:00 – 15:00" },
    ],
    phone: "+66 2 279 3030",
    email: "care@mindfulwellness.example",
    lat: 13.7798,
    lng: 100.5446,
    reviews: [
      { author: "Fah R.", rating: 5, text: "A safe, warm space. My therapist is wonderful." },
      { author: "Kim L.", rating: 5, text: "Easy to book online sessions that fit my work hours." },
    ],
  },
];

export type ConsultType = "in-person" | "online";

export type Doctor = {
  id: string;
  name: string;
  photo: string;
  specialty: string;
  facilityId: string;
  categories: CategoryId[];
  years: number;
  rating: number;
  reviewCount: number;
  fee: number;
  consultTypes: ConsultType[];
  /** 0 = Sunday … 6 = Saturday */
  daysOff: number[];
  periods: Period[];
  languages: string[];
  education: string;
  bio: string;
};

export type Period = "morning" | "afternoon" | "evening";

export const DOCTORS: Doctor[] = [
  {
    id: "somjai",
    name: "Dr. Somjai Rattanakul",
    photo: drSomjai,
    specialty: "Family Medicine",
    facilityId: "tu-hospital",
    categories: ["general", "lab", "other"],
    years: 14,
    rating: 4.9,
    reviewCount: 412,
    fee: 800,
    consultTypes: ["in-person", "online"],
    daysOff: [0],
    periods: ["morning", "afternoon"],
    languages: ["Thai", "English"],
    education: "MD, Thammasat University",
    bio: "Dr. Somjai focuses on preventive care and long-term family health, with a gentle, unhurried approach.",
  },
  {
    id: "prasert",
    name: "Dr. Prasert Wattanakit",
    photo: drPrasert,
    specialty: "Cardiology",
    facilityId: "tu-hospital",
    categories: ["specialist", "general"],
    years: 22,
    rating: 4.8,
    reviewCount: 538,
    fee: 1500,
    consultTypes: ["in-person"],
    daysOff: [0, 6],
    periods: ["morning", "afternoon"],
    languages: ["Thai", "English"],
    education: "MD, Mahidol University · Fellowship in Cardiology",
    bio: "A senior cardiologist helping patients understand and manage heart health with clear, practical plans.",
  },
  {
    id: "nalin",
    name: "Dr. Nalin Srisuk",
    photo: drNalin,
    specialty: "Obstetrics & Gynecology",
    facilityId: "luna-clinic",
    categories: ["women", "general"],
    years: 8,
    rating: 4.9,
    reviewCount: 296,
    fee: 1200,
    consultTypes: ["in-person", "online"],
    daysOff: [0, 3],
    periods: ["morning", "afternoon", "evening"],
    languages: ["Thai", "English"],
    education: "MD, Chulalongkorn University",
    bio: "Dr. Nalin supports women through every stage of life, from routine screening to prenatal care.",
  },
  {
    id: "kittipong",
    name: "Dr. Kittipong Chaiyasit",
    photo: drKittipong,
    specialty: "Internal Medicine",
    facilityId: "siam-care",
    categories: ["general", "specialist", "lab", "other"],
    years: 9,
    rating: 4.7,
    reviewCount: 221,
    fee: 1000,
    consultTypes: ["in-person", "online"],
    daysOff: [5],
    periods: ["afternoon", "evening"],
    languages: ["Thai", "English", "Chinese"],
    education: "MD, Siriraj Hospital, Mahidol University",
    bio: "Known for thorough explanations and evening clinics that suit busy schedules.",
  },
  {
    id: "thanawat",
    name: "Dr. Thanawat Boonma",
    photo: drThanawat,
    specialty: "Dermatology",
    facilityId: "siam-care",
    categories: ["skin", "specialist"],
    years: 16,
    rating: 4.8,
    reviewCount: 389,
    fee: 1300,
    consultTypes: ["in-person"],
    daysOff: [0, 1],
    periods: ["morning", "afternoon"],
    languages: ["Thai", "English"],
    education: "MD, Chiang Mai University · Board-certified Dermatologist",
    bio: "Treats acne, eczema and skin allergies with evidence-based, skin-friendly routines.",
  },
  {
    id: "narintra",
    name: "Dr. Narintra Suwan",
    photo: drPloy,
    specialty: "General Dentistry",
    facilityId: "lotus-dental",
    categories: ["dental"],
    years: 11,
    rating: 4.8,
    reviewCount: 274,
    fee: 700,
    consultTypes: ["in-person"],
    daysOff: [1],
    periods: ["morning", "afternoon", "evening"],
    languages: ["Thai", "English"],
    education: "DDS, Chulalongkorn University",
    bio: "Gentle dentist who makes nervous patients feel at ease — cleanings, fillings and whitening.",
  },
  {
    id: "pimchanok",
    name: "Dr. Pimchanok Inthara",
    photo: drPimchanok,
    specialty: "Psychiatry",
    facilityId: "mindful-wellness",
    categories: ["mental", "specialist"],
    years: 13,
    rating: 5.0,
    reviewCount: 187,
    fee: 1800,
    consultTypes: ["in-person", "online"],
    daysOff: [0],
    periods: ["morning", "afternoon", "evening"],
    languages: ["Thai", "English"],
    education: "MD, Ramathibodi Hospital · Psychiatry residency",
    bio: "Offers compassionate care for anxiety, low mood and sleep, in person or online.",
  },
  {
    id: "arthit",
    name: "Dr. Arthit Phromma",
    photo: drArthit,
    specialty: "Internal Medicine",
    facilityId: "luna-clinic",
    categories: ["general", "other"],
    years: 18,
    rating: 4.7,
    reviewCount: 344,
    fee: 900,
    consultTypes: ["in-person", "online"],
    daysOff: [0, 4],
    periods: ["morning", "evening"],
    languages: ["Thai", "English"],
    education: "MD, Khon Kaen University",
    bio: "A calm, experienced physician for check-ups, ongoing conditions and health advice.",
  },
];

export const getFacility = (id: string | null | undefined) =>
  FACILITIES.find((f) => f.id === id) ?? null;
export const getDoctor = (id: string | null | undefined) =>
  DOCTORS.find((d) => d.id === id) ?? null;
export const doctorsAt = (facilityId: string) => DOCTORS.filter((d) => d.facilityId === facilityId);
export const categoryLabel = (id: CategoryId) => CATEGORIES.find((c) => c.id === id)?.label ?? id;

export const formatFee = (fee: number) => `฿${fee.toLocaleString("en-US")}`;

export const mapsDirectionsUrl = (f: Facility) =>
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${f.name}, ${f.address}`)}`;

export const mapEmbedUrl = (f: Facility) => {
  const d = 0.006;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${f.lng - d}%2C${f.lat - d}%2C${f.lng + d}%2C${f.lat + d}&layer=mapnik&marker=${f.lat}%2C${f.lng}`;
};
