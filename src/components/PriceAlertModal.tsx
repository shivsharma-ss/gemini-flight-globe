import React, { useState } from 'react';
import type { Flight, PriceAlert } from '../types';
import BellIcon from './icons/BellIcon';
import XIcon from './icons/XIcon';

interface PriceAlertModalProps {
  flight: Flight;
  onClose: () => void;
  onSetAlert: (alert: PriceAlert) => void;
}

const PriceAlertModal: React.FC<PriceAlertModalProps> = ({ flight, onClose, onSetAlert }) => {
  const [targetPrice, setTargetPrice] = useState(Math.floor(flight.price * 0.9));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSetAlert({
      flightIdentifier: `${flight.flightNumber}-${flight.date}`,
      targetPrice,
      origin: flight.origin.name,
      destination: flight.destination.name,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl w-full max-w-md text-white" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-700 flex justify-between items-center">
          <h3 className="text-xl font-bold text-cyan-300">Set Price Alert</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors" aria-label="Close modal">
            <XIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="p-6">
          <div className="mb-4">
            <p className="font-semibold text-lg">{flight.airline} {flight.flightNumber}</p>
            <p className="text-slate-300">{flight.origin.name} &rarr; {flight.destination.name}</p>
            <p className="text-slate-400 text-sm">{flight.date} &bull; {flight.duration}</p>
            <p className="mt-2">Current Price: <span className="font-bold text-green-400">€{flight.price}</span></p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="targetPrice" className="block text-sm font-medium text-gray-300">
                Notify me when price is below:
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-gray-400 sm:text-sm">€</span>
                </div>
                <input
                  type="number"
                  name="targetPrice"
                  id="targetPrice"
                  className="block w-full rounded-md border-slate-600 bg-slate-700 py-2 pl-7 pr-12 focus:border-cyan-500 focus:ring-cyan-500"
                  placeholder="0.00"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(parseInt(e.target.value, 10))}
                  aria-describedby="price-currency"
                  max={flight.price - 1}
                  step="1"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-slate-800 transition-colors"
            >
              <BellIcon className="h-5 w-5" />
              Set Alert
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PriceAlertModal;
