import type { TripRequest, ItineraryResponse, SavedTripSummary, Activity } from '../types/itinerary';

const API_BASE = '/api/v1';

export const apiService = {
  /**
   * Generate an itinerary using the Groq AI engine
   */
  async generateItinerary(payload: TripRequest): Promise<ItineraryResponse> {
    const res = await fetch(`${API_BASE}/itinerary/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to generate itinerary' }));
      throw new Error(err.detail || 'Itinerary generation failed');
    }
    return res.json();
  },

  /**
   * Regenerate a specific day in an existing itinerary
   */
  async regenerateDay(
    tripId: string,
    dayNumber: number,
    payload?: { focus?: string; additional_notes?: string }
  ): Promise<ItineraryResponse> {
    const res = await fetch(`${API_BASE}/itinerary/${tripId}/regenerate-day/${dayNumber}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload || {}),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to regenerate day' }));
      throw new Error(err.detail || 'Failed to regenerate day');
    }
    return res.json();
  },

  /**
   * Regenerate full itinerary with Groq
   */
  async regenerateFullItinerary(tripId: string, customInstructions?: string): Promise<ItineraryResponse> {
    const res = await fetch(`${API_BASE}/itinerary/${tripId}/regenerate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ custom_instructions: customInstructions }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to regenerate full itinerary' }));
      throw new Error(err.detail || 'Failed to regenerate full itinerary');
    }
    return res.json();
  },

  /**
   * Update an activity within a trip
   */
  async updateActivity(tripId: string, activityId: string, updates: Partial<Activity>): Promise<ItineraryResponse> {
    const res = await fetch(`${API_BASE}/itinerary/${tripId}/activities/${activityId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update activity');
    return res.json();
  },

  /**
   * Delete an activity from a trip
   */
  async deleteActivity(tripId: string, activityId: string): Promise<ItineraryResponse> {
    const res = await fetch(`${API_BASE}/itinerary/${tripId}/activities/${activityId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete activity');
    return res.json();
  },

  /**
   * List all saved trips
   */
  async listTrips(): Promise<SavedTripSummary[]> {
    const res = await fetch(`${API_BASE}/trips`);
    if (!res.ok) throw new Error('Failed to fetch saved trips');
    return res.json();
  },

  /**
   * Get single trip by ID
   */
  async getTrip(tripId: string): Promise<ItineraryResponse> {
    const res = await fetch(`${API_BASE}/trips/${tripId}`);
    if (!res.ok) throw new Error('Trip not found');
    return res.json();
  },

  /**
   * Save trip explicitly
   */
  async saveTrip(trip: ItineraryResponse): Promise<{ id: string; status: string }> {
    const res = await fetch(`${API_BASE}/trips/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(trip),
    });
    if (!res.ok) throw new Error('Failed to save trip');
    return res.json();
  },

  /**
   * Delete trip by ID
   */
  async deleteTrip(tripId: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/trips/${tripId}`, {
      method: 'DELETE',
    });
    return res.ok;
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
    const res = await fetch(`${API_BASE}/pdf/export`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(trip),
    });
    if (!res.ok) throw new Error('Failed to export PDF');

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Roamwise_${trip.destination.replace(/\s+/g, '_')}_Guide.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
};
