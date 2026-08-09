import { request } from '../../utils/request';

export interface RankItem {
  userId: number;
  userName: string;
  count: number;
  totalArea: number;
}

export interface MyRank {
  byCount: { rank: number | null; total: number; me: RankItem };
  byArea: { rank: number | null; total: number; me: RankItem };
}

export function rankByCount(limit = 50) {
  return request<RankItem[]>({ url: '/api/rankings/by-count', method: 'get', params: { limit } });
}

export function rankByArea(limit = 50) {
  return request<RankItem[]>({ url: '/api/rankings/by-area', method: 'get', params: { limit } });
}

export function getMyRank() {
  return request<MyRank>({ url: '/api/rankings/me', method: 'get' });
}
