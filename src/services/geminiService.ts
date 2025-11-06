import { GoogleGenAI, Type } from '@google/genai';
import type { Filters, Flight } from '../types';

const formatDate = (date: Date | null) => date ? date.toISOString().split('T')[0] : 'any';

const resolvedApiKey = (): string | undefined => {
  const viteKey = import.meta.env?.VITE_GEMINI_API_KEY?.trim();
  if (viteKey) {
    return viteKey;
  }

  const processEnv =
    (typeof globalThis !== 'undefined' &&
      (globalThis as typeof globalThis & {
        process?: { env?: Record<string, string | undefined> };
      }).process?.env) ||
    undefined;

  return processEnv?.VITE_GEMINI_API_KEY?.trim() ?? processEnv?.GEMINI_API_KEY?.trim();
};

const fetchFlights = async (filters: Filters): Promise<Flight[]> => {
  const apiKey = resolvedApiKey();
  if (!apiKey) {
    throw new Error("GEMINI API key is not configured");
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    Generate a list of 15 fictional international flights based on the following criteria.
    If a field is empty or "any", pick popular international options.
    - Origin: ${filters.origin || 'Any major city'}
    - Destination: ${filters.destination || 'Any major city'}
    - Start Date: ${formatDate(filters.startDate)}
    - End Date: ${formatDate(filters.endDate)}
    - Airline: ${filters.airline || 'Any'}
    - Price range: €${filters.minPrice} to €${filters.maxPrice}
    
    Provide realistic city names, IATA codes are not needed. For each flight, include its origin and destination with name, latitude, and longitude.
    Ensure latitudes are between -90 and 90, and longitudes are between -180 and 180.
    The flight date for each generated flight must be within the specified date range.
    The price for each flight must be in Euros and within the specified price range.
  `;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              airline: { type: Type.STRING, description: 'Name of the airline.' },
              flightNumber: { type: Type.STRING, description: 'The flight number, e.g., BA2490.' },
              duration: { type: Type.STRING, description: 'Flight duration, e.g., "8h 45m".' },
              price: { type: Type.NUMBER, description: 'Price in Euros.' },
              date: { type: Type.STRING, description: 'Flight date in YYYY-MM-DD format.' },
              origin: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  lat: { type: Type.NUMBER },
                  lng: { type: Type.NUMBER },
                },
                required: ['name', 'lat', 'lng'],
              },
              destination: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  lat: { type: Type.NUMBER },
                  lng: { type: Type.NUMBER },
                },
                required: ['name', 'lat', 'lng'],
              },
            },
            required: ['airline', 'flightNumber', 'duration', 'price', 'origin', 'destination', 'date'],
          },
        },
      },
    });

    const jsonText = response.text?.trim();
    if (!jsonText) {
      throw new Error("Empty response received from Gemini API.");
    }
    const flightData = JSON.parse(jsonText);
    
    if (!Array.isArray(flightData)) {
      throw new Error("Invalid data format received from API.");
    }

    return flightData as Flight[];

  } catch (error) {
    console.error("Error fetching flight data from Gemini API:", error);
    throw new Error("Failed to generate flight data. Please check your API key and try again.");
  }
};

export { fetchFlights };
