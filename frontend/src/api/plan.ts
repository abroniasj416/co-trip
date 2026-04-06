import apiClient from './client';

export interface CreatePlanRequest {
  title: string;
}

export interface PlanResponse {
  planId: string;
  title: string;
  ownerNickname: string;
  createdAt: string;
}

export interface PlanSummaryResponse {
  planId: string;
  title: string;
  createdAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const planApi = {
  createPlan: (body: CreatePlanRequest) =>
    apiClient.post<ApiResponse<PlanResponse>>('/api/plans', body),

  getPlan: (planId: string) =>
    apiClient.get<ApiResponse<PlanResponse>>(`/api/plans/${planId}`),

  getMyPlans: () =>
    apiClient.get<ApiResponse<PlanSummaryResponse[]>>('/api/plans/mine'),
};
