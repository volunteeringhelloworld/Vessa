export type Provider = { id: string; name: string; area: string; distanceKm: number };

// Sample partner list used for booking, connecting and the nearby-hospitals sheet.
export const PROVIDERS: Provider[] = [
  {
    id: "bumrungrad",
    name: "Bumrungrad International Hospital",
    area: "Sukhumvit 3",
    distanceKm: 1.8,
  },
  { id: "samitivej", name: "Samitivej Sukhumvit Hospital", area: "Sukhumvit 49", distanceKm: 3.2 },
  { id: "bangkok", name: "Bangkok Hospital", area: "Phetchaburi Rd", distanceKm: 4.1 },
  { id: "bnh", name: "BNH Hospital", area: "Convent Rd, Silom", distanceKm: 4.9 },
  { id: "phyathai2", name: "Phyathai 2 Hospital", area: "Phahonyothin Rd", distanceKm: 6.3 },
  { id: "siriraj", name: "Siriraj Hospital", area: "Bangkok Noi", distanceKm: 8.7 },
];

export function providerName(id: string) {
  return PROVIDERS.find((p) => p.id === id)?.name ?? id;
}

export function mapsSearchUrl(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
