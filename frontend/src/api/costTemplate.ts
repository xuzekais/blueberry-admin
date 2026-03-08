import request from '../utils/request'

export interface CostTemplateItem {
  id?: number
  template_id?: number
  size_type: string
  cost_price: number | string
}

export interface CostTemplate {
  id?: number
  name: string
  is_active: number
  remarks?: string
  effective_time?: string
  items?: CostTemplateItem[]
  created_at?: string
  updated_at?: string
}

export function getCostTemplates() {
  return request({ url: '/cost-templates', method: 'get' })
}

export function createCostTemplate(data: CostTemplate) {
  return request({ url: '/cost-templates', method: 'post', data })
}

export function updateCostTemplate(id: number, data: CostTemplate) {
  return request({ url: `/cost-templates/${id}`, method: 'put', data })
}

export function deleteCostTemplate(id: number) {
  return request({ url: `/cost-templates/${id}`, method: 'delete' })
}