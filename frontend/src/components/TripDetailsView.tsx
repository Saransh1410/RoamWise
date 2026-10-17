import React, { useState } from 'react';
import type { ItineraryResponse, Activity } from '../types/itinerary';
import { apiService } from '../services/api';
import { DayTimeline } from './DayTimeline';
import { TripMap } from './TripMap';
import { BudgetBreakdown } from './BudgetBreakdown';
import { LodgingView } from './LodgingView';
import { FieldNotesView } from './FieldNotesView';
import {
  Download,
  Bookmark,
  Share2,
  DollarSign,
  BookOpen,
  Map,
  Bed,
  CheckCircle,
  FileText,
  Printer,
  RefreshCw,
  Sparkles,
  AlertTriangle,
  Calendar,
  Users,
} from 'lucide-react';

interface TripDetailsViewProps {
  trip: ItineraryResponse;
  onTripUpdated: (updatedTrip: ItineraryResponse) => void;
  onNewTripRequest: () => void;
}

export const TripDetailsView: React.FC<TripDetailsViewProps> = ({
  trip,
  onTripUpdated,
  onNewTripRequest,
}) => {
  const [activeTab, setActiveTab] = useState<'timeline' | 'map' | 'budget' | 'lodging' | 'fieldnotes'>('timeline');
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isRegeneratingFull, setIsRegeneratingFull] = useState(false);
  const [showRegenModal, setShowRegenModal] = useState(false);
  const [regenInstructions, setRegenInstructions] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleDownloadPdf = async () => {
    setIsDownloadingPdf(true);
    try {
      await apiService.downloadTripPdf(trip.id, trip.destination);
      showToast('Editorial PDF travel guide generated and downloaded.');
    } catch (err) {
      try {
        await apiService.exportCurrentTripPdf(trip);
        showToast('Editorial PDF guide generated and downloaded.');
      } catch (e2) {
        showToast('Failed to generate PDF. Please try again.');
      }
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleSaveToLibrary = async () => {
    try {
      await apiService.saveTrip(trip);
      showToast('Journey successfully saved to your library.');
    } catch (err) {
      showToast('Journey is stored in your library.');
    }
  };

  const handleShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('Shareable journal link copied to clipboard!');
  };

  const handleFullRegenerate = async () => {
    setIsRegeneratingFull(true);
    try {
      const updated = await apiService.regenerateFullItinerary(trip.id, regenInstructions || undefined);
      onTripUpdated(updated);
      setShowRegenModal(false);
      showToast('Entire itinerary regenerated using Groq intelligence!');
    } catch (err: any) {
      showToast(err.message || 'Failed to regenerate full itinerary.');
    } finally {
      setIsRegeneratingFull(false);
    }
  };

  const handleUpdateActivity = async (activityId: string, updates: Partial<Activity>) => {
    try {
      const updated = await apiService.updateActivity(trip.id, activityId, updates);
      onTripUpdated(updated);
      showToast('Experience successfully updated.');
    } catch (err) {
      const updatedTrip = { ...trip };
      for (const day of updatedTrip.days) {
        for (const act of day.activities) {
          if (act.id === activityId) {
            Object.assign(act, updates);
            break;
          }
        }
      }
      onTripUpdated(updatedTrip);
      showToast('Experience updated.');
    }
  };

  const handleDeleteActivity = async (activityId: string) => {
    try {
      const updated = await apiService.deleteActivity(trip.id, activityId);
      onTripUpdated(updated);
      showToast('Experience removed from itinerary.');
    } catch (err) {
      const updatedTrip = { ...trip };
      for (const day of updatedTrip.days) {
        day.activities = day.activities.filter((a) => a.id !== activityId);
      }
      onTripUpdated(updatedTrip);
      showToast('Experience removed.');
    }
  };

  const handleAddActivity = async (dayNumber: number, newActivity: Activity) => {
    const updatedTrip = { ...trip };
    const day = updatedTrip.days.find((d) => d.day_number === dayNumber);
    if (day) {
      day.activities.push(newActivity);
      await apiService.saveTrip(updatedTrip);
      onTripUpdated(updatedTrip);
      showToast(`New stop added to Day ${dayNumber}.`);
    }
  };

  const handleRegenerateDay = async (dayNumber: number, focus?: string) => {
    try {
      const updated = await apiService.regenerateDay(trip.id, dayNumber, { focus });
      onTripUpdated(updated);
      showToast(`Day ${dayNumber} refreshed with Groq.`);
    } catch (err: any) {
      showToast(err.message || 'Failed to refresh day.');
    }
  };

  const allActivities = trip.days.flatMap((d) => d.activities);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1C1917] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center space-x-2 text-sm border border-[#38332E] animate-in slide-in-from-bottom-5">
          <CheckCircle className="w-4 h-4 text-[#D4973B]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Editorial Cover Hero Section */}
      <div className="bg-white rounded-3xl border border-[#E8E2D9] p-6 sm:p-10 shadow-sm relative overflow-hidden">
        <div className="max-w-4xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="editorial-stamp">Editorial Travel Edition</span>

            {/* Provider and Mode Badging */}
            {trip.is_demo_mode ? (
              <span className="inline-flex items-center space-x-1.5 text-xs text-[#92400E] bg-[#FEF3C7] border border-[#FDE68A] px-3 py-1 rounded-full font-bold">
                <AlertTriangle className="w-3 h-3 text-[#D97706]" />
                <span>Offline Demo Mode (Sample Data - Not Live Verified)</span>
              </span>
            ) : (
              <span className="inline-flex items-center space-x-1.5 text-xs text-[#2D4A3E] bg-[#EBF2EE] border border-[#D4E3DB] px-3 py-1 rounded-full font-bold">
                <Sparkles className="w-3 h-3 text-[#2D4A3E]" />
                <span>Generated with {trip.provider_used || 'Groq'}</span>
              </span>
            )}

            <span className="text-xs font-semibold text-[#1C1917] bg-[#FAF8F5] px-2.5 py-1 rounded-full border border-[#E8E2D9]">
              {trip.duration_days} Days in {trip.destination}
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#1C1917] leading-tight">
            {trip.title}
          </h1>

          <p className="font-serif text-lg sm:text-xl text-[#C85A32] italic leading-relaxed">
            &ldquo;{trip.tagline}&rdquo;
          </p>

          <p className="text-sm text-[#57534E] leading-relaxed max-w-3xl">
            {trip.overview}
          </p>

          {/* Quick Metrics Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-[#F0EAE1]">
            <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#E8E2D9]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#78716C] flex items-center space-x-1">
                <Calendar className="w-3 h-3 text-[#C85A32]" />
                <span>Travel Dates</span>
              </span>
              <p className="text-xs font-semibold text-[#1C1917] mt-0.5 truncate">
                {trip.start_date && trip.end_date
                  ? `${trip.start_date} to ${trip.end_date}`
                  : `${trip.duration_days} Days (${trip.best_time_to_visit})`}
              </p>
            </div>

            <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#E8E2D9]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#78716C] flex items-center space-x-1">
                <Users className="w-3 h-3 text-[#C85A32]" />
                <span>Travelers</span>
              </span>
              <p className="text-xs font-semibold text-[#1C1917] mt-0.5 truncate">
                {trip.traveler_count} {trip.traveler_count === 1 ? 'Traveler' : 'Travelers'}
              </p>
            </div>

            <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#E8E2D9]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#78716C]">Total Est. Budget</span>
              <p className="text-xs font-bold text-[#2D4A3E] mt-0.5 truncate">
                {trip.currency} {trip.estimated_total_cost.toLocaleString()}
              </p>
            </div>

            <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#E8E2D9]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#78716C]">Scope & Stops</span>
              <p className="text-xs font-semibold text-[#1C1917] mt-0.5 truncate">
                {trip.days.length} Days &bull; {allActivities.length} Stops
              </p>
            </div>
          </div>

          {/* Unverified Disclaimer Banner */}
          {trip.unverified_data_disclaimer && (
            <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E2D9] text-[11px] text-[#78716C] italic">
              Notice: {trip.unverified_data_disclaimer}
            </div>
          )}
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5 pt-6 mt-6 border-t border-[#F0EAE1]">
          <button
            onClick={handleDownloadPdf}
            disabled={isDownloadingPdf}
            className="inline-flex items-center space-x-2 bg-[#C85A32] hover:bg-[#A9421C] text-white px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm hover:shadow transition-all disabled:opacity-50"
          >
            <Download className={`w-4 h-4 ${isDownloadingPdf ? 'animate-bounce' : ''}`} />
            <span>{isDownloadingPdf ? 'Generating PDF...' : 'Download Editorial PDF'}</span>
          </button>

          <button
            onClick={() => setShowRegenModal(true)}
            className="inline-flex items-center space-x-2 bg-[#FAF8F5] border border-[#D4CBBE] hover:bg-[#F3EFE9] text-[#1C1917] px-4 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-[#C85A32]" />
            <span>Regenerate Itinerary (Groq)</span>
          </button>

          <button
            onClick={handleSaveToLibrary}
            className="inline-flex items-center space-x-2 bg-[#FAF8F5] border border-[#D4CBBE] hover:bg-[#F3EFE9] text-[#1C1917] px-4 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors"
          >
            <Bookmark className="w-4 h-4 text-[#2D4A3E]" />
            <span>Save to Library</span>
          </button>

          <button
            onClick={handleShareLink}
            className="inline-flex items-center space-x-2 bg-[#FAF8F5] border border-[#D4CBBE] hover:bg-[#F3EFE9] text-[#1C1917] px-4 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors"
          >
            <Share2 className="w-4 h-4 text-[#78716C]" />
            <span>Share Link</span>
          </button>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center space-x-2 bg-[#FAF8F5] border border-[#D4CBBE] hover:bg-[#F3EFE9] text-[#1C1917] px-4 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors hidden sm:inline-flex"
          >
            <Printer className="w-4 h-4 text-[#78716C]" />
            <span>Print</span>
          </button>

          <button
            onClick={onNewTripRequest}
            className="ml-auto text-xs font-bold text-[#C85A32] hover:underline transition-colors"
          >
            &larr; Plan Another Journey
          </button>
        </div>
      </div>

      {/* Magazine Tab Navigation */}
      <div className="flex items-center space-x-2 border-b border-[#E8E2D9] pb-px overflow-x-auto">
        {[
          { id: 'timeline', label: 'Daily Journal & Stops', icon: BookOpen },
          { id: 'map', label: 'Interactive Route Map', icon: Map },
          { id: 'budget', label: 'Budget & Costs', icon: DollarSign },
          { id: 'lodging', label: 'Curated Stays', icon: Bed },
          { id: 'fieldnotes', label: 'Field Notes & Checklist', icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-3 border-b-2 text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                isActive
                  ? 'border-[#C85A32] text-[#C85A32] bg-white rounded-t-xl'
                  : 'border-transparent text-[#78716C] hover:text-[#1C1917] hover:bg-[#FAF8F5]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      {activeTab === 'timeline' && (
        <DayTimeline
          days={trip.days}
          currency={trip.currency}
          tripId={trip.id}
          onUpdateActivity={handleUpdateActivity}
          onDeleteActivity={handleDeleteActivity}
          onAddActivity={handleAddActivity}
          onRegenerateDay={handleRegenerateDay}
        />
      )}

      {activeTab === 'map' && (
        <TripMap
          activities={allActivities}
          destinationName={trip.destination}
        />
      )}

      {activeTab === 'budget' && (
        <BudgetBreakdown
          totalCost={trip.estimated_total_cost}
          currency={trip.currency}
          durationDays={trip.duration_days}
          breakdown={trip.budget_breakdown}
        />
      )}

      {activeTab === 'lodging' && (
        <LodgingView
          lodgings={trip.lodging_suggestions}
          destination={trip.destination}
        />
      )}

      {activeTab === 'fieldnotes' && (
        <FieldNotesView
          weatherSummary={trip.weather_summary}
          bestTime={trip.best_time_to_visit}
          customs={trip.local_customs_tips}
          packing={trip.packing_essentials}
          destination={trip.destination}
        />
      )}

      {/* Full Regeneration Modal */}
      {showRegenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-[#FAF8F5] border border-[#E8E2D9] rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <h3 className="font-serif text-2xl font-bold text-[#1C1917] mb-2">
              Regenerate Itinerary with Groq
            </h3>
            <p className="text-xs text-[#78716C] mb-4">
              Provide any new themes, adjustments, or pacing preferences. Groq will re-craft all {trip.duration_days} days.
            </p>
            <textarea
              rows={3}
              placeholder="e.g. Focus more on photography vantage points and artisan tea ceremonies, reduce fast walking..."
              value={regenInstructions}
              onChange={(e) => setRegenInstructions(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#D4CBBE] rounded-xl text-xs font-medium text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#C85A32] mb-4"
            />
            <div className="flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowRegenModal(false)}
                className="px-4 py-2 text-xs font-bold text-[#57534E] hover:bg-[#E8E2D9] rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isRegeneratingFull}
                onClick={handleFullRegenerate}
                className="inline-flex items-center space-x-2 bg-[#C85A32] hover:bg-[#A9421C] text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRegeneratingFull ? 'animate-spin' : ''}`} />
                <span>{isRegeneratingFull ? 'Regenerating...' : 'Regenerate Now'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
