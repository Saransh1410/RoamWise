import React, { useState } from 'react';
import type { DayPlan, Activity } from '../types/itinerary';
import {
  Clock,
  MapPin,
  Sparkles,
  Utensils,
  Footprints,
  Edit3,
  Trash2,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { ActivityEditModal } from './ActivityEditModal';
import { AddActivityModal } from './AddActivityModal';

interface DayTimelineProps {
  days: DayPlan[];
  currency: string;
  tripId?: string;
  onUpdateActivity: (activityId: string, updates: Partial<Activity>) => Promise<void>;
  onDeleteActivity: (activityId: string) => Promise<void>;
  onAddActivity: (dayNumber: number, newActivity: Activity) => Promise<void>;
  onRegenerateDay: (dayNumber: number, focus?: string) => Promise<void>;
}

export const DayTimeline: React.FC<DayTimelineProps> = ({
  days,
  currency,
  onUpdateActivity,
  onDeleteActivity,
  onAddActivity,
  onRegenerateDay,
}) => {
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [isAddingActivity, setIsAddingActivity] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const currentDay = days[activeDayIndex] || days[0];

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      await onRegenerateDay(currentDay.day_number);
    } finally {
      setIsRegenerating(false);
    }
  };

  const getSlotColor = (slot: string) => {
    switch (slot) {
      case 'morning':
        return 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]';
      case 'afternoon':
        return 'bg-[#FBF0EB] text-[#C85A32] border-[#F2D7CB]';
      case 'evening':
        return 'bg-[#EBF2EE] text-[#2D4A3E] border-[#D4E3DB]';
      case 'night':
        return 'bg-[#EEF2FF] text-[#4338CA] border-[#E0E7FF]';
      default:
        return 'bg-[#F3EFE9] text-[#57534E] border-[#E8E2D9]';
    }
  };

  return (
    <div className="space-y-6">
      {/* Editorial Day Selector Navigation */}
      <div className="bg-white rounded-2xl border border-[#E8E2D9] p-2 shadow-sm flex items-center space-x-2 overflow-x-auto">
        {days.map((day, idx) => (
          <button
            key={day.day_number}
            onClick={() => setActiveDayIndex(idx)}
            className={`flex-shrink-0 px-4 py-3 rounded-xl transition-all duration-200 text-left ${
              activeDayIndex === idx
                ? 'bg-[#1C1917] text-white shadow'
                : 'text-[#57534E] hover:bg-[#FAF8F5] hover:text-[#1C1917]'
            }`}
          >
            <div className="flex items-center space-x-2">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${activeDayIndex === idx ? 'text-[#D4973B]' : 'text-[#78716C]'}`}>
                Day {day.day_number}
              </span>
              <span className="text-xs opacity-75">
                &bull; {day.activities.length} stops
              </span>
            </div>
            <div className="font-serif text-sm font-semibold truncate max-w-[170px] mt-0.5">
              {day.theme.split(':')[0]}
            </div>
          </button>
        ))}
      </div>

      {/* Active Day Header Banner */}
      <div className="bg-white rounded-2xl border border-[#E8E2D9] p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-[#F0EAE1] gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-1.5">
              <span className="editorial-stamp">Day {currentDay.day_number} Journal</span>
              <span className="text-xs text-[#78716C]">&bull; Est. Budget: {currency} {currentDay.day_budget_estimate}</span>
            </div>
            <h2 className="font-serif text-3xl font-bold text-[#1C1917] leading-tight">
              {currentDay.theme}
            </h2>
            <p className="text-sm text-[#57534E] mt-1 max-w-2xl leading-relaxed">
              {currentDay.summary}
            </p>
          </div>

          <div className="flex items-center space-x-2.5 flex-shrink-0">
            <button
              onClick={() => setIsAddingActivity(true)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#FAF8F5] border border-[#D4CBBE] hover:bg-[#F3EFE9] text-[#1C1917] transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-[#C85A32]" />
              <span>Add Stop</span>
            </button>
            <button
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#FAF0EB] text-[#C85A32] border border-[#F2D7CB] hover:bg-[#C85A32] hover:text-white transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
              <span>{isRegenerating ? 'Refreshing Day...' : 'Regenerate Day'}</span>
            </button>
          </div>
        </div>

        {/* Timeline Activities List */}
        <div className="mt-6 space-y-6">
          {currentDay.activities.map((act, actIdx) => (
            <div key={act.id} className="relative group">
              {/* Activity Card */}
              <div className="bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl p-5 transition-all duration-200 hover:shadow-md hover:border-[#D4CBBE]">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${getSlotColor(
                          act.time_slot
                        )}`}
                      >
                        {act.time_slot}
                      </span>
                      <span className="text-xs text-[#78716C] capitalize bg-white px-2 py-0.5 rounded border border-[#E8E2D9]">
                        {act.category}
                      </span>
                      <span className="text-xs text-[#57534E] flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-[#78716C]" />
                        <span>~{act.estimated_duration_minutes} min</span>
                      </span>
                      {act.estimated_cost > 0 && (
                        <span className="text-xs font-semibold text-[#2D4A3E] bg-[#EBF2EE] px-2 py-0.5 rounded">
                          {act.currency} {act.estimated_cost}
                        </span>
                      )}
                    </div>

                    <h3 className="font-serif text-xl font-bold text-[#1C1917] group-hover:text-[#C85A32] transition-colors">
                      {act.title}
                    </h3>

                    <div className="flex items-center space-x-1.5 text-xs text-[#78716C]">
                      <MapPin className="w-3.5 h-3.5 text-[#C85A32] flex-shrink-0" />
                      <span className="font-medium text-[#44403C]">{act.location_name}</span>
                    </div>

                    <p className="text-sm text-[#57534E] leading-relaxed pt-1">
                      {act.description}
                    </p>

                    {/* Insider Tip Badge Box */}
                    {act.insider_tip && (
                      <div className="mt-3 bg-[#FEF3C7]/70 border border-[#FDE68A] rounded-lg p-3 text-xs text-[#92400E] flex items-start space-x-2">
                        <Sparkles className="w-4 h-4 text-[#D97706] flex-shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-semibold text-[#78350F]">Insider Perspective:</strong>{' '}
                          {act.insider_tip}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Edit and Delete Actions */}
                  <div className="flex items-center space-x-1.5 self-end sm:self-start opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setEditingActivity(act)}
                      title="Edit Experience"
                      className="p-1.5 rounded-lg text-[#57534E] hover:text-[#1C1917] hover:bg-[#E8E2D9] transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteActivity(act.id)}
                      title="Remove from Journey"
                      className="p-1.5 rounded-lg text-[#A9421C] hover:bg-[#FBF0EB] transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Transit Connector to next activity */}
              {act.travel_to_next && actIdx < currentDay.activities.length - 1 && (
                <div className="py-2.5 px-6 flex items-center space-x-3 text-xs text-[#78716C]">
                  <div className="w-4 flex justify-center">
                    <div className="w-0.5 h-8 bg-[#D4CBBE] dashed" />
                  </div>
                  <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-full border border-[#E8E2D9] shadow-2xs">
                    <Footprints className="w-3.5 h-3.5 text-[#C85A32]" />
                    <span className="font-semibold text-[#1C1917]">{act.travel_to_next.mode}</span>
                    <span>&bull;</span>
                    <span>~{act.travel_to_next.duration_minutes} min</span>
                    <span>&bull;</span>
                    <span className="italic text-[#57534E]">{act.travel_to_next.guidance}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Curated Dining for the Day */}
        {currentDay.recommended_dining && currentDay.recommended_dining.length > 0 && (
          <div className="mt-8 pt-6 border-t border-[#F0EAE1]">
            <div className="flex items-center space-x-2 mb-4">
              <Utensils className="w-5 h-5 text-[#C85A32]" />
              <h4 className="font-serif text-xl font-bold text-[#1C1917]">
                Day {currentDay.day_number} Curated Culinary Stops
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {currentDay.recommended_dining.map((dine, dIdx) => (
                <div
                  key={dIdx}
                  className="bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl p-4 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold uppercase tracking-wider text-[#C85A32]">
                        {dine.meal_type.replace('_', ' ')}
                      </span>
                      <span className="font-semibold text-[#2D4A3E]">{dine.price_level}</span>
                    </div>
                    <div className="font-serif font-bold text-base text-[#1C1917]">
                      {dine.name}
                    </div>
                    <div className="text-xs text-[#78716C] mb-2">
                      {dine.cuisine} &bull; {dine.neighborhood}
                    </div>
                    <div className="text-xs bg-white p-2 rounded border border-[#E8E2D9] text-[#57534E]">
                      <strong className="text-[#1C1917]">Must Order:</strong> {dine.must_try_dish}
                    </div>
                  </div>
                  {dine.notes && (
                    <p className="text-[11px] text-[#78716C] italic mt-2">
                      &ldquo;{dine.notes}&rdquo;
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Edit Activity Modal */}
      {editingActivity && (
        <ActivityEditModal
          activity={editingActivity}
          isOpen={!!editingActivity}
          onClose={() => setEditingActivity(null)}
          onSave={async (updates) => {
            await onUpdateActivity(editingActivity.id, updates);
            setEditingActivity(null);
          }}
        />
      )}

      {/* Add Activity Modal */}
      {isAddingActivity && (
        <AddActivityModal
          dayNumber={currentDay.day_number}
          currency={currency}
          isOpen={isAddingActivity}
          onClose={() => setIsAddingActivity(false)}
          onAdd={async (newAct) => {
            await onAddActivity(currentDay.day_number, newAct);
            setIsAddingActivity(false);
          }}
        />
      )}
    </div>
  );
};
