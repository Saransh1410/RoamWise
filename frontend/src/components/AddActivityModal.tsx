import React, { useState } from 'react';
import type { Activity, TimeSlot, ActivityCategory } from '../types/itinerary';
import { X, Plus } from 'lucide-react';

interface AddActivityModalProps {
  dayNumber: number;
  currency: string;
  isOpen: boolean;
  onClose: () => void;
  onAdd: (newActivity: Activity) => Promise<void>;
}

export const AddActivityModal: React.FC<AddActivityModalProps> = ({
  dayNumber,
  currency,
  isOpen,
  onClose,
  onAdd,
}) => {
  const [title, setTitle] = useState('');
  const [locationName, setLocationName] = useState('');
  const [description, setDescription] = useState('');
  const [timeSlot, setTimeSlot] = useState<TimeSlot>('afternoon');
  const [cost, setCost] = useState(0);
  const [category, setCategory] = useState<ActivityCategory>('sightseeing');
  const [durationMinutes, setDurationMinutes] = useState(90);
  const [insiderTip, setInsiderTip] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      const newAct: Activity = {
        id: `act_${dayNumber}_custom_${Date.now()}`,
        time_slot: timeSlot,
        title: title.trim(),
        description: description.trim() || `Bespoke activity curated for Day ${dayNumber}.`,
        location_name: locationName.trim() || 'Central Location',
        estimated_duration_minutes: Number(durationMinutes),
        estimated_cost: Number(cost),
        currency,
        category,
        insider_tip: insiderTip.trim() || null,
        booking_required: false,
      };

      await onAdd(newAct);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-[#FAF8F5] border border-[#E8E2D9] rounded-2xl max-w-lg w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-[#78716C] hover:text-[#1C1917] hover:bg-[#E8E2D9] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-4">
          <span className="editorial-stamp mb-2">Day {dayNumber} Addition</span>
          <h2 className="font-serif text-2xl font-bold text-[#1C1917]">Add Custom Activity</h2>
          <p className="text-xs text-[#78716C]">Incorporate a personal must-see or special booking into this day.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#57534E] mb-1">
              Activity Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Sunset Tea Ceremony at Camellia Garden"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-[#D4CBBE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C85A32]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#57534E] mb-1">
              Location / Venue *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Camellia Tea House, Higashiyama"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-[#D4CBBE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C85A32]"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#57534E] mb-1">
                Time Slot
              </label>
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value as TimeSlot)}
                className="w-full px-2.5 py-2 text-sm bg-white border border-[#D4CBBE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C85A32]"
              >
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="evening">Evening</option>
                <option value="night">Night</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#57534E] mb-1">
                Duration (min)
              </label>
              <input
                type="number"
                min="15"
                step="15"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full px-2.5 py-2 text-sm bg-white border border-[#D4CBBE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C85A32]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#57534E] mb-1">
                Cost ({currency})
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={cost}
                onChange={(e) => setCost(Number(e.target.value))}
                className="w-full px-2.5 py-2 text-sm bg-white border border-[#D4CBBE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C85A32]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#57534E] mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ActivityCategory)}
              className="w-full px-3 py-2 text-sm bg-white border border-[#D4CBBE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C85A32]"
            >
              <option value="culture">Culture & Heritage</option>
              <option value="food">Food & Dining</option>
              <option value="nature">Nature & Scenic</option>
              <option value="sightseeing">Landmarks</option>
              <option value="relaxation">Relaxation</option>
              <option value="adventure">Adventure</option>
              <option value="shopping">Shopping</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#57534E] mb-1">
              Notes / Description
            </label>
            <textarea
              rows={2}
              placeholder="What makes this experience noteworthy?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-[#D4CBBE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C85A32]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#57534E] mb-1">
              Insider Tip (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Reservation under booking #2049"
              value={insiderTip}
              onChange={(e) => setInsiderTip(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-[#D4CBBE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C85A32]"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-[#E8E2D9]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-[#57534E] hover:bg-[#E8E2D9] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-[#C85A32] hover:bg-[#A9421C] text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{isSubmitting ? 'Adding...' : 'Add to Day'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
