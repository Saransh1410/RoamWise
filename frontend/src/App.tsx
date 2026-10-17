import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { TripWizard } from './components/TripWizard';
import { TripDetailsView } from './components/TripDetailsView';
import { SavedTripsPage } from './pages/SavedTripsPage';
import { Footer } from './components/Footer';
import type { ItineraryResponse } from './types/itinerary';

function AppContent() {
  const [activeTrip, setActiveTrip] = useState<ItineraryResponse | null>(null);
  const navigate = useNavigate();

  const handleTripGenerated = (trip: ItineraryResponse) => {
    setActiveTrip(trip);
    navigate('/');
  };

  const handleNewTrip = () => {
    setActiveTrip(null);
    navigate('/');
  };

  const handleSelectTrip = (trip: ItineraryResponse) => {
    setActiveTrip(trip);
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#1C1917]">
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
                <TripWizard onTripGenerated={handleTripGenerated} />
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
