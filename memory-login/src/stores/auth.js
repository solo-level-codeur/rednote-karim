import { reactive } from 'vue'
import rbac from '../services/rbac'

const state = reactive({
  user: null,
  isAuthenticated: false
  // token supprimé car géré côté serveur dans les cookies httpOnly
})

export const authStore = {
  state,
  
  login(userData) {
    state.user = userData
    state.isAuthenticated = true
    
    // Plus de stockage du token - géré par httpOnly cookies
    localStorage.setItem('user', JSON.stringify(userData))
    
    // Plus de cache RBAC à nettoyer
  },
  
  async logout() {
    try {
      // Appeler l'API pour supprimer le cookie httpOnly
      const { authAPI } = await import('../services/api.js')
      await authAPI.logout()
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
    }
    
    state.user = null
    state.isAuthenticated = false
    
    // Plus de suppression du token - géré par le serveur
    localStorage.removeItem('user')
  },
  
  initializeAuth() {
    const userData = localStorage.getItem('user')
    
    if (userData) {
      try {
        const user = JSON.parse(userData)
        state.user = user
        state.isAuthenticated = true
      } catch (error) {
        console.error('Erreur parsing user data:', error)
        localStorage.removeItem('user')
      }
    }
  },

  // Méthodes utilitaires pour l'affichage
  getUserName() {
    return state.user ? `${state.user.firstname} ${state.user.lastname}` : ''
  },

  getUserEmail() {
    return state.user ? state.user.email : ''
  },

  getRoleName() {
    const user = state.user
    if (!user || !user.role_id) return 'Unknown'
    
    const roleNames = {
      1: 'Admin',
      2: 'Manager', 
      3: 'Developer',
      4: 'Viewer'
    }
    return roleNames[user.role_id] || 'Unknown'
  },

  // Méthodes synchrones pour router guards
  isAdmin() {
    return state.user?.role_id === 1
  },

  isManagerPlus() {
    return state.user?.role_id <= 2
  },

  // Méthodes de compatibilité pour les composants
  canCreateProjects() {
    return rbac.canManageProjects()
  },

  canManageProjects() {
    return rbac.canManageProjects() 
  },

  canEditNotes() {
    return rbac.canEditNotes()
  },

  canCreateNotes() {
    return rbac.canCreateNotes()
  },

  canManageUsers() {
    return rbac.canManageUsers()
  },

  canManageTags() {
    return rbac.canManageTags()
  },

  canManageProjectMembers() {
    return rbac.canManageProjects() // Si on peut gérer projets, on peut gérer membres
  },

  canViewProjects() {
    return state.user?.role_id <= 3 // Tout le monde sauf Viewer
  },

  canDeleteProjects() {
    return rbac.isAdmin() // Seulement Admin
  }
}