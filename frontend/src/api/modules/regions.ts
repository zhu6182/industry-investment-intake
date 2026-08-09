import { request } from '../../utils/request';

export interface RegionNode {
  id: number;
  name: string;
  level: number;
  parentId: number | null;
  children?: RegionNode[];
}

export function listRegions() {
  return request<RegionNode[]>({ url: '/api/regions', method: 'get' });
}

export function getRegionTree() {
  return request<RegionNode[]>({ url: '/api/regions/tree', method: 'get' });
}

export function getRegionById(id: number) {
  return request<RegionNode>({ url: `/api/regions/${id}`, method: 'get' });
}

export function getRegionChildren(parentId: number) {
  return request<RegionNode[]>({ url: `/api/regions/${parentId}/children`, method: 'get' });
}

export function createRegion(data: { name: string; level: number; parentId?: number | null }) {
  return request<RegionNode>({ url: '/api/regions', method: 'post', data });
}

export function updateRegion(id: number, data: { name?: string; level?: number; parentId?: number | null }) {
  return request<RegionNode>({ url: `/api/regions/${id}`, method: 'patch', data });
}

export function deleteRegion(id: number) {
  return request<{ success: boolean }>({ url: `/api/regions/${id}`, method: 'delete' });
}
