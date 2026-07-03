import { route } from 'quasar/wrappers'
import { createRouter, createMemoryHistory, createWebHashHistory, createWebHistory } from 'vue-router'
import routes from './routes'

export default route(function () {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory)

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE)
  })

  // Guarda de rota (bloco autenticacao): protege rotas com requiresAuth
  Router.beforeEach((to, from, next) => {
    const requiresAuth = to.matched.some((r) => r.meta.requiresAuth)
    const token = localStorage.getItem('cd_access_token')
    if (requiresAuth && !token) next({ path: '/login' })
    else next()
  })

  return Router
})
