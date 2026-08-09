import { request } from '@/utils/request';

export interface DuplicateCheckLog {
  id: number;
  companyName: string;
  intakeId: number;
  intakeCompanyName: string;
  intakeStatus: string;
  intakeCreatedAt: string;
  checkerId: number;
  checkerName: string;
  checkerPhone: string;
  sourceIp?: string;
  createdAt: string;
  checker?: {
    id: number;
    name: string;
    phone: string;
    email?: string;
  };
}

export interface QueryLogParams {
  companyName?: string;
  checkerPhone?: string;
  intakeStatus?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

export interface QueryLogResult {
  items: DuplicateCheckLog[];
  total: number;
  page: number;
  pageSize: number;
}

export function queryDuplicateCheckLogs(params: QueryLogParams) {
  return request<QueryLogResult>({
    url: '/api/duplicate-check-logs/query',
    method: 'post',
    data: params,
  });
}

export function getDuplicateCheckLog(id: number) {
  return request<DuplicateCheckLog>({
    url: `/api/duplicate-check-logs/${id}`,
    method: 'get',
  });
}

export interface DuplicateCheckLogSummary {
  last30DaysCount: number;
  topDuplicatedCompanies: Array<{ companyName: string; count: number }>;
  topCheckers: Array<{ checkerName: string; checkerPhone: string; count: number }>;
}

export function getDuplicateCheckLogSummary() {
  return request<DuplicateCheckLogSummary>({
    url: '/api/duplicate-check-logs/stats/summary',
    method: 'get',
  });
}
