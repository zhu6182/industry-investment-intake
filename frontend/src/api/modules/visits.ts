import { request } from '../../utils/request';

export interface Visit {
  id: number;
  intakeId: number;
  companyName?: string;
  visitDate: string;
  visitLocation: string;
  visitContent: string;
  photos?: string[];
  applicationRegionId?: number;
  area?: number;
  createdAt: string;
  operator?: { id: number; name: string; phone: string };
  region?: { id: number; name: string; level: number; parentId?: number };
}

export interface CreateVisitParams {
  intakeId: number;
  visitDate: string;
  visitLocation: string;
  visitContent: string;
  photos?: string[];
  applicationRegionId?: number;
  area?: number;
}

export interface QueryVisitParams {
  intakeId?: number;
  keyword?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

export function createVisit(data: CreateVisitParams) {
  return request<Visit>({
    url: '/api/visits',
    method: 'post',
    data,
  });
}

export function listVisits(params?: QueryVisitParams) {
  return request<Visit[] | [Visit[], number]>({
    url: '/api/visits',
    method: 'get',
    params,
  });
}

export function listMyVisits(params?: QueryVisitParams) {
  return request<Visit[]>({
    url: '/api/visits/my',
    method: 'get',
    params,
  });
}

export function getVisit(id: number) {
  return request<Visit>({
    url: `/api/visits/${id}`,
    method: 'get',
  });
}

export function getVisitsByIntake(intakeId: number) {
  return request<Visit[]>({
    url: '/api/visits',
    method: 'get',
    params: { intakeId },
  });
}
