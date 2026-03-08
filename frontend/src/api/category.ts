import request from '../utils/request'

export interface CategoryItem {
  id?: number
  name: string
  code: string
  description?: string
  sort_order?: number
  is_active?: number
  created_at?: string
  updated_at?: string
}

export function getCategories(params?: { is_active?: number }) {
  return request({
    url: '/categories',
    method: 'get',
    params
  })
}

export function getCategoryById(id: number) {
  return request({
    url: `/categories/${id}`,
    method: 'get'
  })
}

export function createCategory(data: CategoryItem) {
  return request({
    url: '/categories',
    method: 'post',
    data
  })
}

export function updateCategory(id: number, data: Partial<CategoryItem>) {
  return request({
    url: `/categories/${id}`,
    method: 'put',
    data
  })
}

export function deleteCategory(id: number) {
  return request({
    url: `/categories/${id}`,
    method: 'delete'
  })
}