import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ExploreGallery } from './components/ExploreGallery';
import { TripWizard } from './components/TripWizard';
import { TripDetailsView } from './components/TripDetailsView';
import { SavedTripsPage } from './pages/SavedTripsPage';
import { Footer } from './components/Footer';
import type { ItineraryResponse } from './types/itinerary';
import type { CuratedDestination } from './data/curatedDestinations';

function AppContent() {
  const [activeTrip, setActiveTrip] = useState<ItineraryResponse | null>(null);
  const [prefilledDest, setPrefilledDest] = useState<string>('Jaipur, Rajasthan');
  const [prefilledDuration, setPrefilledDuration] = useState<number>(4);
  const [prefilledStyle, setPrefilledStyle] = useState<string>('cultural');
  const navigate = useNavigate();

  const handleTripGenerated = (trip: ItineraryResponse) => {
    setActiveTrip(trip);
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNewTrip = () => {
    setActiveTrip(null);
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectTrip = (trip: ItineraryResponse) => {
    setActiveTrip(trip);
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCuratedDestination = (dest: CuratedDestination) => {
    setPrefilledDest(dest.name);
    setPrefilledDuration(dest.durationDays);
    setPrefilledStyle(dest.defaultTravelStyle);
    const wizardEl = document.getElementById('planner-wizard');
    if (wizardEl) {
      wizardEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToWizard = () => {
    const wizardEl = document.getElementById('planner-wizard');
    if (wizardEl) {
      wizardEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToGallery = () => {
    const galleryEl = document.getElementById('explore-gallery');
    if (galleryEl) {
      galleryEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-slate-900 font-sans selection:bg-amber-200 selection:text-slate-900">
      <Navbar onNewTrip={handleNewTrip} />

      <main className="flex-1">
        <Routes>
          <Route
            path="/"
            element={
              activeTrip ? (
                <TripDetailsView
                  trip={activeTrip}
                  onTripUpdated={(updated) => setActiveTrip(updated)}
                  onNewTripRequest={handleNewTrip}
                />
              ) : (
                <>
                  <Hero onStartPlanning={scrollToWizard} onExploreVibes={scrollToGallery} />
                  <ExploreGallery onSelectDestination={handleSelectCuratedDestination} />
                  <TripWizard
                    onTripGenerated={handleTripGenerated}
                    initialDestination={prefilledDest}
                    initialDuration={prefilledDuration}
                    initialStyle={prefilledStyle}
                  />
                </>
              )
            }
          />
          <Route
            path="/saved"
            element={<SavedTripsPage onSelectTrip={handleSelectTrip} />}
          />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
