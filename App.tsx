import React, { useState, useCallback } from 'react';
import FilterPanel from './components/FilterPanel';
import GlobeVisualization from './components/GlobeVisualization';
import PriceAlertModal from './components/PriceAlertModal';
import Toast from './components/Toast';
import { fetchFlights } from './services/geminiService';
import type { Flight, Filters, PriceAlert } from './types';
import { INITIAL_FLIGHTS } from './constants';
import PlaneIcon from './components/icons/PlaneIcon';

const App: React.FC = () => {
  const [flights, setFlights] = useState<Flight[]>(INITIAL_FLIGHTS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const checkPriceAlerts = useCallback((newFlights: Flight[], currentAlerts: PriceAlert[]) => {
    if (currentAlerts.length === 0) return;

    for (const alert of currentAlerts) {
      const matchingFlight = newFlights.find(
        (flight) => `${flight.flightNumber}-${flight.date}` === alert.flightIdentifier
      );

      if (matchingFlight && matchingFlight.price < alert.targetPrice) {
        setNotification(
          `Price Alert: Flight ${matchingFlight.flightNumber} from ${matchingFlight.origin.name} to ${matchingFlight.destination.name} is now €${matchingFlight.price}!`
        );
        // Remove the triggered alert
        setPriceAlerts(prev => prev.filter(a => a.flightIdentifier !== alert.flightIdentifier));
        break; 
      }
    }
  }, []);

  const handleSearch = useCallback(async (filters: Filters) => {
    setIsLoading(true);
    setError(null);
    try {
      const newFlights = await fetchFlights(filters);
      setFlights(newFlights);
      checkPriceAlerts(newFlights, priceAlerts);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [priceAlerts, checkPriceAlerts]);
  
  const handleSetPriceAlert = (alert: PriceAlert) => {
    // Avoid duplicate alerts
    if (!priceAlerts.some(a => a.flightIdentifier === alert.flightIdentifier)) {
      setPriceAlerts(prev => [...prev, alert]);
      setNotification(`Alert set for flight ${alert.flightIdentifier.split('-')[0]}! We'll notify you if the price drops below €${alert.targetPrice}.`);
    }
    setSelectedFlight(null);
  };

  const handleArcClick = (flight: Flight) => {
    setSelectedFlight(flight);
  };

  return (
    <main className="relative h-screen w-screen bg-slate-950 flex flex-col md:flex-row overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 md:left-auto md:right-8 md:translate-x-0 p-4 z-10">
          <div className="flex items-center gap-3 text-white bg-slate-900/50 backdrop-blur-sm p-3 rounded-xl border border-slate-700">
            <PlaneIcon className="h-8 w-8 text-cyan-400" />
            <div>
                <h1 className="text-xl font-bold">Gemini Flight Globe</h1>
                <p className="text-xs text-slate-400">AI-Powered Flight Visualization</p>
            </div>
          </div>
      </div>

      <FilterPanel onSearch={handleSearch} isLoading={isLoading} />
      
      <div className="flex-grow h-full w-full relative">
        <GlobeVisualization flights={flights} onArcClick={handleArcClick} />
        {error && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-red-500/80 text-white p-3 rounded-lg shadow-2xl text-sm z-20">
            <strong>Error:</strong> {error}
          </div>
        )}
      </div>

      {selectedFlight && (
        <PriceAlertModal
          flight={selectedFlight}
          onClose={() => setSelectedFlight(null)}
          onSetAlert={handleSetPriceAlert}
        />
      )}

      {notification && (
         <Toast message={notification} onClose={() => setNotification(null)} />
      )}
    </main>
  );
};

export default App;
