export type BudgetTier = 'backpacker' | 'moderate' | 'luxury' | 'ultra_luxe';
export type GroupType = 'solo' | 'couple' | 'family' | 'friends';
export type PaceType = 'relaxed' | 'balanced' | 'packed';
export type TimeSlot = 'morning' | 'afternoon' | 'evening' | 'night';
export type ActivityCategory =
  | 'culture'
  | 'food'
  | 'nature'
  | 'sightseeing'
  | 'relaxation'
  | 'adventure'
  | 'shopping'
  | 'transit';

export interface TransitInfo {
  mode: string;
  duration_minutes: number;
  guidance: string;
}

export interface Activity {
  id: string;
  time_slot: TimeSlot;
  title: string;
  description: string;
  location_name: string;
  latitude?: number | null;
  longitude?: number | null;
  estimated_duration_minutes: number;
  estimated_cost: number;
  currency: string;
  category: ActivityCategory;
  insider_tip?: string | null;
  booking_required: boolean;
  travel_to_next?: TransitInfo | null;
}

export interface DiningRecommendation {
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'cafe_or_bar';
  name: string;
  cuisine: string;
  neighborhood: string;
  price_level: string;
  must_try_dish: string;
  notes?: string | null;
}

export interface DayPlan {
  day_number: number;
  date?: string | null;
  theme: string;
  summary: string;
  activities: Activity[];
  recommended_dining: DiningRecommendation[];
  day_budget_estimate: number;
}

export interface LodgingRecommendation {
  name: string;
  neighborhood: string;
  style: string;
  price_per_night: string;
  why_stay_here: string;
}

export interface ItineraryResponse {
  id: string;
  title: string;
  destination: string;
  country: string;
  start_date?: string | null;
  end_date?: string | null;
  duration_days: number;
  traveler_count: number;
  tagline: string;
  overview: string;
  best_time_to_visit: string;
  weather_summary: string;
  local_customs_tips: string[];
  packing_essentials: string[];
  estimated_total_cost: number;
  currency: string;
  budget_breakdown: Record<string, number>;
  days: DayPlan[];
  lodging_suggestions: LodgingRecommendation[];
  created_at: string;
  is_generated_by_ai: boolean;
  provider_used?: string;
  is_demo_mode?: boolean;
  unverified_data_disclaimer?: string;
}

export interface TripRequest {
  destination: string;
  start_date?: string;
  end_date?: string;
  duration_days: number;
  budget_tier: BudgetTier;
  currency: string;
  travel_styles: string[];
  group_type: GroupType;
  traveler_count: number;
  pace: PaceType;
  accommodation_preference: string;
  dietary_preferences?: string[];
  accessibility_needs?: string;
  must_see_landmarks?: string[];
  additional_instructions?: string;
}

export interface SavedTripSummary {
  id: string;
  title: string;
  destination: string;
  country: string;
  start_date?: string | null;
  end_date?: string | null;
  duration_days: number;
  traveler_count?: number;
  estimated_total_cost: number;
  currency: string;
  created_at: string;
  updated_at: string;
}
