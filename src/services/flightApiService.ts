import type { Filters, Flight } from '../types';

const DEFAULT_FLIGHT_LIMIT = 15;
const DEFAULT_BASE_URL = 'https://api.aviationstack.com/v1';

const trimOrUndefined = (value: unknown): string | undefined =>
  typeof value === 'string' ? value.trim() || undefined : undefined;

const resolvedEnv = () => {
  const importMetaEnv = typeof import.meta !== 'undefined' ? (import.meta as any).env ?? {} : {};
  const globalProcessEnv =
    (typeof globalThis !== 'undefined' &&
      (globalThis as typeof globalThis & { process?: { env?: Record<string, string | undefined> } }).process?.env) ||
    undefined;

  return {
    apiKey:
      trimOrUndefined(importMetaEnv.VITE_AVIATIONSTACK_API_KEY) ??
      trimOrUndefined(globalProcessEnv?.VITE_AVIATIONSTACK_API_KEY) ??
      trimOrUndefined(globalProcessEnv?.AVIATIONSTACK_API_KEY),
    baseUrl:
      trimOrUndefined(importMetaEnv.VITE_AVIATIONSTACK_BASE_URL) ??
      trimOrUndefined(globalProcessEnv?.VITE_AVIATIONSTACK_BASE_URL) ??
      trimOrUndefined(globalProcessEnv?.AVIATIONSTACK_BASE_URL) ??
      DEFAULT_BASE_URL,
  };
};

const formatDateParam = (date: Date | null): string | undefined => {
  if (!date) return undefined;

  const localDate = new Date(date);
  const year = localDate.getFullYear();
  const month = String(localDate.getMonth() + 1).padStart(2, '0');
  const day = String(localDate.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

type AirportLookupResult = {
  airport_name?: string;
  city?: string;
  city_name?: string;
  iata_code?: string;
  latitude?: number | string;
  longitude?: number | string;
};

type AviationStackResponse<T> = {
  data?: T[];
  error?: { code?: string; message?: string };
};

interface ResolvedAirport {
  name: string;
  code: string;
  lat: number;
  lng: number;
}

const parseCoordinate = (value?: number | string): number | undefined => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
};

const fetchJson = async <T>(url: string): Promise<T> => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  const json = (await response.json()) as T & { error?: { message?: string } };

  if ((json as any)?.error?.message) {
    throw new Error((json as any).error.message);
  }

  return json;
};

const resolveAirport = async (query: string, apiKey: string, baseUrl: string): Promise<ResolvedAirport> => {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) {
    throw new Error('Please provide both origin and destination airports.');
  }

  const params = new URLSearchParams({
    access_key: apiKey,
    search: trimmedQuery,
    limit: '1',
  });

  const data = await fetchJson<AviationStackResponse<AirportLookupResult>>(
    `${baseUrl}/airports?${params.toString()}`
  );

  const match = data.data?.[0];

  if (!match?.iata_code) {
    throw new Error(`Could not find an airport that matches "${trimmedQuery}".`);
  }

  const lat = parseCoordinate(match.latitude);
  const lng = parseCoordinate(match.longitude);

  if (lat === undefined || lng === undefined) {
    throw new Error(`Location coordinates were not available for "${trimmedQuery}".`);
  }

  return {
    name: match.airport_name || match.city_name || match.city || trimmedQuery,
    code: match.iata_code,
    lat,
    lng,
  };
};

