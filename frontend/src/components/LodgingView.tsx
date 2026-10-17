import React from 'react';
import type { LodgingRecommendation } from '../types/itinerary';
import { MapPin, Sparkles, CheckCircle2 } from 'lucide-react';

interface LodgingViewProps {
  lodgings: LodgingRecommendation[];
  destination: string;
}

export const LodgingView: React.FC<LodgingViewProps> = ({ lodgings, destination }) => {
  return (
    <div className="bg-white rounded-2xl border border-[#E8E2D9] p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#F0EAE1] gap-2">
        <div>
          <span className="editorial-stamp mb-1">Curated Stays</span>
          <h2 className="font-serif text-2xl font-bold text-[#1C1917]">Recommended Lodgings in {destination}</h2>
          <p className="text-xs text-[#78716C]">Selected for architectural character, prime location, and authentic hospitality.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {lodgings.map((stay, idx) => (
          <div
            key={idx}
            className="bg-[#FAF8F5] border border-[#E8E2D9] rounded-2xl p-5 flex flex-col justify-between hover:shadow-md hover:border-[#D4CBBE] transition-all duration-200"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#C85A32] bg-[#FBF0EB] px-2.5 py-0.5 rounded-full border border-[#F2D7CB]">
                  {stay.style}
                </span>
                <span className="text-xs font-bold text-[#2D4A3E]">
                  {stay.price_per_night}
                </span>
              </div>

              <div>
                <h3 className="font-serif text-xl font-bold text-[#1C1917]">
                  {stay.name}
                </h3>
                <div className="flex items-center space-x-1 text-xs text-[#78716C] mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-[#C85A32]" />
                  <span>{stay.neighborhood}</span>
                </div>
              </div>

              <div className="bg-white border border-[#E8E2D9] rounded-xl p-3 text-xs text-[#57534E] leading-relaxed">
                <strong className="text-[#1C1917] block mb-1 flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#D4973B]" />
                  <span>Why Roamwise Curators Recommend:</span>
                </strong>
                {stay.why_stay_here}
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-[#E8E2D9] flex items-center justify-between text-xs text-[#78716C]">
              <span className="flex items-center space-x-1 text-[#2D4A3E]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified Location</span>
              </span>
              <span className="font-semibold text-[#C85A32]">Reserve in Advance</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
