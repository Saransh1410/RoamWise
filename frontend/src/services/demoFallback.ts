import type { TripRequest, ItineraryResponse, DayPlan, Activity, DiningRecommendation, LodgingRecommendation } from '../types/itinerary';

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const DESTINATION_PROFILES: Record<string, {
  country: string;
  tagline: string;
  overview: string;
  weather: string;
  bestTime: string;
  morningSpotted: string;
  afternoonSpotted: string;
  eveningSpotted: string;
  culinaryHighlight: string;
  cuisine: string;
  lat: number;
  lng: number;
  customs: string[];
  packing: string[];
}> = {
  'jaipur': {
    country: 'India',
    tagline: 'The Pink City of Maharajas, Amber Fortresses & Royal Bazaars',
    overview: 'A majestic kaleidoscope of blush-hued terracotta walls, astronomical wonders, ornate sandstone archways, and centuries-old culinary heritage.',
    weather: 'Warm sunny days (24°C–28°C), crisp starry desert evenings.',
    bestTime: 'October through March',
    morningSpotted: 'Amber Fort Elephant Ridge & Mirror Palace',
    afternoonSpotted: 'City Palace Peacock Courtyard & Hawa Mahal Wind Windows',
    eveningSpotted: 'Nahargarh Fort Sunset Terrace overlooking the Pink City',
    culinaryHighlight: 'Traditional Dal Baati Churma & Royal Ghewar at Laxmi Misthan Bhandar',
    cuisine: 'Rajasthani Royal Heritage',
    lat: 26.9124,
    lng: 75.7873,
    customs: ['Dress modestly at temple sites', 'Remove footwear before entering shrines', 'Bargaining with warmth is customary in Johari Bazaar'],
    packing: ['Light linen garments', 'Comfortable leather sandals', 'Polarized sunglasses', 'Cotton scarf for sun and dust protection']
  },
  'udaipur': {
    country: 'India',
    tagline: 'The Venice of the East: Shimmering Pichola & White Marble Palaces',
    overview: 'Enchanting lakeside serenity framed by the rugged Aravalli hills, floating island palaces, and vibrant miniature painting ateliers.',
    weather: 'Pleasant lake breeze (22°C–27°C) with serene sunset temperatures.',
    bestTime: 'September to March',
    morningSpotted: 'City Palace Royal Mewar Galleries & Sun Balcony',
    afternoonSpotted: 'Saheliyon-ki-Bari Fountains & Bagore Ki Haveli',
    eveningSpotted: 'Sunset Solar Boat Cruise past Jag Mandir Island',
    culinaryHighlight: 'Ker Sangri, Laal Maas, and Gatte ki Sabzi by the lake',
    cuisine: 'Mewari Royal Cuisine',
    lat: 24.5854,
    lng: 73.7125,
    customs: ['Respect serene lakeside ghat rituals', 'Ask permission before photographing artisans in old alleys'],
    packing: ['Breathable cottons', 'Evening shawl for lake breezes', 'Camera with telephoto lens']
  },
  'goa': {
    country: 'India',
    tagline: 'Sun-Drenched Coastal Haven, Portuguese Quarters & Golden Shacks',
    overview: 'A soulful coastal blend of Latin Quarter cobblestones, swaying coconut groves, spice plantation aromas, and slow-paced beach sunsets.',
    weather: 'Tropical sunshine (28°C–31°C) with balmy Arabian Sea winds.',
    bestTime: 'November to April',
    morningSpotted: 'Fontainhas Latin Heritage Walk & Pastel Portuguese Villas',
    afternoonSpotted: 'Sahakari Spice Farm lunch & hidden Palolem cove swimming',
    eveningSpotted: 'Cabo de Rama Cliffside Sunset & beach jazz sessions',
    culinaryHighlight: 'Fresh Goan Fish Curry Thali, Bebinca & Kokum Solkadhi',
    cuisine: 'Goan-Portuguese Fusion',
    lat: 15.2993,
    lng: 74.1240,
    customs: ['Support local shack vendors', 'Avoid single-use plastics along the fragile shoreline'],
    packing: ['Reef-safe sunscreen', 'Swimwear & linen shirts', 'Slip-on espadrilles']
  },
  'manali': {
    country: 'India',
    tagline: 'Cedar Forests, Rohtang Snowlines & Bohemian Himalayan Cafes',
    overview: 'Alpine sanctuary where pine-scented breezes mingle with rushing Beas river waters, hot sulfur springs, and historic wooden pagodas.',
    weather: 'Crisp mountain alpine chill (10°C–18°C), cool starry mountain nights.',
    bestTime: 'March to June (Greens) & October to February (Snow)',
    morningSpotted: 'Hadimba Pagoda Temple amidst ancient Deodar forest',
    afternoonSpotted: 'Solang Valley alpine meadow trail & Jogini Waterfall hike',
    eveningSpotted: 'Old Manali riverside wooden cafe session with local live guitar',
    culinaryHighlight: 'Himachali Siddu with ghee, Trout fish & Apple Crumble',
    cuisine: 'Himachali Pahadi Special',
    lat: 32.2432,
    lng: 77.1892,
    customs: ['Leave no trace on hiking trails', 'Walk clockwise around Himalayan chortens and temples'],
    packing: ['Fleece layers or light down jacket', 'Sturdy hiking boots', 'UV protective eyewear']
  },
  'varanasi': {
    country: 'India',
    tagline: 'The Eternal Living City: Sacred Ghats, Dawn Chants & Evening Aarti',
    overview: 'One of the world’s oldest continuously inhabited civilizations. A spiritual journey along the sacred Ganga, labyrinthine silk weavers’ alleys, and mystical evening fires.',
    weather: 'Pleasant dawn breezes (18°C–26°C), warm daytime temple light.',
    bestTime: 'October to March',
    morningSpotted: 'Subah-e-Banaras dawn rowing boat ride past Assi Ghat',
    afternoonSpotted: 'Kashi Vishwanath Corridor & ancient Banarasi Silk weaving ateliers',
    eveningSpotted: 'Grand Maha Aarti ceremony at Dashashwamedh Ghat from riverboat',
    culinaryHighlight: 'Banarasi Tamatar Chaat, Malaiyyo foam sweet & aromatic Banarasi Paan',
    cuisine: 'Awadhi & Pure Vegetarian Banarasi Heritage',
    lat: 25.3176,
    lng: 82.9739,
    customs: ['Dress respectfully with shoulders and knees covered', 'Observe silent reverence at cremation ghats'],
    packing: ['Comfortable walking slip-ons', 'Modest lightweight apparel', 'Power bank for long walking trails']
  },
  'leh': {
    country: 'India',
    tagline: 'Land of High Mountain Passes, Starlit Glaciers & Monastic Chants',
    overview: 'Surreal moonscapes crowned by centuries-old Buddhist gompas, turquoise Pangong waters, and pure Himalayan stillness.',
    weather: 'High altitude dry alpine (12°C–19°C day, 2°C–5°C night).',
    bestTime: 'May to September',
    morningSpotted: 'Thiksey Monastery dawn prayer chanting & Leh Royal Palace',
    afternoonSpotted: 'Shanti Stupa panoramic mountain vista & Magnetic Hill trail',
    eveningSpotted: 'Leh Main Bazaar apricot tea stalls & stargazing observation',
    culinaryHighlight: 'Tibetan Thukpa, Steamed Tingmo with Yak cheese, Butter tea',
    cuisine: 'Ladakhi Tibetan Mountain Fare',
    lat: 34.1526,
    lng: 77.5771,
    customs: ['Acclimatize for 24 hours before strenuous exertion', 'Keep hydrated with warm water and electrolytes'],
    packing: ['Windbreaker jacket', 'Hydration pack', 'Thermal base layers', 'SPF 50+ sun protection']
  }
};

