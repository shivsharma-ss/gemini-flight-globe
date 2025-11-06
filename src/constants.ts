import { Flight } from './types';

export const INITIAL_FLIGHTS: Flight[] = [
  {
    airline: "Gemini Airways",
    origin: { name: "New York", lat: 40.7128, lng: -74.0060 },
    destination: { name: "London", lat: 51.5074, lng: -0.1278 },
    price: 650,
    flightNumber: "GA001",
    duration: "7h 30m",
    date: "2025-11-05"
  },
  {
    airline: "Starlight Express",
    origin: { name: "Tokyo", lat: 35.6895, lng: 139.6917 },
    destination: { name: "Sydney", lat: -33.8688, lng: 151.2093 },
    price: 1100,
    flightNumber: "SE202",
    duration: "9h 45m",
    date: "2025-11-06"
  },
  {
    airline: "Aether Airlines",
    origin: { name: "Los Angeles", lat: 34.0522, lng: -118.2437 },
    destination: { name: "Singapore", lat: 1.3521, lng: 103.8198 },
    price: 980,
    flightNumber: "AA789",
    duration: "17h 50m",
    date: "2025-11-05"
  },
  {
    airline: "Quantum Flights",
    origin: { name: "Dubai", lat: 25.276987, lng: 55.296249 },
    destination: { name: "Johannesburg", lat: -26.2041, lng: 28.0473 },
    price: 720,
    flightNumber: "QF456",
    duration: "8h 15m",
    date: "2025-11-07"
  }
];
