export type PlaceStatus = 'CANDIDATE' | 'CONFIRMED';

export interface Place {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  status: PlaceStatus;
  memo: string | null;
  placeOrder: number;
  createdBy: string;
  createdAt: string;
}
