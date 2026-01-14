import { reactive } from 'vue'

const state = reactive({
  user: null,
  isAuthenticated: false
  // token supprimé car géré côté serveur dans les cookies httpOnly
})

// Définition des rôles (doit correspondre au backend)
const ROLES = {
  ADMIN: 1,
  MANAGER: 2,
  DEVELOPER: 3,
  VIEWER: 4
}

export const authStore = {
  state,
  ROLES,
  
  login(userData) {
    state.user = userData
    state.isAuthenticated = true
    
    // Plus de stockage du token - géré par httpOnly cookies
    localStorage.setItem('user', JSON.stringify(userData))
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
        console.error('Erreur lors de l\'initialisation de l\'authentification:', error)
        this.logout()
      }
    }
  },

  // Helpers pour les permissions
  getUserRole() {
    return state.user?.role_id || ROLES.DEVELOPER // Par défaut Developer
  },

  isAdmin() {
    return this.getUserRole() === ROLES.ADMIN
  },

  isManager() {
    return this.getUserRole() === ROLES.MANAGER
  },

  isDeveloper() {
    return this.getUserRole() === ROLES.DEVELOPER
  },

  isViewer() {
    return this.getUserRole() === ROLES.VIEWER
  },

  canEditNotes() {
    const role = this.getUserRole()
    return [ROLES.ADMIN, ROLES.MANAGER, ROLES.DEVELOPER].includes(role)
  },

  canCreateProjects() {
    return this.getUserRole() === ROLES.MANAGER
  },

  canManageProjectMembers() {
    return this.getUserRole() === ROLES.MANAGER
  },

  hasAdminAccess() {
    const role = this.getUserRole()
    return [ROLES.ADMIN, ROLES.MANAGER].includes(role)
  },

  getRoleName() {
    const roleNames = {
      [ROLES.ADMIN]: 'Admin',
      [ROLES.MANAGER]: 'Manager',
      [ROLES.DEVELOPER]: 'Developer', 
      [ROLES.VIEWER]: 'Viewer'
    }
    return roleNames[this.getUserRole()] || 'Inconnu'
  }
}