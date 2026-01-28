<template>
  <div class="modal fade" id="projectMembersModal" tabindex="-1" aria-labelledby="projectMembersModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-body">
          <!-- Ajouter un membre -->
          <div v-if="isProjectOwner" class="border rounded p-3 mb-4 bg-light">
            <div class="row">
              <div class="col-md-8">
                <label class="form-label">Utilisateur</label>
                <select 
                  class="form-select" 
                  v-model="newMember.userId"
                  :disabled="loadingUsers"
                >
                  <option value="">Sélectionner un utilisateur</option>
                  <option 
                    v-for="user in availableUsers" 
                    :key="user.user_id" 
                    :value="user.user_id"
                  >
                    {{ user.firstname }} {{ user.lastname }} ({{ user.email }})
                  </option>
                </select>
                <div v-if="loadingUsers">...</div>
              </div>
              <div class="col-md-4 d-flex align-items-end">
                <button 
                  type="button" 
                  class="btn btn-success"
                  @click="addMember"
                  :disabled="!newMember.userId || loading"
                >
                  <i class="fas fa-plus"></i> Ajouter
                </button>
              </div>
            </div>
          </div>

          <!-- Liste des membres -->
          <div>
            
            <div v-if="loading">Chargement...</div>

            <div v-else-if="members.length === 0">Aucun membre</div>

            <div v-else class="table-responsive">
              <table class="table table-hover">
                <thead class="table-light">
                  <tr>
                    <th>Membre</th>
                    <th>Rôle</th>
                    <th>Type</th>
                    <th>Date d'ajout</th>
                    <th v-if="isProjectOwner">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="member in members" :key="member.id">
                    <td>{{ member.firstname }} {{ member.lastname }}</td>
                    <td>
                      <span 
                        class="badge"
                        :class="getRoleBadgeClass(member.role)"
                      >
                        Membre
                      </span>
                    </td>
                    <td>
                      <span 
                        class="badge"
                        :class="member.user_type === 'owner' ? 'bg-warning' : 'bg-info'"
                      >
                        {{ member.user_type === 'owner' ? 'Propriétaire' : 'Membre' }}
                      </span>
                    </td>
                    <td>{{ new Date(member.joined_at).toLocaleDateString() }}</td>
                    <td v-if="isProjectOwner && member.user_type !== 'owner'">
                      <div class="btn-group btn-group-sm">
                        <button 
                          type="button" 
                          class="btn btn-outline-primary"
                          @click="editMember(member)"
                          title="Modifier le rôle"
                        >
                          <i class="fas fa-edit"></i>
                        </button>
                        <button 
                          type="button" 
                          class="btn btn-outline-danger"
                          @click="confirmRemoveMember(member)"
                          title="Retirer du projet"
                        >
                          <i class="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                    <td v-else-if="isProjectOwner">
                      <small class="text-muted">Propriétaire</small>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <!-- Bouton fermer -->
          <div class="text-end mt-4">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fermer</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de modification de rôle -->
    <div class="modal fade" id="editRoleModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Modifier le rôle</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div v-if="editingMember">
              <p>
                <strong>{{ editingMember.firstname }} {{ editingMember.lastname }}</strong>
              </p>
              <div class="mb-3">
                <label class="form-label">Nouveau rôle</label>
                <select class="form-select" v-model="editingRole">
                  <option value="Member">Membre</option>
                  <option value="Admin">Administrateur</option>
                  <option value="Viewer">Lecteur</option>
                  <option value="Editor">Éditeur</option>
                </select>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
            <button 
              type="button" 
              class="btn btn-primary"
              @click="updateRole"
              :disabled="loading"
            >
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { projectsAPI, authAPI } from '../services/api'
import { authStore } from '../stores/auth'

