import { request } from '../../utils/request';

export interface ReferralItem {
  id: number;
  referrerId: number;
  intakeId: number;
  type: string;
  createdAt: string;
  intake?: any;
}

export interface ReferralStats {
  totalCount: number;
  landedCount: number;
  totalArea: number;
}

export function getMyReferrals(params?: { page?: number; limit?: number }) {
  return request<{ list: ReferralItem[]; total: number; page: number; limit: number }>({
    url: '/api/referrals/mine',
    method: 'get',
    params,
  });
}

export function getMyReferralStats() {
  return request<ReferralStats>({ url: '/api/referrals/mine/stats', method: 'get' });
}
