import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import Layout from '../layout/index.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    component: Layout,
    redirect: '/order',
    children: [
      {
        path: 'order',
        name: 'Order',
        component: () => import('../views/order/index.vue'),
        meta: { title: '蓝莓订单管理' },
      },
      {
        path: 'enum',
        name: 'Enum',
        component: () => import('../views/enum/index.vue'),
        meta: { title: '枚举管理' },
      },
      {
        path: 'category',
        name: 'Category',
        component: () => import('../views/category/index.vue'),
        meta: { title: '分类管理' },
      },
      {
        path: 'cost-template',
        name: 'CostTemplate',
        component: () => import('../views/costTemplate/index.vue'),
        meta: { title: '成本模版管理' },
      },
      {
        path: 'freight-template',
        name: 'FreightTemplate',
        component: () => import('../views/freightTemplate/index.vue'),
        meta: { title: '运费模版管理' },
      }
    ],
  },
  {
    // 捕获 NotFound
    path: '/:catchAll(.*)',
    redirect: '/order',
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
