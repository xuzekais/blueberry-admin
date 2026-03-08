import request from '../utils/request'

export interface EnumItem {
  id?: number
  category: string
  label: string
  value: string
  sort_order?: number
  is_active?: number
  created_at?: string
  updated_at?: string
}

// 获取全部枚举列表，支持分类筛选
export function getEnums(params?: { category?: string; is_active?: number }) {
  return request({
    url: '/enums',
    method: 'get',
    params
  })
}

// 获取枚举详情
export function getEnumById(id: number) {
  return request({
    url: `/enums/${id}`,
    method: 'get'
  })
}

// 创建新枚举
export function createEnum(data: EnumItem) {
  return request({
    url: '/enums',
    method: 'post',
    data
  })
}

// 更新枚举信息
export function updateEnum(id: number, data: Partial<EnumItem>) {
  return request({
    url: `/enums/${id}`,
    method: 'put',
    data
  })
}

// 删除枚举
export function deleteEnum(id: number) {
  return request({
    url: `/enums/${id}`,
    method: 'delete'
  })
}
