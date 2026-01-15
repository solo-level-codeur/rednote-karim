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
    
    // Nettoyer cache RBAC pour nouvelles permissions
    rbac.clearCache()
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
    rbac.clearCache()
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

  // ===========================================
  // NOUVELLES MÉTHODES RBAC (remplacent ROLES)
  // ===========================================

  // Vérification générique de permission
  async hasPermission(permission) {
    if (!state.isAuthenticated) return false
    return await rbac.hasPermission(permission)
  },

  // Méthodes de compatibilité pour l'interface
  async isAdmin() {
    return await rbac.isAdmin()
  },

  async isManager() {
    return await rbac.isManager()
  },

  async canCreateNotes() {
    return await rbac.canCreateNotes()
  },

  async canEditNotes() {
    return await rbac.canEditNotes()
  },

  async canManageTags() {
    return await rbac.canManageTags()
  },

  async canManageProjects() {
    return await rbac.canManageProjects()
  },

  async canManageUsers() {
    return await rbac.canManageUsers()
  },

  // Méthodes de compatibilité avec anciens noms
  async canCreateProjects() {
    return await rbac.canManageProjects()
  },

  async canViewProjects() {
    return await rbac.hasPermission('view_projects')
  },

  async canDeleteProjects() {
    return await rbac.isAdmin()
  },

  async canManageProjectMembers() {
    return await rbac.hasPermission('manage_project_members')
  },

  getRoleName() {
    // Méthode synchrone pour compatibilité
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

  // Méthodes synchrones pour router (basées sur role_id local)
  isAdmin() {
    return state.user?.role_id === 1
  },

  isManagerPlus() {
    return state.user?.role_id <= 2
  },

  // Méthodes utilitaires pour l'affichage
  getUserName() {
    return state.user ? `${state.user.firstname} ${state.user.lastname}` : ''
  },

  getUserEmail() {
    return state.user ? state.user.email : ''
  },

  async getRoleLabel() {
    // Plus de labels hardcodés - on se base sur les permissions
    if (await this.canManageUsers()) return 'Admin'
    if (await this.canManageProjects()) return 'Manager'  
    if (await this.canEditNotes()) return 'Developer'
    return 'Viewer'
  }
}