export default {
  name: 'ProjectMembersModal',
  props: {
    project: {
      type: Object,
      default: null
    }
  },
  emits: ['members-updated'],
  data() {
    return {
      members: [],
      loading: false,
      loadingUsers: false,
      allUsers: [],
      newMember: {
        userId: '',
        // Plus de rôle
      },
      editingMember: null,
      editingRole: ''
    }
  },
  computed: {
    currentUserId() {
      return authStore.state.user?.id
    },
    isProjectOwner() {
      // Propriétaire du projet OU Manager (peut gérer tous les projets)
      const isOwner = this.project && this.currentUserId && this.project.user_id === this.currentUserId
      const canManage = authStore.canManageProjectMembers()
      return isOwner || canManage
    },
    availableUsers() {
      // Filtrer les utilisateurs qui ne sont pas déjà membres
      const memberIds = this.members.map(m => m.id)
      return this.allUsers.filter(user => !memberIds.includes(user.user_id))
    }
  },
  watch: {
    project: {
      handler(newProject) {
        if (newProject) {
          this.loadMembers()
          this.loadUsers()
        }
      },
      immediate: true
    }
  },
  methods: {
    async loadMembers() {
      if (!this.project) return

      this.loading = true
      try {
        const response = await projectsAPI.getProjectMembers(this.project.project_id)
        this.members = response.data.members || []
        console.log('Membres chargés:', this.members)
      } catch (error) {
        console.error('Erreur lors du chargement des membres:', error)
        this.$emit('show-error', 'Erreur lors du chargement des membres')
      } finally {
        this.loading = false
      }
    },

    async loadUsers() {
      this.loadingUsers = true
      try {
        const response = await authAPI.getAllUsers()
        this.allUsers = response.data.users || []
        console.log('Utilisateurs chargés:', this.allUsers)
      } catch (error) {
        console.error('Erreur lors du chargement des utilisateurs:', error)
        this.$emit('show-error', 'Erreur lors du chargement des utilisateurs')
      } finally {
        this.loadingUsers = false
      }
    },

    async addMember() {
      if (!this.newMember.userId || !this.project) return

      this.loading = true
      try {
        await projectsAPI.addProjectMember(this.project.project_id, {
          userId: parseInt(this.newMember.userId),
          // Plus de rôle nécessaire
        })

        // Recharger la liste
        await this.loadMembers()
        
        // Réinitialiser le formulaire
        this.newMember = { userId: '' }
        
        this.$emit('members-updated')
        console.log('Membre ajouté avec succès')
      } catch (error) {
        console.error('Erreur lors de l\'ajout du membre:', error)
        this.$emit('show-error', 'Erreur lors de l\'ajout du membre')
      } finally {
        this.loading = false
      }
    },

    editMember(member) {
      this.editingMember = member
      // Plus d'édition de rôle
      
      // Fermer le modal principal et ouvrir le modal d'édition
      const mainModal = bootstrap.Modal.getInstance(document.getElementById('projectMembersModal'))
      const editModal = new bootstrap.Modal(document.getElementById('editRoleModal'))
      editModal.show()
    },

    async updateRole() {
      if (!this.editingMember || !this.project) return

      this.loading = true
      try {
        await projectsAPI.updateMemberRole(this.project.project_id, this.editingMember.id, {
          role: this.editingRole
        })

        // Fermer le modal d'édition
        const editModal = bootstrap.Modal.getInstance(document.getElementById('editRoleModal'))
        editModal.hide()

        // Recharger la liste
        await this.loadMembers()
        
        this.$emit('members-updated')
        console.log('Rôle mis à jour avec succès')
      } catch (error) {
        console.error('Erreur lors de la mise à jour du rôle:', error)
        this.$emit('show-error', 'Erreur lors de la mise à jour du rôle')
      } finally {
        this.loading = false
      }
    },

    confirmRemoveMember(member) {
      if (confirm(`Êtes-vous sûr de vouloir retirer ${member.firstname} ${member.lastname} du projet ?`)) {
        this.removeMember(member)
      }
    },

    async removeMember(member) {
      if (!this.project) return

      this.loading = true
      try {
        await projectsAPI.removeProjectMember(this.project.project_id, member.id)

        // Recharger la liste
        await this.loadMembers()
        
        this.$emit('members-updated')
        console.log('Membre retiré avec succès')
      } catch (error) {
        console.error('Erreur lors de la suppression du membre:', error)
        this.$emit('show-error', 'Erreur lors de la suppression du membre')
      } finally {
        this.loading = false
      }
    },

    getRoleBadgeClass(role) {
      const roleClasses = {
        'Admin': 'bg-danger',
        'Member': 'bg-primary',
        'Viewer': 'bg-secondary',
        'Editor': 'bg-success'
      }
      return roleClasses[role] || 'bg-primary'
    }
  }
}
</script>

