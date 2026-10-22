import React, { useState, useEffect } from 'react';
import type { TripRequest, BudgetTier, GroupType, PaceType, ItineraryResponse } from '../types/itinerary';
import { apiService } from '../services/api';
import confetti from 'canvas-confetti';
import {
  Compass,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Palmtree,
  UtensilsCrossed,
  Landmark,
  Camera,
  Mountain,
  Search,
  Calendar,
  Users,
  AlertCircle,
  MessageSquare,
  Coins,
  Heart,
  MapPin,
  Accessibility,
} from 'lucide-react';

interface TripWizardProps {
  onTripGenerated: (trip: ItineraryResponse) => void;
  initialDestination?: string;
  initialDuration?: number;
  initialStyle?: string;
}

const QUICK_PICK_DESTINATIONS = [
  { name: 'Jaipur, Rajasthan', region: 'India', highlight: 'Amber Fort & Royal Havelis' },
  { name: 'Udaipur, Rajasthan', region: 'India', highlight: 'Lake Pichola & Marble Palaces' },
  { name: 'Manali, Himachal', region: 'India', highlight: 'Alpine Pines & Solang Valley' },
  { name: 'South Goa & Palolem', region: 'India', highlight: 'Latin Quarters & Beach Shacks' },
  { name: 'Varanasi, Uttar Pradesh', region: 'India', highlight: 'Ganga Dawn Rowing & Aarti' },
  { name: 'Leh Ladakh', region: 'India', highlight: 'High Mountain Passes & Monasteries' },
  { name: 'Munnar & Alleppey', region: 'India', highlight: 'Misty Tea Hills & Backwaters' },
  { name: 'Kyoto, Japan', region: 'Japan', highlight: 'Zen Temples & Bamboo Groves' },
  { name: 'Rome, Italy', region: 'Italy', highlight: 'Baroque Piazzas & Roman Colosseum' },
];

const TRAVEL_STYLES = [
  { id: 'cultural', label: 'Cultural & Heritage', icon: Landmark, desc: 'Forts, palaces, museums & architecture' },
  { id: 'culinary', label: 'Food & Culinary Trails', icon: UtensilsCrossed, desc: 'Generational thalis, street eats & dining' },
  { id: 'nature', label: 'Nature & Solitude', icon: Mountain, desc: 'Alpine peaks, tea valleys & vistas' },
  { id: 'relaxed', label: 'Relaxed & Wellness', icon: Palmtree, desc: 'Ayurveda, lake breezes & quiet cafes' },
  { id: 'photography', label: 'Photography & Golden Hour', icon: Camera, desc: 'Scenic viewpoints, dawn light & crafts' },
  { id: 'adventure', label: 'Adventure & Trails', icon: Compass, desc: 'Hikes, high passes, river rafting' },
  { id: 'romantic', label: 'Romantic & Scenic', icon: Heart, desc: 'Sunset boats, heritage candlelit courtyards' },
  { id: 'budget_friendly', label: 'Smart Explorer (Budget)', icon: Coins, desc: 'Hidden gems, local transit & budget eats' },
  { id: 'hidden_gems', label: 'Offbeat & Hidden Secrets', icon: Sparkles, desc: 'Artisan alleys, private studios & secrets' },
];

const CORE_INTERESTS = [
  'Royal Forts & Palaces',
  'Street Food & Regional Thalis',
  'Artisan Craft Bazaars',
  'Dawn Ghats & Sacred Aarti',
  'Scenic Mountain Hikes',
  'Historic Architecture Walks',
  'Tea & Coffee Estates',
  'Sunset Viewpoints',
  'Ayurvedic Spas & Yoga',
  'Wildlife & Bird Sanctuaries',
];

const ACCOMMODATIONS = [
  { id: 'boutique_hotel', label: 'Heritage Haveli / Boutique Stay', desc: 'Carved balconies, courtyard ambiance & character' },
  { id: 'luxury_resort', label: '5-Star Luxury Palace / Resort', desc: 'World-class hospitality, royal spa & fine dining' },
  { id: 'mountain_resort', label: 'Nature Lodge & Eco-Resort', desc: 'Pine forests, river views & organic breakfast' },
  { id: 'traditional_guesthouse', label: 'Traditional Homestay / Ryokan', desc: 'Warm local hosts, homemade regional meals' },
  { id: 'budget_hostel', label: 'Design Social Hostel / Pods', desc: 'Vibrant travelers community & budget friendly' },
];