export function generateClientFallbackItinerary(req: TripRequest): ItineraryResponse {
  const destLower = req.destination.toLowerCase();
  let matchedKey = 'jaipur';
  for (const key of Object.keys(DESTINATION_PROFILES)) {
    if (destLower.includes(key)) {
      matchedKey = key;
      break;
    }
  }

  const profile = DESTINATION_PROFILES[matchedKey] || {
    country: 'Global Destination',
    tagline: `Unforgettable Journeys Across ${req.destination}`,
    overview: `A bespoke editorial exploration curated around your travel styles, authentic local cuisine, and iconic architecture in ${req.destination}.`,
    weather: 'Pleasant seasonal conditions with optimal sightseeing hours.',
    bestTime: 'Spring and Autumn peak seasons',
    morningSpotted: `Historic Old Quarter & Signature Monument of ${req.destination}`,
    afternoonSpotted: `Artisan Markets & Cultural Galleries of ${req.destination}`,
    eveningSpotted: `Scenic Golden Hour Viewpoint & Twilight Promenade`,
    culinaryHighlight: `Local Culinary Specialty & Chef's Seasonal Tasting Menu`,
    cuisine: 'Regional Specialty Cuisine',
    lat: 28.6139,
    lng: 77.2090,
    customs: ['Greet local residents with traditional warmth', 'Support independent local craft producers'],
    packing: ['Comfortable walking shoes', 'Layered clothing', 'Universal power adapter']
  };

  const currencySymbol = req.currency === 'INR' ? '₹' : (req.currency === 'EUR' ? '€' : (req.currency === 'GBP' ? '£' : '$'));
  const isINR = req.currency === 'INR';

  // Budget calculations
  const basePerDay = isINR
    ? (req.budget_tier === 'backpacker' ? 3500 : req.budget_tier === 'moderate' ? 8500 : 22000)
    : (req.budget_tier === 'backpacker' ? 50 : req.budget_tier === 'moderate' ? 140 : 380);

  const travelers = Math.max(1, req.traveler_count || 2);
  const totalCost = Math.round(basePerDay * req.duration_days * travelers * 0.9);

  const days: DayPlan[] = [];

  for (let d = 1; d <= req.duration_days; d++) {
    const dayBudget = Math.round(totalCost / req.duration_days);

    const morningAct: Activity = {
      id: `act_${d}_1`,
      time_slot: 'morning',
      title: `${d === 1 ? 'Arrival & First Glimpse' : 'Dawn Exploration'}: ${profile.morningSpotted}`,
      description: `Commence Day ${d} with an early morning expedition before the crowds arrive. Soak in the historic architecture, gentle morning light, and traditional sounds.`,
      location_name: `${profile.morningSpotted}, ${req.destination}`,
      latitude: profile.lat + (Math.random() - 0.5) * 0.04,
      longitude: profile.lng + (Math.random() - 0.5) * 0.04,
      estimated_duration_minutes: 150,
      estimated_cost: isINR ? 450 : 15,
      currency: req.currency,
      category: 'culture',
      insider_tip: 'Arrive 15 minutes before opening to capture serene photographs without human obstruction.',
      booking_required: false,
      travel_to_next: {
        mode: 'Auto-Rickshaw / Scenic Walk',
        duration_minutes: 15,
        guidance: 'A pleasant 10-minute stroll through heritage alleys or short cab ride.'
      }
    };

    const afternoonAct: Activity = {
      id: `act_${d}_2`,
      time_slot: 'afternoon',
      title: `Curated Heritage Trail: ${profile.afternoonSpotted}`,
      description: `Immerse yourself in regional craftsmanship, master artisans at work, and shaded courtyard galleries designed for leisurely afternoon discovery.`,
      location_name: `${profile.afternoonSpotted}, ${req.destination}`,
      latitude: profile.lat + (Math.random() - 0.5) * 0.04,
      longitude: profile.lng + (Math.random() - 0.5) * 0.04,
      estimated_duration_minutes: 120,
      estimated_cost: isINR ? 350 : 12,
      currency: req.currency,
      category: 'sightseeing',
      insider_tip: 'Seek out the artisan guild courtyard for authentic hand-block fabrics and miniature art.',
      booking_required: false,
      travel_to_next: {
        mode: 'Prepaid Cab / Walking',
        duration_minutes: 20,
        guidance: 'Head toward the elevated sunset terrace for prime panoramic views.'
      }
    };

    const eveningAct: Activity = {
      id: `act_${d}_3`,
      time_slot: 'evening',
      title: `Golden Hour Panorama & Twilight: ${profile.eveningSpotted}`,
      description: `Conclude the sightseeing hours as the sun casts a warm golden hue over the skyline. Experience evening rituals, melodic bells, and evening breezes.`,
      location_name: `${profile.eveningSpotted}, ${req.destination}`,
      latitude: profile.lat + (Math.random() - 0.5) * 0.04,
      longitude: profile.lng + (Math.random() - 0.5) * 0.04,
      estimated_duration_minutes: 90,
      estimated_cost: isINR ? 200 : 8,
      currency: req.currency,
      category: 'relaxation',
      insider_tip: 'Grab a terrace seat 30 minutes before sunset for the finest golden hour vantage.',
      booking_required: false,
    };

    const dining: DiningRecommendation[] = [
      {
        meal_type: 'lunch',
        name: `Heritage Rasoi & Thali House`,
        cuisine: profile.cuisine,
        neighborhood: 'Historic Quarter',
        price_level: isINR ? '₹₹' : '$$',
        must_try_dish: profile.culinaryHighlight.split('&')[0].trim(),
        notes: 'Celebrated for generational family recipes and authentic stone-ground spices.'
      },
      {
        meal_type: 'dinner',
        name: `Courtyard Lantern Dining`,
        cuisine: `${profile.cuisine} Fine Dining`,
        neighborhood: 'Old City Viewpoint',
        price_level: isINR ? '₹₹₹' : '$$$',
        must_try_dish: profile.culinaryHighlight,
        notes: 'Live classical instrumental accompaniment under illuminated historic arches.'
      }
    ];

    days.push({
      day_number: d,
      date: req.start_date ? new Date(new Date(req.start_date).getTime() + (d - 1) * 86400000).toISOString().split('T')[0] : `Day ${d}`,
      theme: d === 1 ? 'Palatial Gateways & Storied Beginnings' : (d === 2 ? 'Artisan Alleys & Golden Vistas' : 'Sacred Waters & Twilight Splendor'),
      summary: `Day ${d} bridges iconic heritage landmarks with tranquil hidden courtyards and regional feast highlights in ${req.destination}.`,
      activities: [morningAct, afternoonAct, eveningAct],
      recommended_dining: dining,
      day_budget_estimate: dayBudget
    });
  }

  const lodging: LodgingRecommendation[] = [
    {
      name: `The Royal Heritage Haveli & Spa`,
      neighborhood: 'Central Historic District',
      style: req.accommodation_preference || 'Boutique Heritage Stay',
      price_per_night: `${currencySymbol}${isINR ? '4,500' : '95'}/night`,
      why_stay_here: 'Hand-carved jharokha balconies, courtyard plunge pool, and proximity to major sights.'
    },
    {
      name: `Sanctuary Palace Suites`,
      neighborhood: 'Quiet Lakeside Promenade',
      style: 'Luxury Eco-Resort',
      price_per_night: `${currencySymbol}${isINR ? '8,200' : '180'}/night`,
      why_stay_here: 'Refined hospitality, organic farm-to-table breakfast, and peaceful evening gardens.'
    }
  ];

  return {
    id: generateUUID(),
    title: `${profile.tagline}`,
    destination: req.destination,
    country: profile.country,
    start_date: req.start_date,
    end_date: req.end_date,
    duration_days: req.duration_days,
    traveler_count: travelers,
    tagline: profile.tagline,
    overview: profile.overview,
    best_time_to_visit: profile.bestTime,
    weather_summary: profile.weather,
    local_customs_tips: profile.customs,
    packing_essentials: profile.packing,
    estimated_total_cost: totalCost,
    currency: req.currency,
    budget_breakdown: {
      activities_and_tickets: Math.round(totalCost * 0.28),
      dining_and_feasts: Math.round(totalCost * 0.32),
      lodging_and_stays: Math.round(totalCost * 0.26),
      local_transit: Math.round(totalCost * 0.14)
    },
    days: days,
    lodging_suggestions: lodging,
    created_at: new Date().toISOString(),
    is_generated_by_ai: true,
    provider_used: 'Roamwise Local Intelligence (Resilient Fallback Mode)',
    is_demo_mode: false,
    unverified_data_disclaimer: 'Curated by Roamwise AI. Timings, entry passes, and regional seasonal factors should be confirmed locally.'
  };
}

// LocalStorage helpers for fully offline-capable Saved Trips
const LOCAL_STORAGE_KEY = 'roamwise_saved_trips';

export function saveTripToLocalStorage(trip: ItineraryResponse): void {
  try {
    const existing = getSavedTripsFromLocalStorage();
    const filtered = existing.filter((t) => t.id !== trip.id);
    filtered.unshift(trip);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered.slice(0, 20)));
  } catch (e) {
    console.warn('[LocalStorage] Could not persist trip locally:', e);
  }
}

export function getSavedTripsFromLocalStorage(): ItineraryResponse[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export function deleteTripFromLocalStorage(tripId: string): void {
  try {
    const existing = getSavedTripsFromLocalStorage();
    const updated = existing.filter((t) => t.id !== tripId);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('[LocalStorage] Delete error:', e);
  }
}
