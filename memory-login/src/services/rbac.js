// Service RBAC Frontend
import api from './api'

class RBACService {
  constructor() {
    this.permissionsCache = new Map()
    this.cacheExpiry = 5 * 60 * 1000 // 5 minutes
  }

  async hasPermission(permission) {
    const cacheKey = permission
    const cached = this.permissionsCache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.value
    }

    try {
      const response = await api.get(`/check-permission/${permission}`)
      const hasPermission = response.data.hasPermission
      
      this.permissionsCache.set(cacheKey, {
        value: hasPermission,
        timestamp: Date.now()
      })
      
      return hasPermission
    } catch (error) {
      console.error('Erreur vérification permission:', error)
      return false
    }
  }

  clearCache() {
    this.permissionsCache.clear()
  }

  // Méthodes de compatibilité avec l'ancien système
  async isAdmin() {
    return await this.hasPermission('manage_users')
  }

  async isManager() {
    return await this.hasPermission('manage_projects')
  }

  async canCreateNotes() {
    return await this.hasPermission('create_notes')
  }

  async canEditNotes() {
    return await this.hasPermission('edit_notes')
  }

  async canManageTags() {
    return await this.hasPermission('manage_tags')
  }

  async canManageProjects() {
    return await this.hasPermission('manage_projects')
  }

  async canManageUsers() {
    return await this.hasPermission('manage_users')
  }
}

export default new RBACService()