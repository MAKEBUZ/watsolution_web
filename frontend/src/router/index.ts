import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/auth/LoginView.vue')
    },
    {
      path: '/register',
      redirect: { name: 'login' }
    },
    {
      path: '/noticias',
      name: 'noticias',
      component: () => import('../views/news/NewsListView.vue')
    },
    {
      path: '/portal',
      name: 'user-portal',
      component: () => import('../views/portal/UserPortalView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/pagos',
      name: 'pagos',
      component: () => import('../views/payments/PaymentView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/admin',
      name: 'admin-dashboard',
      redirect: { name: 'admin-summary' },
      component: () => import('../views/admin/DashboardView.vue'),
      meta: { requiresAdmin: true },
      children: [
        {
          path: 'resumen',
          name: 'admin-summary',
          component: () => import('../views/admin/StatsView.vue'),
          meta: { requiresAdmin: true }
        },
        {
          path: 'actividad',
          name: 'admin-activity',
          component: () => import('../views/admin/ActivityView.vue'),
          meta: { requiresAdmin: true }
        },
        {
          path: 'usuarios',
          name: 'admin-users',
          component: () => import('../views/admin/UserManagementView.vue'),
          meta: { requiresAdmin: true }
        },
        {
          path: 'facturacion',
          name: 'admin-billing',
          component: () => import('../views/admin/BillingView.vue'),
          meta: { requiresAdmin: true }
        },
        {
          path: 'noticias',
          name: 'admin-news',
          component: () => import('../views/admin/NewsManagementView.vue'),
          meta: { requiresAdmin: true }
        }
      ]
    }
  ],
  scrollBehavior() {
    return { top: 0 }
  }
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Initialize auth state if not already done
  if (!authStore.isAuthenticated) {
    authStore.checkAuth()
  }

  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin)
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

  if (requiresAdmin) {
    if (authStore.isAdmin) {
      next()
    } else {
      next({ name: 'login' })
    }
  } else if (requiresAuth) {
    if (authStore.isAuthenticated) {
      next()
    } else {
      next({ name: 'login' })
    }
  } else if (to.name === 'login' && authStore.isAuthenticated) {
    // If already logged in and trying to access auth pages, redirect to appropriate portal
    if (authStore.isAdmin) {
      next({ name: 'admin-summary' })
    } else {
      next({ name: 'user-portal' })
    }
  } else {
    next()
  }
})

export default router
