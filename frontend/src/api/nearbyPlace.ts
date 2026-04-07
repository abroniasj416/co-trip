import client from './client';

export interface NearbyPlaceInfo {
  name: string;
  category: string;
  address: string;
  roadAddress: string;
  telephone: string;
}

export async function fetchNearbyPlace(lat: number, lng: number): Promise<NearbyPlaceInfo | null> {
  try {
    const { data } = await client.get<{ success: boolean; data: NearbyPlaceInfo | null }>(
      '/api/places/nearby',
      { params: { lat, lng } },
    );
    return data.data;
  } catch {
    return null;
  }
}
