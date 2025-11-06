import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import type { Filters } from '../types';
import SearchIcon from './icons/SearchIcon';

interface FilterPanelProps {
  onSearch: (filters: Filters) => void;
  isLoading: boolean;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ onSearch, isLoading }) => {
  const [filters, setFilters] = useState<Omit<Filters, 'startDate' | 'endDate'>>({
    origin: '',
    destination: '',
    minPrice: 200,
    maxPrice: 1500,
    airline: '',
  });
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isOpen, setIsOpen] = useState(true);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handlePriceChange = (type: 'min' | 'max', value: number) => {
    if (type === 'min') {
      setFilters(prev => ({
        ...prev,
        minPrice: Math.min(value, prev.maxPrice),
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        maxPrice: Math.max(value, prev.minPrice),
      }));
    }
  };

  const onDateChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ ...filters, startDate, endDate });
  };
  
  const MAX_PRICE = 2000;
  const minPricePercent = (filters.minPrice / MAX_PRICE) * 100;
  const maxPricePercent = (filters.maxPrice / MAX_PRICE) * 100;

  const sliderThumbStyles = `
    absolute w-full h-1 appearance-none bg-transparent pointer-events-auto
    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5
    [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-400
    [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2
    [&::-webkit-slider-thumb]:border-slate-900
    focus:outline-none focus:[&::-webkit-slider-thumb]:ring-2 focus:[&::-webkit-slider-thumb]:ring-offset-2
    focus:[&::-webkit-slider-thumb]:ring-cyan-300 focus:[&::-webkit-slider-thumb]:ring-offset-slate-900
    [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full
    [&::-moz-range-thumb]:bg-cyan-400 [&::-moz-range-thumb]:cursor-pointer
    [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-slate-900
  `;

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-20 p-2 bg-slate-800/80 backdrop-blur-sm rounded-md text-white md:hidden hover:bg-slate-700 transition-colors"
        aria-label="Toggle filters"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
        </svg>
      </button>

      <div className={`fixed inset-y-0 left-0 z-10 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out bg-slate-900/50 backdrop-blur-md text-white w-full max-w-sm md:w-80 lg:w-96 p-6 shadow-2xl flex flex-col`}>
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-cyan-300">Flight Finder</h2>
            <button onClick={() => setIsOpen(false)} className="md:hidden text-gray-400 hover:text-white">&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6 flex-grow flex flex-col">
          <div className="space-y-6 flex-grow">
            <div>
              <label htmlFor="origin" className="block text-sm font-medium text-gray-300">Origin</label>
              <input type="text" name="origin" id="origin" value={filters.origin} onChange={handleChange} placeholder="e.g., New York" className="mt-1 block w-full bg-slate-800/70 border border-slate-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"/>
            </div>

            <div>
              <label htmlFor="destination" className="block text-sm font-medium text-gray-300">Destination</label>
              <input type="text" name="destination" id="destination" value={filters.destination} onChange={handleChange} placeholder="e.g., London" className="mt-1 block w-full bg-slate-800/70 border border-slate-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"/>
            </div>

            <div>
              <label htmlFor="airline" className="block text-sm font-medium text-gray-300">Airline</label>
              <input type="text" name="airline" id="airline" value={filters.airline} onChange={handleChange} placeholder="e.g., Gemini Airways" className="mt-1 block w-full bg-slate-800/70 border border-slate-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"/>
            </div>
            
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-300">Date Range</label>
              <DatePicker
                selectsRange={true}
                startDate={startDate}
                endDate={endDate}
                onChange={onDateChange}
                placeholderText="Select a date range"
                className="mt-1 block w-full bg-slate-800/70 border border-slate-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                wrapperClassName="w-full"
              />
            </div>

            <div className="pt-2">
              <label className="block text-sm font-medium text-gray-300">Price Range</label>
               <div className="mt-2 text-center text-lg font-semibold text-cyan-300">
                €{filters.minPrice} - €{filters.maxPrice}
              </div>
              <div className="relative h-5 w-full mt-4 flex items-center">
                  <div className="absolute h-1 w-full bg-slate-700 rounded-full" />
                  <div className="absolute h-1 bg-cyan-400 rounded-full" style={{ left: `${minPricePercent}%`, width: `${maxPricePercent - minPricePercent}%` }} />
                  <input
                      type="range"
                      min="0"
                      max={MAX_PRICE}
                      step="10"
                      value={filters.minPrice}
                      onChange={(e) => handlePriceChange('min', parseInt(e.target.value, 10))}
                      className={sliderThumbStyles}
                  />
                  <input
                      type="range"
                      min="0"
                      max={MAX_PRICE}
                      step="10"
                      value={filters.maxPrice}
                      onChange={(e) => handlePriceChange('max', parseInt(e.target.value, 10))}
                      className={sliderThumbStyles}
                  />
              </div>
            </div>
          </div>

          <button type="submit" disabled={isLoading} className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-slate-900 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors mt-4">
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
              <>
                <SearchIcon className="h-5 w-5" />
                Find Flights
              </>
            )}
          </button>
        </form>
      </div>
    </>
  );
};

export default FilterPanel;