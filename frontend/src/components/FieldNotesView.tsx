import React, { useState } from 'react';
import { CloudSun, Compass, CheckSquare, Square, BookOpen } from 'lucide-react';

interface FieldNotesViewProps {
  weatherSummary: string;
  bestTime: string;
  customs: string[];
  packing: string[];
  destination?: string;
}

export const FieldNotesView: React.FC<FieldNotesViewProps> = ({
  weatherSummary,
  bestTime,
  customs,
  packing,
}) => {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const toggleCheck = (item: string) => {
    setCheckedItems((prev) => ({ ...prev, [item]: !prev[item] }));
  };

  const packedCount = packing.filter((item) => checkedItems[item]).length;

  return (
    <div className="space-y-6">
      {/* Weather & Season Card */}
      <div className="bg-white rounded-2xl border border-[#E8E2D9] p-6 shadow-sm">
        <div className="flex items-center space-x-2 pb-3 mb-4 border-b border-[#F0EAE1]">
          <CloudSun className="w-5 h-5 text-[#D4973B]" />
          <h2 className="font-serif text-2xl font-bold text-[#1C1917]">Climate & Timing Profile</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl p-4">
            <span className="text-xs uppercase font-bold tracking-wider text-[#78716C]">Expected Weather</span>
            <p className="text-sm font-medium text-[#1C1917] mt-1 leading-relaxed">{weatherSummary}</p>
          </div>
          <div className="bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl p-4">
            <span className="text-xs uppercase font-bold tracking-wider text-[#78716C]">Optimal Travel Season</span>
            <p className="text-sm font-medium text-[#1C1917] mt-1 leading-relaxed">{bestTime}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Local Customs & Cultural Etiquette */}
        <div className="bg-white rounded-2xl border border-[#E8E2D9] p-6 shadow-sm">
          <div className="flex items-center space-x-2 pb-3 mb-4 border-b border-[#F0EAE1]">
            <BookOpen className="w-5 h-5 text-[#2D4A3E]" />
            <h3 className="font-serif text-xl font-bold text-[#1C1917]">Local Etiquette & Customs</h3>
          </div>
          <div className="space-y-3">
            {customs.map((custom, idx) => (
              <div
                key={idx}
                className="bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl p-3.5 flex items-start space-x-3 text-xs leading-relaxed"
              >
                <span className="w-5 h-5 rounded-full bg-[#EBF2EE] text-[#2D4A3E] font-bold flex items-center justify-center flex-shrink-0 text-[10px]">
                  0{idx + 1}
                </span>
                <span className="text-[#44403C] font-medium">{custom}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Packing Checklist */}
        <div className="bg-white rounded-2xl border border-[#E8E2D9] p-6 shadow-sm">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#F0EAE1]">
            <div className="flex items-center space-x-2">
              <Compass className="w-5 h-5 text-[#C85A32]" />
              <h3 className="font-serif text-xl font-bold text-[#1C1917]">Packing Checklist</h3>
            </div>
            <span className="text-xs font-semibold text-[#78716C]">
              {packedCount} of {packing.length} Packed
            </span>
          </div>

          <div className="space-y-2.5">
            {packing.map((item, idx) => {
              const isChecked = !!checkedItems[item];
              return (
                <button
                  key={idx}
                  onClick={() => toggleCheck(item)}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-center space-x-3 text-xs ${
                    isChecked
                      ? 'bg-[#EBF2EE] border-[#D4E3DB] text-[#2D4A3E] line-through opacity-80'
                      : 'bg-[#FAF8F5] border-[#E8E2D9] text-[#1C1917] hover:bg-white hover:border-[#D4CBBE]'
                  }`}
                >
                  {isChecked ? (
                    <CheckSquare className="w-4 h-4 text-[#2D4A3E] flex-shrink-0" />
                  ) : (
                    <Square className="w-4 h-4 text-[#78716C] flex-shrink-0" />
                  )}
                  <span className="font-medium">{item}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
