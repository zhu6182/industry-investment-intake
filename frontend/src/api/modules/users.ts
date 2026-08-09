import { request } from '../../utils/request';

export interface InvestmentStaff {
  id: number;
  name: string;
  phone: string;
}

export function listInvestmentStaff() {
  return request<InvestmentStaff[]>({
    url: '/api/users/investment-staff',
    method: 'get',
  });
}
