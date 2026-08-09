import { request } from '../../utils/request';

export type FollowUpMethod = 'phone' | 'wechat' | 'email' | 'onsite' | 'other';
export type FollowUpResult =
  | 'interested'
  | 'negotiating'
  | 'pending_decision'
  | 'not_interested'
  | 'undecided';

export interface FollowUp {
  id: number;
  intakeId: number;
  method: FollowUpMethod;
  content: string;
  followDate: string;
  photos?: string[];
  result: FollowUpResult;
  nextStep?: string;
  createdAt: string;
  operator?: { id: number; name: string; phone: string };
}

export interface CreateFollowUpParams {
  intakeId: number;
  method: FollowUpMethod;
  content: string;
  followDate: string;
  photos?: string[];
  result?: FollowUpResult;
  nextStep?: string;
}

export interface QueryFollowUpParams {
  intakeId?: number;
  method?: FollowUpMethod;
  result?: FollowUpResult;
  page?: number;
  pageSize?: number;
}

export const methodMap: Record<FollowUpMethod, string> = {
  phone: '电话',
  wechat: '微信',
  email: '邮件',
  onsite: '上门',
  other: '其他',
};

export const resultMap: Record<FollowUpResult, { text: string; color: string }> = {
  interested: { text: '有意向', color: 'green' },
  negotiating: { text: '洽谈中', color: 'blue' },
  pending_decision: { text: '待决策', color: 'orange' },
  not_interested: { text: '无意向', color: 'red' },
  undecided: { text: '未定', color: 'default' },
};

export function createFollowUp(data: CreateFollowUpParams) {
  return request<FollowUp>({
    url: '/api/follow-ups',
    method: 'post',
    data,
  });
}

export function listFollowUps(params?: QueryFollowUpParams) {
  return request<FollowUp[] | [FollowUp[], number]>({
    url: '/api/follow-ups',
    method: 'get',
    params,
  });
}

export function listMyFollowUps(params?: QueryFollowUpParams) {
  return request<FollowUp[]>({
    url: '/api/follow-ups/my',
    method: 'get',
    params,
  });
}

export function getFollowUp(id: number) {
  return request<FollowUp>({
    url: `/api/follow-ups/${id}`,
    method: 'get',
  });
}

export function getFollowUpsByIntake(intakeId: number) {
  return request<FollowUp[]>({
    url: '/api/follow-ups',
    method: 'get',
    params: { intakeId },
  });
}
