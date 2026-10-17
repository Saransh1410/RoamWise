import React, { useState } from 'react';
import type { Activity, TimeSlot, ActivityCategory } from '../types/itinerary';
import { X, Check } from 'lucide-react';

interface ActivityEditModalProps {
  activity: Activity;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedActivity: Partial<Activity>) => Promise<void>;
}

export const ActivityEditModal: React.FC<ActivityEditModalProps> = ({
  activity,
  isOpen,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState(activity.title);
  const [description, setDescription] = useState(activity.description);
  const [timeSlot, setTimeSlot] = useState<TimeSlot>(activity.time_slot);
  const [cost, setCost] = useState(activity.estimated_cost);
  const [category, setCategory] = useState<ActivityCategory>(activity.category);
  const [insiderTip, setInsiderTip] = useState(activity.insider_tip || '');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave({
        title,
        description,
        time_slot: timeSlot,
        estimated_cost: Number(cost),
        category,
        insider_tip: insiderTip || null,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
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
          <span className="editorial-stamp mb-2">Editorial Edit</span>
          <h2 className="font-serif text-2xl font-bold text-[#1C1917]">Customize Experience</h2>
          <p className="text-xs text-[#78716C]">Fine-tune the itinerary schedule, timing, or local notes.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#57534E] mb-1">
              Activity Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm bg-white border border-[#D4CBBE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C85A32]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#57534E] mb-1">
                Time Slot
              </label>
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value as TimeSlot)}
                className="w-full px-3 py-2 text-sm bg-white border border-[#D4CBBE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C85A32]"
              >
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="evening">Evening</option>
                <option value="night">Night</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#57534E] mb-1">
                Estimated Cost ({activity.currency})
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={cost}
                onChange={(e) => setCost(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-white border border-[#D4CBBE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C85A32]"
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
              <option value="culture">Culture & History</option>
              <option value="food">Culinary & Dining</option>
              <option value="nature">Nature & Outdoors</option>
              <option value="sightseeing">Landmarks & Sightseeing</option>
              <option value="relaxation">Relaxation & Wellness</option>
              <option value="adventure">Adventure & Sport</option>
              <option value="shopping">Shopping & Artisans</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#57534E] mb-1">
              Narrative Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-[#D4CBBE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C85A32]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#57534E] mb-1">
              Insider Tip or Local Note
            </label>
            <input
              type="text"
              value={insiderTip}
              onChange={(e) => setInsiderTip(e.target.value)}
              placeholder="e.g. Arrive early before 9:00 AM to beat the queue"
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
              disabled={isSaving}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-[#C85A32] hover:bg-[#A9421C] text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
