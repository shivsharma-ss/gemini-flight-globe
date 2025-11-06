export interface Flight {
  airline: string;
  origin: {
    name: string;
    lat: number;
    lng: number;
  };
  destination: {
    name: string;
    lat: number;
    lng: number;
  };
  price: number;
  flightNumber: string;
  duration: string;
  date: string; // YYYY-MM-DD
}

export interface Filters {
  origin: string;
  destination: string;
  startDate: Date | null;
  endDate: Date | null;
  minPrice: number;
  maxPrice: number;
  airline: string;
}

export interface PriceAlert {
  flightIdentifier: string; // e.g., "GA001-2025-11-05"
  targetPrice: number;
  origin: string;
  destination: string;
}
