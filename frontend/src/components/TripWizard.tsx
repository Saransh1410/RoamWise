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
  Bed,
  AlertCircle,
  Accessibility,
  MessageSquare,
} from 'lucide-react';

interface TripWizardProps {
  onTripGenerated: (trip: ItineraryResponse) => void;
}

const POPULAR_DESTINATIONS = [
  { name: 'Kyoto, Japan', country: 'Japan', highlight: 'Ancient Temples & Zen Gardens' },
  { name: 'Rome, Italy', country: 'Italy', highlight: 'Baroque Piazzas & Roman Ruins' },
  { name: 'Paris, France', country: 'France', highlight: 'Haussmann Boulevards & Bistros' },
  { name: 'Amalfi Coast, Italy', country: 'Italy', highlight: 'Cliffside Villages & Limoncello' },
  { name: 'Oaxaca, Mexico', country: 'Mexico', highlight: 'Artisanal Mezcal & Ancient Zapotec' },
  { name: 'Reykjavik, Iceland', country: 'Iceland', highlight: 'Geothermal Lagoons & Aurora Skies' },
];

const TRAVEL_STYLES = [
  { id: 'cultural', label: 'Cultural & Historic', icon: Landmark, desc: 'Temples, galleries & heritage' },
  { id: 'culinary', label: 'Food & Wine Trails', icon: UtensilsCrossed, desc: 'Farm-to-table & local markets' },
  { id: 'nature', label: 'Nature & Solitude', icon: Mountain, desc: 'Hikes, national parks & vistas' },
  { id: 'relaxed', label: 'Relaxed & Wellness', icon: Palmtree, desc: 'Thermal onsens & peaceful cafes' },
  { id: 'photography', label: 'Photography & Design', icon: Camera, desc: 'Scenic viewpoints & architecture' },
  { id: 'hidden_gems', label: 'Hidden Gems & Local Secrets', icon: Sparkles, desc: 'Off-the-beaten-path alleyways' },
];

const ACCOMMODATIONS = [
  { id: 'boutique_hotel', label: 'Boutique Heritage Hotel', desc: 'Character, artisanal interior & central location' },
  { id: 'luxury_resort', label: 'Refined 5-Star Resort', desc: 'Exceptional hospitality, concierge & spa facilities' },
  { id: 'traditional_guesthouse', label: 'Traditional Ryokan / Guesthouse', desc: 'Tatami rooms, onsen baths & regional tea breakfast' },
  { id: 'rental_apartment', label: 'Design Loft / Apartment', desc: 'Spacious privacy, kitchen amenities & neighborhood immersion' },
  { id: 'budget_hostel', label: 'Boutique Social Hostel', desc: 'Design pods, communal lounges & budget-conscious' },
];

