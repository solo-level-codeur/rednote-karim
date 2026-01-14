import { reactive } from 'vue'

const state = reactive({
  user: null,
  token: null,
  isAuthenticated: false
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
    state.token = userData.token
    state.isAuthenticated = true
    
    localStorage.setItem('authToken', userData.token)
    localStorage.setItem('user', JSON.stringify(userData))
  },
  
  logout() {
    state.user = null
    state.token = null
    state.isAuthenticated = false
    
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
  },
  
  initializeAuth() {
    const token = localStorage.getItem('authToken')
    const userData = localStorage.getItem('user')
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData)
        state.user = user
        state.token = token
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