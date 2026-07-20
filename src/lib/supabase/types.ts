// Hand-written row types matching supabase/migrations/0001_init.sql.
// (Not generated via `supabase gen types` since there's no live project to
// connect to yet — once Supabase keys are added, consider regenerating these
// with the Supabase CLI for full accuracy.)

export type UserRole = "user" | "guide" | "admin" | "driver"

export interface ProfileRow {
  id: string
  full_name: string | null
  avatar_url: string | null
  role: UserRole
  created_at: string
  updated_at: string
}

export interface CityTier {
  category: string
  amount: string
}

export interface CitySeason {
  name: string
  temp: string
  vibe: string
}

export interface CityDistrict {
  id: string
  name: string
  description: string
  category: string
}

export interface CityRow {
  id: string
  slug: string | null
  name: string
  hero_image: string | null
  teaser: string | null
  introduction: string | null
  history: { text: string; imageUrl: string }
  culture: { text: string; imageUrl: string }
  expenses: { text: string; imageUrl: string; tiers?: CityTier[] }
  climate: { text: string; imageUrl: string; seasons?: CitySeason[] }
  districts: { mapUrl: string; list: CityDistrict[] }
  getting_around: string | null
  vibe: { text: string; imageUrl: string }
  published: boolean
  order_index: number
  created_by: string | null
  created_at: string
  updated_at: string
}

export type HackCategory =
  | "Food"
  | "Transport"
  | "Money"
  | "Logistics"
  | "Etiquette"
  | "Tourist Trap"

export interface HackStepRow {
  step: number
  title: string
  text: string
}

export interface HackRow {
  id: string
  title: string
  category: HackCategory
  summary: string | null
  steps: HackStepRow[]
  pro_tip: string | null
  cover_image: string | null
  related_ids: string[]
  trap_alternative: string | null
  published: boolean
  order_index: number
  created_by: string | null
  created_at: string
  updated_at: string
}

export type PlaceCategory =
  | "things_to_do"
  | "places_to_eat"
  | "nightlife"
  | "shopping"
  | "day_trip"

export interface PlaceRow {
  id: string
  city_id: string
  slug: string
  name: string
  category: PlaceCategory
  subcategory: string | null
  neighborhood: string | null
  lat: number | null
  lng: number | null
  address: string | null
  cover_image: string | null
  gallery: string[]
  short_desc: string | null
  long_desc: string | null
  price_band: number | null
  hours: Record<string, string>
  booking_url: string | null
  google_place_id: string | null
  tags: string[]
  is_hidden_gem: boolean
  published: boolean
  order_index: number
  created_at: string
  updated_at: string
}

export interface PlaceRecommendationRow {
  id: string
  place_id: string
  guide_id: string
  quote: string
  created_at: string
}

export type PostType = "article" | "hack" | "guide_story"

export interface PostRow {
  id: string
  slug: string
  type: PostType
  title: string
  excerpt: string | null
  cover_image: string | null
  body_md: string | null
  steps: HackStepRow[]
  pro_tip: string | null
  trap_alternative: string | null
  category: string | null
  tags: string[]
  city_id: string | null
  author_guide_id: string | null
  read_minutes: number | null
  related_ids: string[]
  published: boolean
  published_at: string | null
  order_index: number
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface GuideRow {
  id: string
  legacy_id: string | null
  profile_id: string | null
  name: string
  location: string | null
  tags: string[]
  rating: number
  review_count: number
  price: number | null
  bio: string | null
  is_verified: boolean
  is_active: boolean
  image: string | null
  image_public_id: string | null
  video_url: string | null
  created_at: string
  updated_at: string
}

export interface PhraseRow {
  id: string
  japanese: string
  romaji: string
  english: string
  context?: string
  // Cloudinary URL of a pre-generated VOICEVOX recording for `japanese`,
  // created once from the admin "Phrases" form (see
  // /api/admin/learn/generate-audio). When present, playback uses this
  // natural-sounding clip instead of the browser's robotic speechSynthesis.
  audio_url?: string | null
}

export type MessageType = "message" | "booking"
export type MessageStatus = "new" | "read"

export interface MessageRow {
  id: string
  guide_id: string
  sender_id: string
  type: MessageType
  body: string | null
  trip_date: string | null
  interest: string | null
  status: MessageStatus
  created_at: string
}

export interface ItineraryRow {
  id: string
  owner_id: string
  title: string
  items: import("@/components/planner/Timeline").ItemType[]
  settings: Record<string, unknown> | null
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface PhraseCollectionRow {
  id: string
  title: string
  description: string | null
  cover_image: string | null
  phrases: PhraseRow[]
  order_index: number
  published: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

// ───────────────────────────── transfers / drivers / flights ─────────────────────────────
// Matches supabase/migrations/0005_transfers.sql.

export type DriverVerificationStatus = "pending" | "approved" | "rejected"

export interface DriverRow {
  id: string
  full_name: string
  phone: string
  license_number: string
  vehicle_make: string
  vehicle_model: string
  vehicle_plate: string
  id_document_url: string | null
  license_document_url: string | null
  vehicle_document_url: string | null
  verification_status: DriverVerificationStatus
  is_available: boolean
  created_at: string
  updated_at: string
}

export interface VehicleOptionRow {
  id: string
  name: string
  description: string | null
  capacity: number
  price: number
  currency: string
  image: string | null
  order_index: number
  is_active: boolean
  // Distance-based rate card, added in 0006_transfer_route_pricing.sql — see
  // src/lib/transfers/pricing.ts for how these combine with transfer_zones /
  // route_prices to produce an actual quote. `price` above is kept as the
  // flat starting price shown before a destination is picked, and as the
  // last-resort fallback for destinations with no zone match at all.
  base_fare: number
  price_per_km: number
  created_at: string
  updated_at: string
}

export interface TransferZoneRow {
  id: string
  airport_code: string
  label: string
  distance_km: number
  is_active: boolean
  order_index: number
  created_at: string
  updated_at: string
}

export interface RoutePriceRow {
  id: string
  zone_id: string
  vehicle_option_id: string
  price: number
  currency: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export type PricingSource = "route_table" | "formula" | "vehicle_flat"

export type FlightDirection = "arrival" | "departure"

export type BookingStatus =
  | "pending_payment"
  | "confirmed"
  | "assigned"
  | "en_route"
  | "arrived"
  | "picked_up"
  | "completed"
  | "cancelled"

export interface BookingRow {
  id: string
  trip_code: string
  user_id: string | null
  guest_name: string
  guest_email: string
  guest_phone: string
  flight_number: string
  flight_direction: FlightDirection
  pickup_datetime: string
  pickup_location: string
  dropoff_location: string
  vehicle_option_id: string
  price: number
  currency: string
  status: BookingStatus
  driver_id: string | null
  notes: string | null
  // Added in 0006_transfer_route_pricing.sql.
  zone_id: string | null
  distance_km: number | null
  pricing_source: PricingSource
  created_at: string
  updated_at: string
}

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded"

export interface PaymentRow {
  id: string
  booking_id: string
  amount: number
  currency: string
  provider: string
  status: PaymentStatus
  reference: string | null
  created_at: string
  updated_at: string
}

export interface FlightDealRow {
  id: string
  origin_city: string
  origin_code: string | null
  destination_city: string
  destination_code: string | null
  airline: string | null
  price: number
  currency: string
  depart_date: string | null
  return_date: string | null
  deal_url: string
  source: string | null
  is_active: boolean
  order_index: number
  created_by: string | null
  created_at: string
  updated_at: string
}
