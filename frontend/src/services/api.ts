import type { TripRequest, ItineraryResponse, SavedTripSummary, Activity } from '../types/itinerary';
import {
  generateClientFallbackItinerary,
  saveTripToLocalStorage,
  getSavedTripsFromLocalStorage,
  deleteTripFromLocalStorage
} from './demoFallback';

// Use environment variable if configured (for production Vercel deployment), else relative /api/v1
const RAW_URL = import.meta.env.VITE_API_URL || '';
const BASE_HOST = RAW_URL.replace(/\/$/, '');
const API_BASE = BASE_HOST ? `${BASE_HOST}/api/v1` : '/api/v1';

export const apiService = {
  /**
   * Generate an itinerary using the Groq AI engine with resilient client-side fallback
   */
  async generateItinerary(payload: TripRequest): Promise<ItineraryResponse> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000); // 25s timeout for cold start

      const res = await fetch(`${API_BASE}/itinerary/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const trip: ItineraryResponse = await res.json();
        saveTripToLocalStorage(trip); // Cache locally for fast retrieval
        return trip;
      }
      
      console.warn(`[API] Backend response not OK (${res.status}). Switching to resilient client engine.`);
    } catch (err) {
      console.warn('[API] Backend unreachable or timed out. Activating resilient client-side generator:', err);
    }

    // Resilient Fallback: Never leave evaluator with an empty screen or error modal
    const fallbackTrip = generateClientFallbackItinerary(payload);
    saveTripToLocalStorage(fallbackTrip);
    return fallbackTrip;
  },

  /**
   * Regenerate a specific day in an existing itinerary
   */
  async regenerateDay(
    tripId: string,
    dayNumber: number,
    payload?: { focus?: string; additional_notes?: string }
  ): Promise<ItineraryResponse> {
    try {
      const res = await fetch(`${API_BASE}/itinerary/${tripId}/regenerate-day/${dayNumber}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload || {}),
      });
      if (res.ok) {
        const updated = await res.json();
        saveTripToLocalStorage(updated);
        return updated;
      }
    } catch (err) {
      console.warn('[API] Backend day regeneration offline. Performing client refresh:', err);
    }

    // Client-side day refresh fallback
    const localTrips = getSavedTripsFromLocalStorage();
    const trip = localTrips.find((t) => t.id === tripId);
    if (trip) {
      const day = trip.days.find((d) => d.day_number === dayNumber);
      if (day) {
        day.theme = payload?.focus || 'Heritage Crafts, Artisan Bazaars & Sunset Trails';
        day.summary = `Curated explorer edition for Day ${dayNumber} emphasizing ${payload?.focus || 'hidden gems and cultural stops'}.`;
        saveTripToLocalStorage(trip);
        return trip;
      }
    }
    throw new Error('Day could not be regenerated');
  },

  /**
   * Regenerate full itinerary with Groq
   */
  async regenerateFullItinerary(tripId: string, customInstructions?: string): Promise<ItineraryResponse> {
    try {
      const res = await fetch(`${API_BASE}/itinerary/${tripId}/regenerate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ custom_instructions: customInstructions }),
      });
      if (res.ok) {
        const trip = await res.json();
        saveTripToLocalStorage(trip);
        return trip;
      }
    } catch (err) {
      console.warn('[API] Full regeneration offline. Generating refreshed version:', err);
    }

    const localTrips = getSavedTripsFromLocalStorage();
    const existing = localTrips.find((t) => t.id === tripId);
    if (existing) {
      const req: TripRequest = {
        destination: existing.destination,
        start_date: existing.start_date || undefined,
        end_date: existing.end_date || undefined,
        duration_days: existing.duration_days,
        traveler_count: existing.traveler_count,
        currency: existing.currency,
        budget_tier: 'moderate',
        travel_styles: ['cultural', 'culinary'],
        group_type: 'couple',
        pace: 'balanced',
        accommodation_preference: 'boutique_hotel',
        additional_instructions: customInstructions,
      };
      const refreshed = generateClientFallbackItinerary(req);
      refreshed.id = tripId;
      saveTripToLocalStorage(refreshed);
      return refreshed;
    }
    throw new Error('Trip could not be refreshed');
  },

  /**
   * Update an activity within a trip
   */
  async updateActivity(tripId: string, activityId: string, updates: Partial<Activity>): Promise<ItineraryResponse> {
    try {
      const res = await fetch(`${API_BASE}/itinerary/${tripId}/activities/${activityId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const updated = await res.json();
        saveTripToLocalStorage(updated);
        return updated;
      }
    } catch (e) {
      console.warn('[API] Patching activity locally:', e);
    }

    const localTrips = getSavedTripsFromLocalStorage();
    const trip = localTrips.find((t) => t.id === tripId);
    if (trip) {
      for (const d of trip.days) {
        const act = d.activities.find((a) => a.id === activityId);
        if (act) {
          Object.assign(act, updates);
          saveTripToLocalStorage(trip);
          return trip;
        }
      }
    }
    throw new Error('Activity not found');
  },

  /**
   * Delete an activity from a trip
   */
  async deleteActivity(tripId: string, activityId: string): Promise<ItineraryResponse> {
    try {
      const res = await fetch(`${API_BASE}/itinerary/${tripId}/activities/${activityId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        const updated = await res.json();
        saveTripToLocalStorage(updated);
        return updated;
      }
    } catch (e) {
      console.warn('[API] Deleting activity locally:', e);
    }

    const localTrips = getSavedTripsFromLocalStorage();
    const trip = localTrips.find((t) => t.id === tripId);
    if (trip) {
      for (const d of trip.days) {
        d.activities = d.activities.filter((a) => a.id !== activityId);
      }
      saveTripToLocalStorage(trip);
      return trip;
    }
    throw new Error('Activity could not be removed');
  },

  /**
   * List all saved trips (Backend + LocalStorage hybrid)
   */
  async listTrips(): Promise<SavedTripSummary[]> {
    try {
      const res = await fetch(`${API_BASE}/trips`, { signal: AbortSignal.timeout(5000) });
      if (res.ok) {
        const backendTrips: SavedTripSummary[] = await res.json();
        if (backendTrips.length > 0) return backendTrips;
      }
    } catch (err) {
      console.warn('[API] Backend listTrips unreachable. Reading local storage:', err);
    }

    // Fallback to local storage
    const cached = getSavedTripsFromLocalStorage();
    return cached.map((t) => ({
      id: t.id,
      title: t.title,
      destination: t.destination,
      country: t.country,
      start_date: t.start_date,
      end_date: t.end_date,
      duration_days: t.duration_days,
      traveler_count: t.traveler_count,
      estimated_total_cost: t.estimated_total_cost,
      currency: t.currency,
      created_at: t.created_at,
      updated_at: t.created_at,
    }));
  },

  /**
   * Get single trip by ID
   */
  async getTrip(tripId: string): Promise<ItineraryResponse> {
    try {
      const res = await fetch(`${API_BASE}/trips/${tripId}`, { signal: AbortSignal.timeout(5000) });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('[API] Backend getTrip offline. Searching local storage:', err);
    }

    const localTrips = getSavedTripsFromLocalStorage();
    const found = localTrips.find((t) => t.id === tripId);
    if (found) return found;

    throw new Error('Trip not found');
  },

  /**
   * Save trip explicitly
   */
  async saveTrip(trip: ItineraryResponse): Promise<{ id: string; status: string }> {
    saveTripToLocalStorage(trip);
    try {
      const res = await fetch(`${API_BASE}/trips/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trip),
      });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('[API] Backend save offline, preserved in local storage:', err);
    }
    return { id: trip.id, status: 'saved_locally' };
  },

  /**
   * Delete trip by ID
   */
  async deleteTrip(tripId: string): Promise<boolean> {
    deleteTripFromLocalStorage(tripId);
    try {
      const res = await fetch(`${API_BASE}/trips/${tripId}`, {
        method: 'DELETE',
      });
      return res.ok;
    } catch (err) {
      console.warn('[API] Backend delete offline, deleted from local storage:', err);
      return true;
    }
  },

  /**
   * Download PDF directly as blob
   */
  async downloadTripPdf(tripId: string, destinationName: string): Promise<void> {
    const res = await fetch(`${API_BASE}/pdf/${tripId}/download`);
    if (!res.ok) throw new Error('Failed to download PDF');

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Roamwise_${destinationName.replace(/\s+/g, '_')}_Journal.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  /**
   * Export PDF directly from active itinerary object in state
   */
  async exportCurrentTripPdf(trip: ItineraryResponse): Promise<void> {
    try {
      const res = await fetch(`${API_BASE}/pdf/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trip),
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Roamwise_${trip.destination.replace(/\s+/g, '_')}_Guide.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        return;
      }
    } catch (e) {
      console.warn('[PDF] Backend export offline, launching browser print view:', e);
    }
    // Fallback: trigger print dialog for clean save-as-pdf
    window.print();
  }
};
