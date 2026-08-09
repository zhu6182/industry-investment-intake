import { request } from '../../utils/request';

export interface ReviewRecord {
  id: number;
  intakeId: number;
  action: 'approve' | 'reject';
  reason?: string;
  createdAt: string;
  reviewer: { id: number; name: string; phone: string };
  assignedToId?: number | null;
}

export function reviewIntake(
  id: number,
  data: { action: 'approve' | 'reject'; reason?: string; assignToUserId?: number },
) {
  return request<any>({
    url: `/api/intakes/${id}/review`,
    method: 'post',
    data,
  });
}

export function getReviewHistory(intakeId: number) {
  return request<ReviewRecord[]>({
    url: `/api/intakes/${intakeId}/history`,
    method: 'get',
  });
}
