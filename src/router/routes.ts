import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    component: () => import('pages/LoginPage.vue')
  },
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', name: 'dashboard', component: () => import('pages/IndexPage.vue') },
      { path: 'carteiras', name: 'carteiras', component: () => import('pages/CarteirasPage.vue') },
      {
        path: 'categorias',
        name: 'categorias',
        component: () => import('pages/CategoriasPage.vue')
      },
      {
        path: 'formas-pagamento',
        name: 'formas-pagamento',
        component: () => import('pages/FormasPagamentoPage.vue')
      },
      { path: 'mercados', name: 'mercados', component: () => import('pages/MercadosPage.vue') },
      {
        path: 'unidades-medida',
        name: 'unidades-medida',
        component: () => import('pages/UnidadesMedidaPage.vue')
      },
      { path: 'produtos', name: 'produtos', component: () => import('pages/ProdutosPage.vue') },
      { path: 'receitas', name: 'receitas', component: () => import('pages/ReceitasPage.vue') },
      { path: 'despesas', name: 'despesas', component: () => import('pages/DespesasPage.vue') }
    ]
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