const DIETARY_OPTIONS = [
  'No Restrictions',
  'Pure Vegetarian (No Meat/Fish/Eggs)',
  'Jain (No Root Veg / Onion / Garlic)',
  'Halal Certified',
  'Vegan (Plant-Based Only)',
  'Gluten-Free / Celiac Safe',
];

export const TripWizard: React.FC<TripWizardProps> = ({
  onTripGenerated,
  initialDestination,
  initialDuration,
  initialStyle,
}) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [dateError, setDateError] = useState('');

  // Form State: Pre-filled with Jaipur, Rajasthan so it is never blank
  const [destination, setDestination] = useState(initialDestination || 'Jaipur, Rajasthan');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [durationDays, setDurationDays] = useState(initialDuration || 4);
  const [groupType, setGroupType] = useState<GroupType>('couple');
  const [travelerCount, setTravelerCount] = useState(2);
  const [budgetTier, setBudgetTier] = useState<BudgetTier>('moderate');
  const [currency, setCurrency] = useState('INR'); // Default to INR
  const [selectedStyles, setSelectedStyles] = useState<string[]>([initialStyle || 'cultural', 'culinary']);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    'Royal Forts & Palaces',
    'Street Food & Regional Thalis',
  ]);
  const [pace, setPace] = useState<PaceType>('balanced');
  const [accommodationPreference, setAccommodationPreference] = useState('boutique_hotel');
  const [dietary, setDietary] = useState<string>('Pure Vegetarian (No Meat/Fish/Eggs)');
  const [accessibility, setAccessibility] = useState<string>('');
  const [additionalInstructions, setAdditionalInstructions] = useState<string>('');

  // Sync initial props if changed
  useEffect(() => {
    if (initialDestination) setDestination(initialDestination);
    if (initialDuration) setDurationDays(initialDuration);
    if (initialStyle && !selectedStyles.includes(initialStyle)) {
      setSelectedStyles((prev) => [...prev, initialStyle]);
    }
  }, [initialDestination, initialDuration, initialStyle]);

  // Synchronize duration when start and end dates change
  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (end < start) {
        setDateError('End date must be on or after start date.');
      } else {
        setDateError('');
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        setDurationDays(Math.max(1, Math.min(diffDays, 14)));
      }
    }
  }, [startDate, endDate]);

  const loadingMessages = [
    `Synthesizing cultural trails and heritage forts for ${destination}...`,
    'Selecting authentic regional food stops, generational thalis & cafes...',
    'Calculating category budgets in INR, transit guidance & timing...',
    'Curating sunset viewpoints, golden hour panoramas & local stays...',
    'Assembling your bespoke Roamwise edition...',
  ];

  const handleToggleStyle = (id: string) => {
    if (selectedStyles.includes(id)) {
      if (selectedStyles.length > 1) {
        setSelectedStyles(selectedStyles.filter((s) => s !== id));
      }
    } else {
      setSelectedStyles([...selectedStyles, id]);
    }
  };

  const handleToggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((item) => item !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleNext = () => {
    if (step === 1 && !destination.trim()) {
      setErrorMessage('Please select or enter a destination.');
      return;
    }
    if (step === 1 && dateError) {
      setErrorMessage('Please fix your selected travel dates.');
      return;
    }
    setErrorMessage('');
    setStep((prev) => Math.min(prev + 1, 3));
    window.scrollTo({ top: 200, behavior: 'smooth' });
  };

  const handleBack = () => {
    setErrorMessage('');
    setStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 200, behavior: 'smooth' });
  };

  const handleGenerate = async () => {
    setIsSubmitting(true);
    setErrorMessage('');
    setLoadingPhase(0);

    const interval = setInterval(() => {
      setLoadingPhase((prev) => (prev + 1) % loadingMessages.length);
    }, 2800);

    try {
      const payload: TripRequest = {
        destination,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        duration_days: durationDays,
        budget_tier: budgetTier,
        currency,
        travel_styles: selectedStyles,
        group_type: groupType,
        traveler_count: travelerCount,
        pace,
        accommodation_preference: accommodationPreference,
        dietary_preferences: dietary ? [dietary] : undefined,
        accessibility_needs: accessibility || undefined,
        must_see_landmarks: selectedInterests,
        additional_instructions: additionalInstructions || undefined,
      };

      const result = await apiService.generateItinerary(payload);

      try {
        confetti({
          particleCount: 75,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#047857', '#D97706', '#0F172A', '#F59E0B'],
        });
      } catch (_) {}

      onTripGenerated(result);
    } catch (err: any) {
      console.error('Generation error:', err);
      setErrorMessage(err.message || 'Itinerary generation encountered an issue. Please retry.');
    } finally {
      clearInterval(interval);
      setIsSubmitting(false);
    }
  };

  if (isSubmitting) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 text-center">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-10 sm:p-14 shadow-xl space-y-8">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-emerald-100 animate-ping opacity-25" />
            <div className="w-20 h-20 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin flex items-center justify-center">
              <Compass className="w-8 h-8 text-emerald-700 animate-pulse" />
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
              Crafting {destination}
            </h3>
            <p className="text-sm sm:text-base text-slate-600 font-sans min-h-[48px] transition-all">
              {loadingMessages[loadingPhase]}
            </p>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-600 via-amber-500 to-emerald-700 h-full transition-all duration-500"
              style={{ width: `${((loadingPhase + 1) / loadingMessages.length) * 100}%` }}
            />
          </div>

          <p className="text-xs text-slate-400">
            Powered by Groq High-Throughput Engine • Curating custom daily schedules & budgets
          </p>
        </div>
      </div>
    );
  }

  return (
    <div id="planner-wizard" className="max-w-4xl mx-auto py-10 px-4 sm:px-6">
      {/* Wizard Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Interactive 3-Step Journey Builder</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
          Curate Your Bespoke Itinerary
        </h1>
        <p className="text-sm text-slate-600 mt-2 max-w-xl mx-auto">
          Tailored daily schedules, verified regional culinary feasts, authentic stays, and transparent budgets.
        </p>

        {/* Step Indicator Progress Bar */}
        <div className="flex items-center justify-center gap-3 mt-6">
          {[
            { num: 1, label: 'Basics' },
            { num: 2, label: 'Vibe & Interests' },
            { num: 3, label: 'Logistics & Food' },
          ].map((s) => (
            <div key={s.num} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  s.num === step
                    ? 'bg-slate-900 text-amber-300 ring-2 ring-slate-900/20'
                    : s.num < step
                    ? 'bg-emerald-700 text-white'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {s.num < step ? <Check className="w-4 h-4" /> : s.num}
              </div>
              <span
                className={`text-xs font-medium hidden sm:inline ${
                  s.num === step ? 'text-slate-900 font-bold' : 'text-slate-400'
                }`}
              >
                {s.label}
              </span>
              {s.num < 3 && <div className="w-8 h-0.5 bg-slate-200 hidden sm:block" />}
            </div>
          ))}
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-sm text-rose-800 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Wizard Form Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-sm transition-all">
        {/* ================= STEP 1: BASICS ================= */}
        {step === 1 && (
          <div className="space-y-8 animate-fadeIn">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded">
                Step 01 / 03 • Journey Foundations
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
                Where & When are you traveling?
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Enter any destination worldwide or pick from our curated India highlights.
              </p>
            </div>

            {/* Destination Search Input */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Destination City / Region
              </label>
              <div className="relative">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. Jaipur, Rajasthan, or Manali, Goa, Varanasi, Kyoto..."
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-base font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-colors"
                />
              </div>
            </div>

            {/* Quick Pick Chips */}
            <div className="space-y-2.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                Quick-Pick Popular Destinations
              </label>
              <div className="flex flex-wrap gap-2">
                {QUICK_PICK_DESTINATIONS.map((dest) => {
                  const isSelected = destination === dest.name;
                  return (
                    <button
                      key={dest.name}
                      type="button"
                      onClick={() => setDestination(dest.name)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-slate-900 text-amber-300 border-slate-900 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <MapPin className="w-3 h-3 text-emerald-600" />
                      <span>{dest.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Travel Dates & Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Start Date (Optional)</span>
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full py-2.5 px-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                  <span>End Date (Optional)</span>
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full py-2.5 px-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              {dateError && (
                <div className="sm:col-span-2 text-xs text-rose-600 font-medium">
                  {dateError}
                </div>
              )}

              {/* Duration Slider / Counter */}
              <div className="sm:col-span-2 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase text-slate-700">Trip Duration</span>
                  <p className="text-xs text-slate-500">
                    {durationDays} Days / {Math.max(1, durationDays - 1)} Nights
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setDurationDays((prev) => Math.max(1, prev - 1))}
                    className="w-8 h-8 rounded-lg bg-white border border-slate-200 font-bold text-slate-700 hover:bg-slate-100 flex items-center justify-center"
                  >
                    -
                  </button>
                  <span className="w-10 text-center font-bold text-base text-slate-900">
                    {durationDays}d
                  </span>
                  <button
                    type="button"
                    onClick={() => setDurationDays((prev) => Math.min(14, prev + 1))}
                    className="w-8 h-8 rounded-lg bg-white border border-slate-200 font-bold text-slate-700 hover:bg-slate-100 flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Group Type & Traveler Count */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Traveler Group
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'solo', label: 'Solo Explorer' },
                    { id: 'couple', label: 'Couple / Duo' },
                    { id: 'family', label: 'Family Holiday' },
                    { id: 'friends', label: 'Friends Squad' },
                  ].map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => {
                        setGroupType(g.id as GroupType);
                        if (g.id === 'solo') setTravelerCount(1);
                        if (g.id === 'couple' && travelerCount < 2) setTravelerCount(2);
                      }}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-center ${
                        groupType === g.id
                          ? 'bg-emerald-50 border-emerald-700 text-emerald-900 shadow-sm'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Number of Travelers
                </label>
                <div className="flex items-center gap-3 py-2">
                  <Users className="w-5 h-5 text-slate-400 shrink-0" />
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={travelerCount}
                    onChange={(e) => setTravelerCount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 2: VIBE & INTERESTS ================= */}
        {step === 2 && (
          <div className="space-y-8 animate-fadeIn">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded">
                Step 02 / 03 • Atmosphere & Themes
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
                What is your journey's vibe?
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Select your core travel styles and specific interests. Safe icon fallbacks guaranteed.
              </p>
            </div>

            {/* Travel Styles Grid with Safe Lucide Icons */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Travel Styles (Select at least 1)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {TRAVEL_STYLES.map((style) => {
                  const Icon = style.icon;
                  const isSelected = selectedStyles.includes(style.id);
                  return (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => handleToggleStyle(style.id)}
                      className={`text-left p-4 rounded-2xl border transition-all flex items-start gap-3 ${
                        isSelected
                          ? 'bg-emerald-50/70 border-emerald-600 ring-2 ring-emerald-600/20 shadow-sm'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div
                        className={`p-2 rounded-xl shrink-0 ${
                          isSelected ? 'bg-emerald-700 text-amber-300' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {/* Safe Icon Fallback to prevent React runtime Error #130 */}
                        {Icon ? <Icon className="w-5 h-5" /> : <Compass className="w-5 h-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-slate-900 truncate">{style.label}</h4>
                          {isSelected && <Check className="w-4 h-4 text-emerald-700 shrink-0" />}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug line-clamp-2">
                          {style.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Core Interests Multi-Select Chips */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Core Interests & Experiences to Highlight
              </label>
              <div className="flex flex-wrap gap-2">
                {CORE_INTERESTS.map((interest) => {
                  const isChecked = selectedInterests.includes(interest);
                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => handleToggleInterest(interest)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all border ${
                        isChecked
                          ? 'bg-slate-900 text-amber-300 border-slate-900 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {isChecked ? '✓ ' : '+ '}
                      {interest}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Pacing Preference */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Pacing & Daily Rhythm
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'relaxed', label: 'Relaxed & Mindful', desc: '1–2 deep sights per day, long chai/cafe breaks' },
                  { id: 'balanced', label: 'Balanced Explorer', desc: 'Morning & afternoon highlights, golden hour rest' },
                  { id: 'packed', label: 'Fast & Immersive', desc: 'Full-day cultural marathon covering major sights' },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPace(p.id as PaceType)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      pace === p.id
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xs font-bold">{p.label}</div>
                    <div className="text-[10px] opacity-75 mt-1 leading-tight">{p.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 3: LOGISTICS & FOOD ================= */}
        {step === 3 && (
          <div className="space-y-8 animate-fadeIn">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded">
                Step 03 / 03 • Logistics, Stays & Dietary
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
                Budget, Accommodations & Culinary Preferences
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Customize spending tiers, default INR currency, and regional dietary requirements.
              </p>
            </div>

            {/* Budget & Currency */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Target Budget Tier
                </label>
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-slate-500 font-medium">Currency:</span>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="py-1 px-2.5 bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none"
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    id: 'backpacker',
                    tier: 'Budget Explorer',
                    rate: currency === 'INR' ? '₹2,500 – ₹4,500 / day' : '$40 – $70 / day',
                    desc: 'Clean hostels/homestays, authentic street food & metro/autos',
                  },
                  {
                    id: 'moderate',
                    tier: 'Comfort & Character',
                    rate: currency === 'INR' ? '₹7,500 – ₹14,000 / day' : '$120 – $220 / day',
                    desc: 'Heritage Havelis, courtyard bistros & private auto/cab rides',
                  },
                  {
                    id: 'luxury',
                    tier: 'Royal Luxury',
                    rate: currency === 'INR' ? '₹22,000+ / day' : '$350+ / day',
                    desc: '5-star royal palaces, private chauffeured cars & fine dining',
                  },
                ].map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setBudgetTier(b.id as BudgetTier)}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      budgetTier === b.id
                        ? 'bg-emerald-50 border-emerald-700 ring-2 ring-emerald-700/20 shadow-sm'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xs font-bold text-slate-900">{b.tier}</div>
                    <div className="text-sm font-extrabold text-emerald-800 mt-1">{b.rate}</div>
                    <div className="text-[11px] text-slate-500 mt-1.5 leading-snug">{b.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Dietary Restrictions (Crucial for Indian and Global travelers) */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Dietary & Dining Preference
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {DIETARY_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setDietary(opt)}
                    className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                      dietary === opt
                        ? 'bg-amber-50 border-amber-600 text-amber-950 ring-1 ring-amber-600'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Accommodation Style */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Preferred Lodging Style
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ACCOMMODATIONS.map((acc) => (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => setAccommodationPreference(acc.id)}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      accommodationPreference === acc.id
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">{acc.label}</span>
                      {accommodationPreference === acc.id && (
                        <Check className="w-4 h-4 text-amber-300" />
                      )}
                    </div>
                    <p className="text-[11px] opacity-75 mt-1 leading-snug">{acc.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Accessibility / Mobility */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Accessibility className="w-3.5 h-3.5 text-slate-500" />
                <span>Accessibility & Mobility Requirements (Optional)</span>
              </label>
              <input
                type="text"
                value={accessibility}
                onChange={(e) => setAccessibility(e.target.value)}
                placeholder="e.g. Ground floor rooms preferred, wheelchair access, minimal stair climbing..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            {/* Custom Notes / Special Requests */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                <span>Custom Notes / Special Requests (Optional)</span>
              </label>
              <textarea
                rows={2}
                value={additionalInstructions}
                onChange={(e) => setAdditionalInstructions(e.target.value)}
                placeholder="e.g. Traveling with elderly parents (minimal stairs), looking for sunrise photo spots, or interested in local cooking workshops..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>
        )}

        {/* ================= NAVIGATION FOOTER ================= */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="py-2.5 px-5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold flex items-center gap-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              className="py-2.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all shadow-md"
            >
              <span>Continue to Step 0{step + 1}</span>
              <ArrowRight className="w-4 h-4 text-amber-400" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleGenerate}
              className="py-3 px-8 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>Generate Bespoke Itinerary</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
