import React, { useRef, useMemo, useState, useEffect } from 'react';
import Globe from 'react-globe.gl';
import type { Flight } from '../types';

interface GlobeVisualizationProps {
  flights: Flight[];
  onArcClick: (flight: Flight) => void;
}

// Simple hash function to get a color from a string (date)
const stringToColor = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    color += ('00' + value.toString(16)).substr(-2);
  }
  return color;
};

const GlobeVisualization: React.FC<GlobeVisualizationProps> = ({ flights, onArcClick }) => {
  const globeEl = useRef<any>(null);
  const [countries, setCountries] = useState({ features: [] });
  const [hoverArc, setHoverArc] = useState<any | null>(null);

  useEffect(() => {
    // Load country polygons
    fetch('https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson')
      .then(res => res.json())
      .then(setCountries);
  }, []);
  
  const dateColors = useMemo(() => {
    const uniqueDates = [...new Set(flights.map(f => f.date))];
    return uniqueDates.reduce((acc, date) => {
      acc[date] = stringToColor(date);
      return acc;
    }, {} as Record<string, string>);
  }, [flights]);

  const arcsData = useMemo(() => flights.map(flight => ({
    ...flight,
    startLat: flight.origin.lat,
    startLng: flight.origin.lng,
    endLat: flight.destination.lat,
    endLng: flight.destination.lng,
    color: dateColors[flight.date] || '#00ffff',
  })), [flights, dateColors]);

  return (
    <div className="flex-grow h-full w-full cursor-grab active:cursor-grabbing">
      <Globe
        ref={globeEl}
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        
        polygonsData={countries.features}
        polygonCapColor={() => 'rgba(40, 50, 60, 0.7)'}
        polygonSideColor={() => 'rgba(0, 100, 0, 0.15)'}
        polygonStrokeColor={() => '#334155'}

        arcsData={arcsData}
        arcColor="color"
        arcStroke={d => d === hoverArc ? 1 : 0.5}
        arcLabel={(arc: any) => `
          <div class="bg-slate-800 text-white p-2 rounded-md shadow-lg text-sm font-sans">
            <b>${arc.airline} ${arc.flightNumber}</b><br/>
            ${arc.origin.name} &rarr; ${arc.destination.name}<br/>
            Date: ${arc.date}<br/>
            Price: <span class="text-green-400 font-bold">€${arc.price}</span><br/>
            Duration: ${arc.duration}
          </div>
        `}
        onArcHover={setHoverArc}
        onArcClick={(arc: any) => onArcClick(arc)}
        pointsData={[]}
      />
    </div>
  );
};

export default GlobeVisualization;
