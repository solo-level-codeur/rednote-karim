// RBAC Frontend - Simple et Professionnel
import { authStore } from '../stores/auth'

class RBACService {
  // Mapping synchronisé avec backend (poc 3/models/rbac.js)
  rolePermissions = {
    1: ['manage_users', 'manage_projects', 'edit_notes', 'create_notes', 'manage_tags', 'view_projects'], // Admin
    2: ['manage_projects', 'edit_notes', 'create_notes', 'manage_tags', 'view_projects'],                  // Manager
    3: ['edit_notes', 'create_notes', 'view_projects'],                                                    // Developer
    4: ['view_projects']                                                                                   // Viewer
  }

  hasPermission(permission) {
    const userRoleId = authStore.state.user?.role_id
    if (!userRoleId) return false
    
    return this.rolePermissions[userRoleId]?.includes(permission) || false
  }

  // Méthodes pratiques pour l'UI
  isAdmin() { 
    return authStore.state.user?.role_id === 1 
  }

  isManager() { 
    return authStore.state.user?.role_id <= 2 
  }

  canCreateNotes() { 
    return this.hasPermission('create_notes') 
  }

  canEditNotes() { 
    return this.hasPermission('edit_notes') 
  }

  canManageTags() { 
    return this.hasPermission('manage_tags') 
  }

  canManageProjects() { 
    return this.hasPermission('manage_projects') 
  }

  canManageUsers() { 
    return this.hasPermission('manage_users') 
  }
}

export default new RBACService()