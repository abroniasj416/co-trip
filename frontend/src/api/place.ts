import apiClient from './client';
import { Place, PlaceStatus } from '../types/place';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const placeApi = {
  getPlaces: (planId: string) =>
    apiClient.get<ApiResponse<Place[]>>(`/api/plans/${planId}/places`),

  addPlace: (planId: string, body: { name: string; latitude: number; longitude: number; status: PlaceStatus }) =>
    apiClient.post<ApiResponse<Place>>(`/api/plans/${planId}/places`, body),

  updateStatus: (planId: string, placeId: number, status: PlaceStatus) =>
    apiClient.patch<ApiResponse<Place>>(`/api/plans/${planId}/places/${placeId}/status`, { status }),

  updateMemo: (planId: string, placeId: number, memo: string) =>
    apiClient.patch<ApiResponse<Place>>(`/api/plans/${planId}/places/${placeId}/memo`, { memo }),

  updateOrder: (planId: string, placeId: number, order: number) =>
    apiClient.patch<ApiResponse<void>>(`/api/plans/${planId}/places/${placeId}/order`, { order }),

  deletePlace: (planId: string, placeId: number) =>
    apiClient.delete<ApiResponse<void>>(`/api/plans/${planId}/places/${placeId}`),
};