const haversineDistanceKm = (origin: ResolvedAirport, destination: ResolvedAirport): number => {
  const toRadians = (deg: number) => (deg * Math.PI) / 180;
  const earthRadiusKm = 6371;

  const dLat = toRadians(destination.lat - origin.lat);
  const dLon = toRadians(destination.lng - origin.lng);
  const lat1 = toRadians(origin.lat);
  const lat2 = toRadians(destination.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
};

const formatDuration = (
  departureIso?: string,
  arrivalIso?: string,
  fallbackDistanceKm?: number
): string => {
  const parseTime = (value?: string) => {
    if (!value) return undefined;
    const time = Date.parse(value);
    return Number.isFinite(time) ? time : undefined;
  };

  const departure = parseTime(departureIso);
  const arrival = parseTime(arrivalIso);

  let durationMinutes: number;

  if (departure !== undefined && arrival !== undefined && arrival > departure) {
    durationMinutes = Math.round((arrival - departure) / (1000 * 60));
  } else if (fallbackDistanceKm) {
    const averageCruiseSpeedKmH = 850; // typical long-haul commercial jet speed
    durationMinutes = Math.round((fallbackDistanceKm / averageCruiseSpeedKmH) * 60) + 45; // add buffer for taxi/takeoff
  } else {
    durationMinutes = 120;
  }

  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;

  return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
};

const estimatePrice = (distanceKm: number): number => {
  const baseFare = 60;
  const perKm = 0.18;
  const variability = 0.85 + Math.random() * 0.3; // between 0.85x and 1.15x
  const estimated = (baseFare + distanceKm * perKm) * variability;
  return Math.round(Math.max(estimated, 50));
};

const isWithinDateRange = (dateIso: string, start: Date | null, end: Date | null): boolean => {
  if (!dateIso) return true;
  const timestamp = Date.parse(dateIso);
  if (!Number.isFinite(timestamp)) return true;

  const toStartOfDay = (date: Date) => {
    const clone = new Date(date);
    clone.setHours(0, 0, 0, 0);
    return clone.getTime();
  };

  const toEndOfDay = (date: Date) => {
    const clone = new Date(date);
    clone.setHours(23, 59, 59, 999);
    return clone.getTime();
  };

  if (start && timestamp < toStartOfDay(start)) return false;
  if (end && timestamp > toEndOfDay(end)) return false;

  return true;
};

const fetchFlights = async (filters: Filters): Promise<Flight[]> => {
  const { apiKey, baseUrl } = resolvedEnv();

  if (!apiKey) {
    throw new Error('Aviationstack API key is not configured. Please set VITE_AVIATIONSTACK_API_KEY.');
  }

  try {
    const [originAirport, destinationAirport] = await Promise.all([
      resolveAirport(filters.origin, apiKey, baseUrl),
      resolveAirport(filters.destination, apiKey, baseUrl),
    ]);

    const searchParams = new URLSearchParams({
      access_key: apiKey,
      dep_iata: originAirport.code,
      arr_iata: destinationAirport.code,
      limit: '50',
      flight_status: 'scheduled',
    });

    const flightDate = formatDateParam(filters.startDate) ?? formatDateParam(filters.endDate);
    if (flightDate) {
      searchParams.set('flight_date', flightDate);
    }

    if (filters.airline.trim()) {
      searchParams.set('airline_name', filters.airline.trim());
    }

    const response = await fetchJson<AviationStackResponse<any>>(
      `${baseUrl}/flights?${searchParams.toString()}`
    );

    const distanceKm = haversineDistanceKm(originAirport, destinationAirport);

    const flights = (response.data ?? [])
      .map((entry: any): Flight | null => {
        const airlineName = entry.airline?.name || entry.airline?.icao || entry.airline?.iata;
        const flightNumber = entry.flight?.iata || entry.flight?.icao || entry.flight?.number;
        if (!airlineName || !flightNumber) {
          return null;
        }

        const departureTime: string | undefined = entry.departure?.scheduled || entry.departure?.estimated;
        const arrivalTime: string | undefined = entry.arrival?.scheduled || entry.arrival?.estimated;
        const date = entry.flight_date || (departureTime ? departureTime.split('T')[0] : flightDate) || new Date().toISOString().split('T')[0];

        if (!isWithinDateRange(date, filters.startDate, filters.endDate)) {
          return null;
        }

        const price = estimatePrice(distanceKm);
        if (price < filters.minPrice || price > filters.maxPrice) {
          return null;
        }

        return {
          airline: airlineName,
          origin: {
            name: originAirport.name,
            lat: originAirport.lat,
            lng: originAirport.lng,
          },
          destination: {
            name: destinationAirport.name,
            lat: destinationAirport.lat,
            lng: destinationAirport.lng,
          },
          price,
          flightNumber,
          duration: formatDuration(departureTime, arrivalTime, distanceKm),
          date,
        };
      })
      .filter((flight): flight is Flight => flight !== null)
      .slice(0, DEFAULT_FLIGHT_LIMIT);

    if (!flights.length) {
      throw new Error('No flights matched the selected filters. Try adjusting your criteria.');
    }

    return flights;
  } catch (error) {
    console.error('Error fetching flight data from Aviationstack API:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to fetch flight data. Please try again later.');
  }
};

export { fetchFlights };
