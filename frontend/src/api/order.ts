import request from '../utils/request';

// 获取列表数据并加入类型定义
export interface OrderQuery {
  page: number;
  limit: number;
  search?: string;
}

export function fetchOrderList(params: OrderQuery) {
  return request({
    url: '/orders',
    method: 'get',
    params
  });
}

// 订单表单类型
export interface OrderModel {
  customer_name: string;
  phone: string;
  address: string;
  item_desc?: string;
  shipping_method?: string;
  total_price?: number;
  status: 'pending' | 'shipped' | 'completed' | 'cancelled';
}

export function createOrder(data: OrderModel) {
  return request({
    url: '/orders',
    method: 'post',
    data
  });
}

export function updateOrder(id: number, data: OrderModel) {
  return request({
    url: `/orders/${id}`,
    method: 'put',
    data
  });
}

export function deleteOrder(id: number) {
  return request({
    url: `/orders/${id}`,
    method: 'delete'
  });
}
