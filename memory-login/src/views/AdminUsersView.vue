<template>
  <div class="admin-users-view">
    <div class="container-fluid">
      <!-- En-tête -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="mb-0">
            <i class="fas fa-users-cog me-2"></i>
            Administration des utilisateurs
          </h2>
        </div>
      </div>

      <!-- Filtres et recherche -->
      <div class="row mb-4">
        <div class="col-md-6">
          <div class="input-group">
            <span class="input-group-text">
              <i class="fas fa-search"></i>
            </span>
            <input 
              type="text" 
              class="form-control" 
              placeholder="Rechercher par nom, email..." 
              v-model="searchQuery"
            >
          </div>
        </div>
        <div class="col-md-6">
          <select class="form-select" v-model="roleFilter">
            <option value="">Tous les rôles</option>
            <option value="1">Admin</option>
            <option value="2">Manager</option>
            <option value="3">Developer</option>
            <option value="4">Viewer</option>
          </select>
        </div>
      </div>

      <!-- Liste des utilisateurs -->
      <div class="card">
        <div class="card-body">
          <div v-if="loading">Chargement...</div>

          <div v-else-if="filteredUsers.length === 0">Aucun utilisateur trouvé</div>

          <div v-else class="table-responsive">
            <table class="table table-hover">
              <thead class="table-light">
                <tr>
                  <th>Utilisateur</th>
                  <th>Email</th>
                  <th>Rôle</th>
                  <th>Date d'inscription</th>
                  <th class="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in filteredUsers" :key="user.user_id">
                  <td>{{ user.firstname }} {{ user.lastname }}</td>
                  <td>
                    <span class="text-break">{{ user.email }}</span>
                  </td>
                  <td>
                    <span 
                      class="badge" 
                      :class="getRoleBadgeClass(user.role_name)"
                    >
                      {{ user.role_name || 'Non défini' }}
                    </span>
                  </td>
                  <td>{{ new Date(user.created_at).toLocaleDateString() }}</td>
                  <td class="text-end">
                    <div class="btn-group" role="group">
                      <button
                        class="btn btn-sm btn-outline-primary"
                        @click="editUserRole(user)"
                        :disabled="user.user_id === currentUser.id"
                        title="Modifier le rôle"
                      >
                        <i class="fas fa-user-tag"></i>
                      </button>
                      <button
                        class="btn btn-sm btn-outline-danger"
                        @click="confirmDeleteUser(user)"
                        :disabled="user.user_id === currentUser.id"
                        title="Supprimer l'utilisateur"
                      >
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de modification de rôle -->
    <div v-if="showRoleModal" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="fas fa-user-tag me-2"></i>
              Modifier le rôle
            </h5>
            <button type="button" class="btn-close" @click="showRoleModal = false"></button>
          </div>
          <div class="modal-body">
            <p>Modifier le rôle de <strong>{{ editingUser.firstname }} {{ editingUser.lastname }}</strong></p>
            <div class="mb-3">
              <label class="form-label">Nouveau rôle :</label>
              <select class="form-select" v-model="newRole">
                <option value="1">Admin</option>
                <option value="2">Manager</option>
                <option value="3">Developer</option>
                <option value="4">Viewer</option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showRoleModal = false">
              Annuler
            </button>
            <button type="button" class="btn btn-primary" @click="updateRole" :disabled="updating">
              {{ updating ? 'Mise à jour...' : 'Confirmer' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { adminAPI } from '@/services/api'
import { authStore } from '@/stores/auth'

export default {
  name: 'AdminUsersView',
  data() {
    return {
      users: [],
      loading: false,
      searchQuery: '',
      roleFilter: '',
      showRoleModal: false,
      editingUser: null,
      newRole: '',
      updating: false
    }
  },
  computed: {
    currentUser() {
      return authStore.state.user
    },
    filteredUsers() {
      let filtered = this.users

      // Filtrer par recherche
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        filtered = filtered.filter(user => 
          user.firstname.toLowerCase().includes(query) ||
          user.lastname.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query)
        )
      }

      // Filtrer par rôle
      if (this.roleFilter) {
        filtered = filtered.filter(user => {
          // Mapper le nom de rôle vers l'ID
          const roleMap = {
            'Admin': '1',
            'Manager': '2', 
            'Developer': '3',
            'Viewer': '4'
          }
          return roleMap[user.role_name] === this.roleFilter
        })
      }

      return filtered
    }
  },
  async mounted() {
    await this.loadUsers()
  },
  methods: {
    async loadUsers() {
      this.loading = true
      try {
        const response = await adminAPI.getAllUsers()
        this.users = response.data.users
      } catch (error) {
        console.error('Erreur lors du chargement des utilisateurs:', error)
        console.error('Erreur lors du chargement des utilisateurs')
      } finally {
        this.loading = false
      }
    },

    editUserRole(user) {
      this.editingUser = user
      // Mapper le nom de rôle vers l'ID
      const roleMap = {
        'Admin': '1',
        'Manager': '2',
        'Developer': '3',
        'Viewer': '4'
      }
      this.newRole = roleMap[user.role_name] || '3'
      this.showRoleModal = true
    },

    async updateRole() {
      this.updating = true
      try {
        await adminAPI.updateUserRole(this.editingUser.user_id, parseInt(this.newRole))
        console.log('Rôle mis à jour avec succès')
        this.showRoleModal = false
        await this.loadUsers() // Recharger la liste
      } catch (error) {
        console.error('Erreur lors de la mise à jour du rôle:', error)
        console.error('Erreur lors de la mise à jour du rôle')
      } finally {
        this.updating = false
      }
    },

    confirmDeleteUser(user) {
      if (confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${user.firstname} ${user.lastname} ? Cette action est irréversible.`)) {
        this.deleteUser(user)
      }
    },

    async deleteUser(user) {
      try {
        await adminAPI.deleteUser(user.user_id)
        console.log('Utilisateur supprimé avec succès')
        await this.loadUsers() // Recharger la liste
      } catch (error) {
        console.error('Erreur lors de la suppression:', error)
        console.error('Erreur lors de la suppression de l\'utilisateur')
      }
    },

    getRoleBadgeClass(roleName) {
      const classes = {
        'Admin': 'bg-danger',
        'Manager': 'bg-warning text-dark',
        'Developer': 'bg-primary',
        'Viewer': 'bg-secondary'
      }
      return classes[roleName] || 'bg-secondary'
    }
  }
}
</script>

<style scoped>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1055;
}
</style>