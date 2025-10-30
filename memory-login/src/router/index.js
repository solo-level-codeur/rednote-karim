import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue' // Nouvel import
import RegisterView from '../views/RegisterView.vue'
import NotesView from '../views/NotesView.vue'
import ProjectsView from '../views/ProjectsView.vue'
import { authStore } from '../stores/auth'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView
  },
  {
    path: '/dashboard', // Nouvelle route
    name: 'dashboard',
    component: DashboardView,
    meta: { requiresAuth: true }
  },
  {
    path:'/register',
    name:'register',
    component: RegisterView
  },
  {
    path: '/notes',
    name: 'notes',
    component: NotesView,
    meta: { requiresAuth: true }
  },
  {
    path: '/projects',
    name: 'projects',
    component: ProjectsView,
    meta: { requiresAuth: true }
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guards
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  
  if (requiresAuth && !authStore.state.isAuthenticated) {
    next('/login')
  } else if ((to.name === 'login' || to.name === 'register') && authStore.state.isAuthenticated) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router