export const TripWizard: React.FC<TripWizardProps> = ({ onTripGenerated }) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [dateError, setDateError] = useState('');

  // Form State (Preserved when navigating backward and forward)
  const [destination, setDestination] = useState('Kyoto, Japan');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [durationDays, setDurationDays] = useState(4);
  const [groupType, setGroupType] = useState<GroupType>('couple');
  const [travelerCount, setTravelerCount] = useState(2);
  const [budgetTier, setBudgetTier] = useState<BudgetTier>('moderate');
  const [currency, setCurrency] = useState('USD');
  const [selectedStyles, setSelectedStyles] = useState<string[]>(['cultural', 'culinary']);
  const [pace, setPace] = useState<PaceType>('balanced');
  const [accommodationPreference, setAccommodationPreference] = useState('boutique_hotel');
  const [dietary, setDietary] = useState<string>('');
  const [accessibility, setAccessibility] = useState<string>('');
  const [landmarks, setLandmarks] = useState<string>('');
  const [additionalInstructions, setAdditionalInstructions] = useState<string>('');

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
    `Connecting to Groq AI engine for ${destination}...`,
    'Synthesizing morning, afternoon, and twilight cultural trails...',
    'Selecting authentic regional food stops and neighborhood bistros...',
    'Calculating category budgets, transit guidance, and route pacing...',
    'Assembling your bespoke Roamwise travel edition...',
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

  const handleNext = () => {
    if (step === 1 && !destination.trim()) {
      setErrorMessage('Please enter or select a destination.');
      return;
    }
    if (step === 2 && dateError) {
      setErrorMessage('Please fix the selected trip dates.');
      return;
    }
    setErrorMessage('');
    setStep(step + 1);
  };

  const handleGenerate = async () => {
    if (dateError) {
      setErrorMessage('Please fix trip dates before generating.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    const timer = setInterval(() => {
      setLoadingPhase((prev) => (prev + 1) % loadingMessages.length);
    }, 2200);

    try {
      const payload: TripRequest = {
        destination: destination.trim(),
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
        must_see_landmarks: landmarks ? landmarks.split(',').map((l) => l.trim()) : undefined,
        additional_instructions: additionalInstructions || undefined,
      };

      const result = await apiService.generateItinerary(payload);

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#C85A32', '#2D4A3E', '#D4973B', '#FAF8F5'],
        });
      } catch (e) {
        // ignore if canvas not supported
      }

      onTripGenerated(result);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to generate itinerary. Please try again.');
      setIsSubmitting(false);
    } finally {
      clearInterval(timer);
    }
  };

  if (isSubmitting) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 text-center">
        <div className="bg-white rounded-3xl border border-[#E8E2D9] p-10 shadow-lg relative overflow-hidden">
          <div className="w-20 h-20 mx-auto rounded-full bg-[#FAF0EB] border border-[#E8D4C8] flex items-center justify-center text-[#C85A32] mb-6 animate-pulse">
            <Compass className="w-10 h-10 animate-spin" style={{ animationDuration: '6s' }} />
          </div>

          <span className="editorial-stamp mb-3">Powered Exclusively by Groq</span>
          <h2 className="font-serif text-3xl font-bold text-[#1C1917] mb-3">
            Drafting Your {destination} Journal
          </h2>

          <p className="text-sm text-[#78716C] h-8 flex items-center justify-center transition-all">
            {loadingMessages[loadingPhase]}
          </p>

          <div className="w-48 h-1.5 bg-[#E8E2D9] rounded-full mx-auto mt-8 overflow-hidden">
            <div className="h-full bg-[#C85A32] rounded-full w-2/3 animate-[pulse_1.5s_infinite]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Wizard Progress Header */}
      <div className="mb-8 text-center">
        <span className="editorial-stamp mb-2">Groq-Powered Travel Planner</span>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#1C1917] tracking-tight">
          Curate Your Bespoke Journey
        </h1>
        <p className="text-sm text-[#78716C] mt-2 max-w-xl mx-auto">
          Tailored daily schedules, verified local food trails, and curated stays using Groq's low-latency intelligence.
        </p>

        {/* Step Indicator */}
        <div className="flex items-center justify-center space-x-2 mt-6">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                s === step
                  ? 'w-10 bg-[#C85A32]'
                  : s < step
                  ? 'w-6 bg-[#2D4A3E]'
                  : 'w-4 bg-[#E8E2D9]'
              }`}
            />
          ))}
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Step Cards Container */}
      <div className="bg-white rounded-3xl border border-[#E8E2D9] p-6 sm:p-10 shadow-sm transition-all">
        {/* STEP 1: DESTINATION */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#C85A32]">Step 01 / 05</span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1917] mt-1">
                Where are you travelling?
              </h2>
              <p className="text-xs sm:text-sm text-[#78716C] mt-1">
                Choose an inspiring cultural capital or enter any city or country worldwide.
              </p>
            </div>

            {/* Custom Input */}
            <div className="relative">
              <Search className="w-5 h-5 text-[#78716C] absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Type any destination (e.g. Kyoto, Lisbon, Vancouver, Oaxaca)..."
                className="w-full pl-12 pr-4 py-3.5 bg-[#FAF8F5] border border-[#D4CBBE] rounded-2xl text-base font-medium text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#C85A32]"
              />
            </div>

            {/* Curated Inspirations Grid */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#57534E] mb-3">
                Featured Editorial Inspirations
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {POPULAR_DESTINATIONS.map((dest) => (
                  <button
                    key={dest.name}
                    type="button"
                    onClick={() => setDestination(dest.name)}
                    className={`text-left p-4 rounded-2xl border transition-all ${
                      destination === dest.name
                        ? 'bg-[#FAF0EB] border-[#C85A32] ring-2 ring-[#C85A32]/20 shadow-sm'
                        : 'bg-[#FAF8F5] border-[#E8E2D9] hover:border-[#D4CBBE] hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#78716C]">
                        {dest.country}
                      </span>
                      {destination === dest.name && (
                        <Check className="w-4 h-4 text-[#C85A32]" />
                      )}
                    </div>
                    <div className="font-serif text-lg font-bold text-[#1C1917] mt-1">
                      {dest.name}
                    </div>
                    <div className="text-[11px] text-[#57534E] mt-0.5">
                      {dest.highlight}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: DATES, DURATION & TRAVELERS */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#C85A32]">Step 02 / 05</span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1917] mt-1">
                Travel Dates & Party Size
              </h2>
              <p className="text-xs sm:text-sm text-[#78716C] mt-1">
                Set your exact travel calendar dates and companions. Duration is automatically synced.
              </p>
            </div>

            {/* Specific Date Range Pickers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#FAF8F5] border border-[#E8E2D9] rounded-2xl p-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#57534E] mb-1.5 flex items-center space-x-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#C85A32]" />
                  <span>Start Date (Optional)</span>
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#D4CBBE] rounded-xl text-xs font-medium text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#C85A32]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#57534E] mb-1.5 flex items-center space-x-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#C85A32]" />
                  <span>End Date (Optional)</span>
                </label>
                <input
                  type="date"
                  value={endDate}
                  min={startDate || undefined}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#D4CBBE] rounded-xl text-xs font-medium text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#C85A32]"
                />
              </div>

              {dateError && (
                <div className="sm:col-span-2 text-xs text-red-600 font-semibold flex items-center space-x-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{dateError}</span>
                </div>
              )}
            </div>

            {/* Duration Slider / Display */}
            <div className="bg-[#FAF8F5] border border-[#E8E2D9] rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#57534E]">
                  Itinerary Duration
                </span>
                <span className="font-serif text-2xl font-bold text-[#C85A32]">
                  {durationDays} {durationDays === 1 ? 'Day' : 'Days'}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="14"
                value={durationDays}
                onChange={(e) => setDurationDays(Number(e.target.value))}
                className="w-full accent-[#C85A32] cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-[#78716C] mt-1.5">
                <span>1 Day (Quick Getaway)</span>
                <span>7 Days (Balanced)</span>
                <span>14 Days (Grand Voyage)</span>
              </div>
            </div>

            {/* Travelers & Group Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#57534E] mb-2 flex items-center space-x-1.5">
                  <Users className="w-3.5 h-3.5 text-[#C85A32]" />
                  <span>Exact Traveler Count</span>
                </label>
                <div className="flex items-center space-x-3 bg-[#FAF8F5] border border-[#E8E2D9] p-3 rounded-xl">
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={travelerCount}
                    onChange={(e) => setTravelerCount(Math.max(1, Number(e.target.value)))}
                    className="w-20 px-3 py-1.5 bg-white border border-[#D4CBBE] rounded-lg text-sm font-bold text-[#1C1917] focus:outline-none"
                  />
                  <span className="text-xs text-[#78716C]">Persons traveling together</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#57534E] mb-2">
                  Group Dynamic
                </label>
                <select
                  value={groupType}
                  onChange={(e) => setGroupType(e.target.value as GroupType)}
                  className="w-full px-3 py-3 bg-[#FAF8F5] border border-[#D4CBBE] rounded-xl text-xs font-bold text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#C85A32]"
                >
                  <option value="solo">Solo Explorer (Self-guided introspection)</option>
                  <option value="couple">Couple (Romantic & shared dining)</option>
                  <option value="family">Family with Children (All-ages friendly)</option>
                  <option value="friends">Friends Group (Vibrant & social)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: BUDGET & ACCOMMODATION PREFERENCE */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#C85A32]">Step 03 / 05</span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1917] mt-1">
                Budget Tier & Lodging Style
              </h2>
              <p className="text-xs sm:text-sm text-[#78716C] mt-1">
                Tailor spending limits and lodging character to match your taste.
              </p>
            </div>

            {/* Currency selector */}
            <div className="flex items-center space-x-3 bg-[#FAF8F5] border border-[#E8E2D9] p-3 rounded-2xl">
              <span className="text-xs font-semibold text-[#57534E] pl-2">Pricing Currency:</span>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="bg-white border border-[#D4CBBE] rounded-xl px-3 py-1.5 text-xs font-bold text-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#C85A32]"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="JPY">JPY (¥)</option>
                <option value="CAD">CAD (C$)</option>
                <option value="AUD">AUD (A$)</option>
                <option value="INR">INR (₹)</option>
              </select>
            </div>

            {/* Budget Tiers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { id: 'backpacker', label: 'Backpacker / Nomad', rate: `~$65/day`, desc: 'Boutique hostels, street food stalls, scenic transit, free walking trails.' },
                { id: 'moderate', label: 'Thoughtful Moderate', rate: `~$175/day`, desc: 'Character boutique hotels, cozy family-run bistros, museum admissions.' },
                { id: 'luxury', label: 'Refined Luxury', rate: `~$480/day`, desc: 'Heritage 5-star properties, fine tasting menus, private docent-guided entries.' },
                { id: 'ultra_luxe', label: 'Ultra-Luxe & Bespoke', rate: `~$990+/day`, desc: 'Private villas, exclusive after-hours access, chef-table experiences, private driver.' },
              ].map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setBudgetTier(b.id as BudgetTier)}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    budgetTier === b.id
                      ? 'bg-[#FAF0EB] border-[#C85A32] ring-2 ring-[#C85A32]/20'
                      : 'bg-[#FAF8F5] border-[#E8E2D9] hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-lg font-bold text-[#1C1917]">{b.label}</span>
                    <span className="text-xs font-semibold text-[#2D4A3E] bg-[#EBF2EE] px-2 py-0.5 rounded">
                      {b.rate}
                    </span>
                  </div>
                  <p className="text-xs text-[#57534E] mt-1.5 leading-relaxed">{b.desc}</p>
                </button>
              ))}
            </div>

            {/* Accommodation Preferences */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#57534E] mb-2 flex items-center space-x-1.5">
                <Bed className="w-3.5 h-3.5 text-[#C85A32]" />
                <span>Preferred Lodging Style</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {ACCOMMODATIONS.map((acc) => (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => setAccommodationPreference(acc.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      accommodationPreference === acc.id
                        ? 'bg-[#EBF2EE] border-[#2D4A3E] ring-1 ring-[#2D4A3E]'
                        : 'bg-[#FAF8F5] border-[#E8E2D9] hover:bg-white'
                    }`}
                  >
                    <div className="text-xs font-bold text-[#1C1917]">{acc.label}</div>
                    <div className="text-[11px] text-[#78716C] mt-0.5">{acc.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: TRAVEL STYLES & SIGNATURE THEMES */}
        {step === 4 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#C85A32]">Step 04 / 05</span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1917] mt-1">
                Travel Styles & Passions
              </h2>
              <p className="text-xs sm:text-sm text-[#78716C] mt-1">
                Select 1 or more themes to tailor activity selection and local recommendations.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {TRAVEL_STYLES.map((style) => {
                const Icon = style.icon;
                const isSelected = selectedStyles.includes(style.id);
                return (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => handleToggleStyle(style.id)}
                    className={`p-4 rounded-2xl border text-left transition-all flex items-start space-x-3 ${
                      isSelected
                        ? 'bg-[#FAF0EB] border-[#C85A32] ring-2 ring-[#C85A32]/20'
                        : 'bg-[#FAF8F5] border-[#E8E2D9] hover:bg-white'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isSelected ? 'bg-[#C85A32] text-white' : 'bg-[#E8E2D9] text-[#57534E]'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-serif text-base font-bold text-[#1C1917]">
                        {style.label}
                      </div>
                      <div className="text-[11px] text-[#78716C] mt-0.5">{style.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 5: PACE, ACCESSIBILITY & CUSTOM INSTRUCTIONS */}
        {step === 5 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#C85A32]">Step 05 / 05</span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1917] mt-1">
                Rhythm & Bespoke Instructions
              </h2>
              <p className="text-xs sm:text-sm text-[#78716C] mt-1">
                Set your daily travel pace and include dietary, accessibility, or personalized requests.
              </p>
            </div>

            {/* Daily Pace */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#57534E] mb-2">
                Daily Rhythm & Schedule Pace
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'relaxed', label: 'Relaxed & Immersive', desc: '1-2 major stops, leisurely cafe hours, no rushing' },
                  { id: 'balanced', label: 'Harmonious & Balanced', desc: '2-3 activities per day, balanced transit and rest' },
                  { id: 'packed', label: 'High Energy', desc: '4+ stops, dawn to dusk landmark exploration' },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPace(p.id as PaceType)}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      pace === p.id
                        ? 'bg-[#FAF0EB] border-[#C85A32] ring-2 ring-[#C85A32]/20'
                        : 'bg-[#FAF8F5] border-[#E8E2D9] hover:bg-white'
                    }`}
                  >
                    <div className="font-serif text-base font-bold text-[#1C1917]">{p.label}</div>
                    <div className="text-[11px] text-[#78716C] mt-1 leading-relaxed">{p.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Dietary & Accessibility */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#57534E] mb-1">
                  Dietary Preferences
                </label>
                <input
                  type="text"
                  placeholder="e.g. Vegetarian, Halal, Gluten-Free, Seafood lover"
                  value={dietary}
                  onChange={(e) => setDietary(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#FAF8F5] border border-[#D4CBBE] rounded-xl text-xs font-medium text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#C85A32]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#57534E] mb-1 flex items-center space-x-1">
                  <Accessibility className="w-3.5 h-3.5 text-[#C85A32]" />
                  <span>Accessibility Requirements</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Wheelchair accessible, avoid steep staircases, step-free transit"
                  value={accessibility}
                  onChange={(e) => setAccessibility(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#FAF8F5] border border-[#D4CBBE] rounded-xl text-xs font-medium text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#C85A32]"
                />
              </div>
            </div>

            {/* Landmarks & Additional Instructions */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#57534E] mb-1">
                  Must-See Landmarks or Wishlist
                </label>
                <input
                  type="text"
                  placeholder="e.g. Fushimi Inari, Bamboo Grove, Golden Pavilion, Kamo River terrace"
                  value={landmarks}
                  onChange={(e) => setLandmarks(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#FAF8F5] border border-[#D4CBBE] rounded-xl text-xs font-medium text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#C85A32]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#57534E] mb-1 flex items-center space-x-1">
                  <MessageSquare className="w-3.5 h-3.5 text-[#C85A32]" />
                  <span>Additional Travel Instructions (Passed Directly to Groq)</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Celebrating our 5th anniversary, prefer atmospheric candlelit spots, avoid tourist-trap avenues..."
                  value={additionalInstructions}
                  onChange={(e) => setAdditionalInstructions(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D4CBBE] rounded-xl text-xs font-medium text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#C85A32]"
                />
              </div>
            </div>
          </div>
        )}

        {/* Wizard Navigation Controls */}
        <div className="flex items-center justify-between pt-8 mt-6 border-t border-[#F0EAE1]">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-full text-xs font-bold text-[#57534E] hover:bg-[#FAF8F5] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 5 ? (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center space-x-2 bg-[#1C1917] hover:bg-[#38332E] text-white px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider shadow transition-all"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleGenerate}
              className="inline-flex items-center space-x-2 bg-[#C85A32] hover:bg-[#A9421C] text-white px-8 py-3.5 rounded-full text-sm font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate Itinerary with Groq</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
