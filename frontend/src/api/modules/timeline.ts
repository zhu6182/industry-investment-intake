import { request } from '../../utils/request';

export interface TimelineEvent {
  type:
    | 'intake_created'
    | 'tyc_verified'
    | 'review'
    | 'report_generated'
    | 'follow_up'
    | 'visit';
  time: string;
  title: string;
  description: string;
  actor: string;
  data: any;
}

export interface DashboardStats {
  pendingCount: number;
  myActiveCount: number;
  followUpThisMonth: number;
  visitThisMonth: number;
}

export function getTimeline(intakeId: number) {
  return request<TimelineEvent[]>({
    url: `/api/timeline/${intakeId}`,
    method: 'get',
  });
}

export function getDashboardStats() {
  return request<DashboardStats>({
    url: '/api/stats/dashboard',
    method: 'get',
  });
}

export function getTeamStats() {
  return request<any>({
    url: '/api/stats/team',
    method: 'get',
  });
}
