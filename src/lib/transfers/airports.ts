// Japan airports the transfer service currently supports. Plain data, no
// "server-only" import — this needs to be usable from client components
// (the booking form's airport select) as well as server code
// (src/lib/flights/provider.ts re-exports AIRPORT_NAMES from here for
// airportLabel(), used server-side when linking a flight deal to /transfer).
export const AIRPORT_NAMES: Record<string, string> = {
  NRT: "Narita International Airport (NRT)",
  HND: "Haneda Airport (HND)",
  KIX: "Kansai International Airport (KIX)",
  ITM: "Osaka Itami Airport (ITM)",
  NGO: "Chubu Centrair International Airport (NGO)",
  FUK: "Fukuoka Airport (FUK)",
  CTS: "New Chitose Airport (CTS)",
}

export const AIRPORTS: { code: string; label: string }[] = Object.entries(AIRPORT_NAMES).map(
  ([code, label]) => ({ code, label })
)

// Approximate lat/lng for each supported airport. Used only to draw the
// pickup pin and origin of the route line on the /transfer map — the price
// itself never depends on these (it comes from the curated transfer_zones,
// see src/lib/transfers/pricing.ts). Plain data, no "server-only", so the
// client-side map/form can read it directly.
export const AIRPORT_COORDS: Record<string, { lat: number; lng: number }> = {
  NRT: { lat: 35.7719, lng: 140.3929 },
  HND: { lat: 35.5494, lng: 139.7798 },
  KIX: { lat: 34.4342, lng: 135.244 },
  ITM: { lat: 34.7855, lng: 135.438 },
  NGO: { lat: 34.8584, lng: 136.8054 },
  FUK: { lat: 33.5859, lng: 130.45 },
  CTS: { lat: 42.7752, lng: 141.6923 },
}
