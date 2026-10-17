import React, { useEffect, useState } from 'react';
import type { SavedTripSummary, ItineraryResponse } from '../types/itinerary';
import { apiService } from '../services/api';
import { Link } from 'react-router-dom';
import {
  Download,
  Trash2,
  ArrowRight,
  BookOpen,
  PlusCircle,
} from 'lucide-react';

interface SavedTripsPageProps {
  onSelectTrip: (trip: ItineraryResponse) => void;
}

export const SavedTripsPage: React.FC<SavedTripsPageProps> = ({ onSelectTrip }) => {
  const [trips, setTrips] = useState<SavedTripSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const data = await apiService.listTrips();
      setTrips(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleOpen = async (tripId: string) => {
    try {
      const fullTrip = await apiService.getTrip(tripId);
      onSelectTrip(fullTrip);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (tripId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to remove this journey from your library?')) return;
    setDeletingId(tripId);
    try {
      await apiService.deleteTrip(tripId);
      setTrips((prev) => prev.filter((t) => t.id !== tripId));
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownload = async (tripId: string, dest: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await apiService.downloadTripPdf(tripId, dest);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#E8E2D9] gap-4">
        <div>
          <span className="editorial-stamp mb-2">Travel Archives</span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1C1917]">
            My Curated Journeys
          </h1>
          <p className="text-sm text-[#78716C] mt-1">
            Your personal library of AI-tailored travel itineraries, field notes, and guides.
          </p>
        </div>

        <Link
          to="/"
          className="inline-flex items-center space-x-2 bg-[#C85A32] hover:bg-[#A9421C] text-white px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider shadow transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Curate New Journey</span>
        </Link>
      </div>

      {loading ? (
        <div className="py-20 text-center text-[#78716C]">
          <div className="w-12 h-12 border-2 border-[#C85A32] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm">Retrieving your travel archives...</p>
        </div>
      ) : trips.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#E8E2D9] p-12 text-center max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#FAF0EB] text-[#C85A32] flex items-center justify-center mx-auto">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="font-serif text-2xl font-bold text-[#1C1917]">Your Journal is Empty</h3>
          <p className="text-xs text-[#78716C] leading-relaxed">
            You have not created any travel itineraries yet. Start by selecting a destination and let our AI curate your personalized edition.
          </p>
          <Link
            to="/"
            className="inline-flex items-center space-x-2 bg-[#1C1917] text-white px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider shadow transition-all"
          >
            <span>Plan Your First Trip</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <div
              key={trip.id}
              onClick={() => handleOpen(trip.id)}
              className="bg-white rounded-2xl border border-[#E8E2D9] p-6 shadow-sm hover:shadow-md hover:border-[#D4CBBE] transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="editorial-stamp">
                    {trip.duration_days} Days
                  </span>
                  <span className="text-[#78716C]">
                    {new Date(trip.created_at).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                <h3 className="font-serif text-2xl font-bold text-[#1C1917] group-hover:text-[#C85A32] transition-colors leading-snug">
                  {trip.title}
                </h3>

                <div className="flex items-center space-x-2 text-xs text-[#57534E]">
                  <span className="font-semibold text-[#1C1917]">{trip.destination}</span>
                  {trip.country && <span>&bull; {trip.country}</span>}
                </div>

                <div className="pt-2 text-xs font-bold text-[#2D4A3E]">
                  Estimated: {trip.currency} {trip.estimated_total_cost.toLocaleString()}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-[#F0EAE1] flex items-center justify-between">
                <button
                  type="button"
                  onClick={(e) => handleDownload(trip.id, trip.destination, e)}
                  title="Download PDF Travel Guide"
                  className="p-2 rounded-lg text-[#57534E] hover:text-[#C85A32] hover:bg-[#FAF0EB] transition-colors"
                >
                  <Download className="w-4 h-4" />
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={(e) => handleDelete(trip.id, e)}
                    disabled={deletingId === trip.id}
                    title="Delete Journey"
                    className="p-2 rounded-lg text-[#78716C] hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <span className="inline-flex items-center space-x-1 text-xs font-bold text-[#C85A32] group-hover:translate-x-1 transition-transform">
                    <span>View Journal</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
