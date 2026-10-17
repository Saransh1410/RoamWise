import React, { useState } from 'react';
import { Users, ShieldCheck } from 'lucide-react';

interface BudgetBreakdownProps {
  totalCost: number;
  currency: string;
  durationDays: number;
  breakdown?: Record<string, number>;
}

export const BudgetBreakdown: React.FC<BudgetBreakdownProps> = ({
  totalCost,
  currency,
  durationDays,
}) => {
  const [travelerCount, setTravelerCount] = useState(2);

  const dailyAverage = Math.round(totalCost / Math.max(durationDays, 1));
  const perPerson = Math.round(totalCost / Math.max(travelerCount, 1));

  const categories = [
    { key: 'accommodation', label: 'Lodging & Stays', color: 'bg-[#C85A32]', pct: 40 },
    { key: 'dining', label: 'Culinary & Dining', color: 'bg-[#D4973B]', pct: 30 },
    { key: 'activities', label: 'Experiences & Entry', color: 'bg-[#2D4A3E]', pct: 18 },
    { key: 'transit', label: 'Local Transit & Trains', color: 'bg-[#4338CA]', pct: 7 },
    { key: 'contingency', label: 'Discretionary & Tips', color: 'bg-[#78716C]', pct: 5 },
  ];

  return (
    <div className="bg-white rounded-2xl border border-[#E8E2D9] p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#F0EAE1] gap-4">
        <div>
          <span className="editorial-stamp mb-1">Financial Planning</span>
          <h2 className="font-serif text-2xl font-bold text-[#1C1917]">Trip Budget & Cost Allocation</h2>
          <p className="text-xs text-[#78716C]">Estimated breakdown curated for your selected travel style and pace.</p>
        </div>

        {/* Traveler Counter */}
        <div className="flex items-center space-x-2 bg-[#FAF8F5] border border-[#D4CBBE] px-3 py-1.5 rounded-xl">
          <Users className="w-4 h-4 text-[#C85A32]" />
          <span className="text-xs font-semibold text-[#57534E]">Split for:</span>
          <select
            value={travelerCount}
            onChange={(e) => setTravelerCount(Number(e.target.value))}
            className="bg-transparent text-xs font-bold text-[#1C1917] focus:outline-none"
          >
            {[1, 2, 3, 4, 5, 6, 8, 10].map((num) => (
              <option key={num} value={num}>
                {num} {num === 1 ? 'Traveler' : 'Travelers'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Primary Figures */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#FAF8F5] border border-[#E8E2D9] p-4 rounded-xl">
          <span className="text-xs text-[#78716C] font-semibold uppercase tracking-wider">Total Estimated Trip</span>
          <div className="font-serif text-3xl font-bold text-[#1C1917] mt-1">
            {currency} {totalCost.toLocaleString()}
          </div>
          <span className="text-[11px] text-[#2D4A3E] font-medium">All-inclusive {durationDays}-day estimate</span>
        </div>

        <div className="bg-[#FAF8F5] border border-[#E8E2D9] p-4 rounded-xl">
          <span className="text-xs text-[#78716C] font-semibold uppercase tracking-wider">Daily Pace</span>
          <div className="font-serif text-3xl font-bold text-[#1C1917] mt-1">
            {currency} {dailyAverage.toLocaleString()}
          </div>
          <span className="text-[11px] text-[#78716C]">Average cost across all days</span>
        </div>

        <div className="bg-[#FAF0EB] border border-[#F2D7CB] p-4 rounded-xl">
          <span className="text-xs text-[#C85A32] font-semibold uppercase tracking-wider">Per Person Share</span>
          <div className="font-serif text-3xl font-bold text-[#C85A32] mt-1">
            {currency} {perPerson.toLocaleString()}
          </div>
          <span className="text-[11px] text-[#A9421C]">Based on {travelerCount} companions</span>
        </div>
      </div>

      {/* Distribution Bar */}
      <div>
        <div className="flex items-center justify-between text-xs font-semibold text-[#57534E] mb-2">
          <span>Category Distribution</span>
          <span>100% of Trip Spend</span>
        </div>
        <div className="h-3 w-full rounded-full overflow-hidden flex bg-[#E8E2D9]">
          {categories.map((cat) => (
            <div
              key={cat.key}
              style={{ width: `${cat.pct}%` }}
              className={`${cat.color} h-full transition-all duration-300`}
              title={`${cat.label}: ${cat.pct}%`}
            />
          ))}
        </div>
      </div>

      {/* Category Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
        {categories.map((cat) => {
          const catAmount = Math.round((totalCost * cat.pct) / 100);
          return (
            <div
              key={cat.key}
              className="flex items-center justify-between p-3.5 rounded-xl border border-[#E8E2D9] bg-[#FAF8F5]"
            >
              <div className="flex items-center space-x-3">
                <span className={`w-3 h-3 rounded-full ${cat.color}`} />
                <div>
                  <div className="text-sm font-semibold text-[#1C1917]">{cat.label}</div>
                  <div className="text-[11px] text-[#78716C]">{cat.pct}% of total budget</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-[#1C1917]">
                  {currency} {catAmount.toLocaleString()}
                </div>
                <div className="text-[11px] text-[#78716C]">
                  ~{currency} {Math.round(catAmount / Math.max(durationDays, 1))}/day
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Smart Budget Tip */}
      <div className="p-4 rounded-xl bg-[#FEF7EA] border border-[#FDE68A] text-xs text-[#92400E] flex items-start space-x-2.5">
        <ShieldCheck className="w-4 h-4 text-[#D97706] flex-shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold text-[#78350F]">Editorial Budgeting Principle:</strong> We build in a 5% contingency buffer to accommodate impromptu wine tastings, unexpected taxi rides, and luggage handling.
        </div>
      </div>
    </div>
  );
};
