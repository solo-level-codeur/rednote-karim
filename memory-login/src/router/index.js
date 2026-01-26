import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import HomeView from '../views/HomeView.vue'
import RegisterView from '../views/RegisterView.vue'
import NotesView from '../views/NotesView.vue'
import ProjectsView from '../views/ProjectsView.vue'
import ProfileView from '../views/ProfileView.vue'
import AdminUsersView from '../views/AdminUsersView.vue'
import TagsView from '../views/TagsView.vue'
import NoteDetailView from '../views/NoteDetailView.vue'
import { authStore } from '../stores/auth'

const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView
  },
  {
    path: '/home',
    name: 'home',
    component: HomeView,
    meta: { requiresAuth: true }
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/notes',
    name: 'notes',
    component: NotesView,
    meta: { requiresAuth: true },
    props: () => ({
      projectId: null,
      key: 'all-notes'
    })
  },
  {
    path: '/projects',
    name: 'projects',
    component: ProjectsView,
    meta: { requiresAuth: true }
  },
  {
    path: '/projects/:projectId/notes',
    name: 'project-notes',
    component: NotesView,
    meta: { requiresAuth: true },
    props: route => ({
      projectId: route.params.projectId,
      key: `project-${route.params.projectId}`
    })
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfileView,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/users',
    name: 'admin-users',
    component: AdminUsersView,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/tags',
    name: 'tags',
    component: TagsView,
    meta: { requiresAuth: true }
  },
  {
    path: '/notes/:id',
    name: 'note-detail',
    component: NoteDetailView,
    meta: { requiresAuth: true },
    props: route => ({
      id: route.params.id
    })
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guards
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin)

  if (requiresAuth && !authStore.state.isAuthenticated) {
    next('/login')
  } else if (requiresAdmin && !authStore.isAdmin()) {
    // Seuls les admins peuvent accéder aux pages admin
    next('/home')
  } else if (to.name === 'login' && authStore.state.isAuthenticated) {
    next('/home')
  } else if (to.name === 'register' && authStore.state.isAuthenticated && !authStore.isAdmin()) {
    // Si connecté mais pas admin, rediriger
    next('/home')
  } else {
    next()
  }
})

export default router