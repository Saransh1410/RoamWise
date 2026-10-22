import { Sparkles, ArrowRight, FileDown, Star, Compass, MapPin } from 'lucide-react';

interface HeroProps {
  onStartPlanning: () => void;
  onExploreVibes: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStartPlanning, onExploreVibes }) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#F5EFEB] via-[#FAF7F2] to-white border-b border-slate-200/80 pt-12 pb-20 px-4 sm:px-6 lg:px-8">
      {/* Subtle decorative background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-amber-200/30 via-emerald-100/40 to-transparent blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-5xl mx-auto text-center space-y-8">
        {/* Top Trust Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 text-amber-300 text-xs font-semibold tracking-wide shadow-md">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>Next-Gen Travel Planner • Powered Exclusively by Groq AI</span>
        </div>

        {/* Main Editorial Headline */}
        <div className="space-y-4">
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight leading-[1.15]">
            Bespoke Journeys Crafted in Seconds,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-800 via-amber-600 to-rose-700">
              Not Weeks.
            </span>
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-slate-600 font-sans max-w-3xl mx-auto leading-relaxed">
            From the regal palaces of Rajasthan to misty Himalayan passes and palm-fringed backwaters. Experience intelligent day-by-day itineraries, morning-to-night quadrants, authentic culinary trails, and editorial PDF guides.
          </p>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <button
            onClick={onStartPlanning}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold text-base flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-0.5"
          >
            <span>Start Planning Free</span>
            <ArrowRight className="w-5 h-5 text-amber-400" />
          </button>
          <button
            onClick={onExploreVibes}
            className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-base border border-slate-300 shadow-sm transition-colors flex items-center justify-center gap-2"
          >
            <Compass className="w-5 h-5 text-emerald-700" />
            <span>Explore Curated Vibes</span>
          </button>
        </div>

        {/* Trust Badges & Metrics */}
        <div className="pt-8 border-t border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">10,000+</div>
            <div className="text-xs text-slate-500 font-medium flex items-center justify-center gap-1">
              <Compass className="w-3.5 h-3.5 text-emerald-600" />
              <span>Itineraries Curated</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">140+</div>
            <div className="text-xs text-slate-500 font-medium flex items-center justify-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>India & Global Havens</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">4.9 / 5.0</div>
            <div className="text-xs text-slate-500 font-medium flex items-center justify-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>Explorer Rating</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">Instant PDF</div>
            <div className="text-xs text-slate-500 font-medium flex items-center justify-center gap-1">
              <FileDown className="w-3.5 h-3.5 text-emerald-600" />
              <span>Publication-Grade Guides</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
