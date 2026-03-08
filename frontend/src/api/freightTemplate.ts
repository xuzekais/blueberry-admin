import request from '../utils/request'

export interface FreightRule {
  regions: string[];
  sizes: string[];
  is_free: boolean;
  free_weight: number;
  first_weight: number;
  first_price: number;
  extra_weight: number;
  extra_price: number;
}

export interface FreightTemplate {
  id?: number;
  name: string;
  is_default: number;
  remarks?: string;
  effective_time?: string;
  freight_rules: FreightRule[];
  created_at?: string;
  updated_at?: string;
}

export function getFreightTemplates() {
  return request({ url: '/freight-templates', method: 'get' })
}

export function createFreightTemplate(data: FreightTemplate) {
  return request({ url: '/freight-templates', method: 'post', data })
}

export function updateFreightTemplate(id: number, data: FreightTemplate) {
  return request({ url: `/freight-templates/${id}`, method: 'put', data })
}

export function deleteFreightTemplate(id: number) {
  return request({ url: `/freight-templates/${id}`, method: 'delete' })
}
