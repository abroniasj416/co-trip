import client from './client';

interface ReverseGeocodingResponse {
  address: string | null;
}

export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    const { data } = await client.get<{ success: boolean; data: ReverseGeocodingResponse }>(
      '/api/geocoding/reverse',
      { params: { lat, lng } }
    );
    return data.data.address;
  } catch {
    return null;
  }
}
