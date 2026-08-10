import { request } from '../../utils/request';

export interface ProvinceStat {
  name: string;
  code: string;
  enterpriseCount: number;
  totalArea: number;
  landedCount: number;
}

export interface MapTotals {
  totalEnterprises: number;
  totalArea: number;
  totalLanded: number;
  conversionRate: number;
}

export interface MapData {
  provinces: ProvinceStat[];
  totals: MapTotals;
  recent30days: {
    created: number;
    approved: number;
    visited: number;
  };
}

export interface CityStat {
  name: string;
  code: string;
  enterpriseCount: number;
  totalArea: number;
  landedCount: number;
}

export interface CityData {
  cities: CityStat[];
  provinceName: string;
}

export interface StatusItem {
  name: string;
  value: number;
}

export interface TrendData {
  dates: string[];
  created: number[];
  landed: number[];
}

export interface IndustryItem {
  name: string;
  value: number;
}

export interface Summary {
  totalEnterprises: number;
  totalArea: number;
  landedCount: number;
  conversionRate: number;
  pendingCount: number;
  weekNewIntakes: number;
}

export function getAllBiData() {
  return request<any>({ url: '/api/bi/all', method: 'get' });
}

export function getMapData() {
  return request<MapData>({ url: '/api/bi/map', method: 'get' });
}

export function getCityData(provinceCode: string) {
  return request<CityData>({
    url: '/api/bi/map/city',
    method: 'get',
    params: { provinceCode },
  });
}

export function getStatusDistribution() {
  return request<StatusItem[]>({ url: '/api/bi/status', method: 'get' });
}

export function getTrendData(days = 30) {
  return request<TrendData>({
    url: '/api/bi/trend',
    method: 'get',
    params: { days },
  });
}

export function getIndustryDistribution() {
  return request<IndustryItem[]>({ url: '/api/bi/industry', method: 'get' });
}

export function getSummary() {
  return request<Summary>({ url: '/api/bi/summary', method: 'get' });
}
