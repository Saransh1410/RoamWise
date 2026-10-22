import React, { useState } from 'react';
import {
  CURATED_DESTINATIONS,
  POPULAR_VIBES,
  type CuratedDestination,
} from '../data/curatedDestinations';
import {
  Sparkles,
  Star,
  Clock,
  Compass,
  ArrowRight,
  X,
  Calendar,
  CloudSun,
  Banknote,
  CheckCircle2,
} from 'lucide-react';

interface ExploreGalleryProps {
  onSelectDestination: (dest: CuratedDestination) => void;
}

export const ExploreGallery: React.FC<ExploreGalleryProps> = ({ onSelectDestination }) => {
  const [activeVibe, setActiveVibe] = useState<string>('all');
  const [selectedPreview, setSelectedPreview] = useState<CuratedDestination | null>(null);

  const filtered =
    activeVibe === 'all'
      ? CURATED_DESTINATIONS
      : CURATED_DESTINATIONS.filter((d) => d.vibe === activeVibe);

  return (
    <section id="explore-gallery" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold uppercase tracking-wider mb-4 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Handcrafted India & Global Editions</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 tracking-tight">
          Explore Curated Itineraries by Vibe
        </h2>
        <p className="mt-3 text-base sm:text-lg text-slate-600 font-sans">
          From the royal palaces of Rajasthan to misty Himalayan ridges and coastal backwaters. Pick a journey or preview its daily navigation plan.
        </p>
      </div>

      {/* Popular Vibe Filter Pills */}
      <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-4 mb-10 no-scrollbar">
        {POPULAR_VIBES.map((vibe) => {
          const isActive = activeVibe === vibe.id;
          return (
            <button
              key={vibe.id}
              onClick={() => setActiveVibe(vibe.id)}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 border ${
                isActive
                  ? 'bg-slate-900 text-amber-300 border-slate-900 shadow-md transform scale-[1.02]'
                  : 'bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              {vibe.label}
            </button>
          );
        })}
      </div>

      {/* Destination Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((dest) => (
          <div
            key={dest.id}
            className="group bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
          >
            {/* Image Header with Badges */}
            <div className="relative h-56 overflow-hidden">
              <img
                src={dest.imageUrl}
                alt={dest.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-black/20" />

              {/* Vibe Badge */}
              <div className="absolute top-3 left-3">
                <span className="px-2.5 py-1 rounded-md bg-slate-900/80 backdrop-blur-md text-amber-300 text-xs font-semibold tracking-wide border border-white/10">
                  {dest.vibeLabel}
                </span>
              </div>

              {/* Star Rating */}
              <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/90 backdrop-blur-md text-slate-800 text-xs font-bold shadow-sm">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{dest.rating}</span>
                <span className="text-slate-400 font-normal">({dest.reviewsCount})</span>
              </div>

              {/* Title & Region */}
              <div className="absolute bottom-3 left-4 right-4 text-white">
                <h3 className="text-xl font-serif font-bold text-white drop-shadow-sm">
                  {dest.name}
                </h3>
                <p className="text-xs text-slate-200 flex items-center gap-1.5 mt-0.5">
                  <Compass className="w-3 h-3 text-amber-300" />
                  <span>{dest.stateOrCountry}</span>
                </p>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                {dest.description}
              </p>

              {/* Key Specs */}
              <div className="grid grid-cols-2 gap-2 py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="font-medium text-slate-800">{dest.durationLabel}</span>
                </div>
                <div className="flex items-center gap-1.5 justify-end">
                  <Banknote className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="font-semibold text-slate-900">{dest.avgBudgetINR}</span>
                </div>
              </div>

              {/* Highlights Pill Preview */}
              <div className="flex flex-wrap gap-1.5">
                {dest.highlights.slice(0, 2).map((hl, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-100/80 font-medium truncate max-w-full"
                  >
                    • {hl}
                  </span>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-2 border-t border-slate-100">
                <button
                  onClick={() => setSelectedPreview(dest)}
                  className="flex-1 py-2 px-3 rounded-lg border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
                >
                  Quick View Plan
                </button>
                <button
                  onClick={() => onSelectDestination(dest)}
                  className="flex-1 py-2 px-3 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                >
                  <span>Plan This Trip</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Destination Quick View Modal ("Navigation Plan on Selected Trip") */}
      {selectedPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
            {/* Modal Image Header */}
            <div className="relative h-64 shrink-0">
              <img
                src={selectedPreview.imageUrl}
                alt={selectedPreview.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
              <button
                onClick={() => setSelectedPreview(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-4 left-6 right-6 text-white">
                <div className="inline-block px-2.5 py-0.5 rounded bg-amber-500/90 text-slate-950 text-xs font-bold uppercase tracking-wider mb-1">
                  {selectedPreview.vibeLabel}
                </div>
                <h3 className="text-2xl sm:text-3xl font-serif font-bold">{selectedPreview.name}</h3>
                <p className="text-xs text-slate-300 mt-1">{selectedPreview.stateOrCountry}</p>
              </div>
            </div>

            {/* Modal Content Scrollable */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Overview & Atmosphere</h4>
                <p className="text-sm text-slate-700 leading-relaxed">{selectedPreview.description}</p>
              </div>

              {/* Snapshot Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-amber-50/60 border border-amber-100 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <Calendar className="w-3.5 h-3.5 text-amber-700" />
                    <span>Best Time</span>
                  </div>
                  <p className="text-slate-600">{selectedPreview.bestSeason}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <CloudSun className="w-3.5 h-3.5 text-amber-700" />
                    <span>Weather</span>
                  </div>
                  <p className="text-slate-600">{selectedPreview.weatherSummary}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <Banknote className="w-3.5 h-3.5 text-amber-700" />
                    <span>Avg. Budget</span>
                  </div>
                  <p className="font-semibold text-slate-900">{selectedPreview.avgBudgetINR}</p>
                </div>
              </div>

              {/* Highlights & Navigation Stops */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Signature Highlights & Navigation Stops
                </h4>
                <ul className="space-y-2">
                  {selectedPreview.highlights.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Modal Sticky Footer CTA */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
              <button
                onClick={() => setSelectedPreview(null)}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const dest = selectedPreview;
                  setSelectedPreview(null);
                  onSelectDestination(dest);
                }}
                className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 font-semibold text-xs flex items-center gap-2 shadow-md transition-all hover:gap-3"
              >
                <span>Start Planning This Trip</span>
                <ArrowRight className="w-4 h-4 text-amber-400" />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
