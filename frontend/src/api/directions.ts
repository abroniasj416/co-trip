import client from './client';

interface Point {
  latitude: number;
  longitude: number;
}

export async function getDirections(places: Point[]): Promise<Array<[number, number]>> {
  if (places.length < 2) return [];

  const points = places.map(p => `${p.latitude},${p.longitude}`).join('|');

  try {
    const { data } = await client.get<{ success: boolean; data: Array<[number, number]> }>(
      '/api/directions',
      { params: { points } }
    );
    return data.data ?? [];
  } catch {
    return [];
  }
}
