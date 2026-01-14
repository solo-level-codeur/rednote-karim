
<template>
  <div class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            {{ project ? 'Modifier le projet' : 'Nouveau projet' }}
          </h5>
          <button type="button" class="btn-close" @click="$emit('cancel')"></button>
        </div>
        
        <!-- Vérification des permissions pour créer un projet -->
        <div v-if="!project && !canCreateProject" class="modal-body">
          <div class="alert alert-warning">
            <i class="fas fa-exclamation-triangle me-2"></i>
            <strong>Accès restreint</strong><br>
            Seuls les Managers peuvent créer de nouveaux projets.<br>
            Votre rôle actuel : {{ userRole }}
          </div>
        </div>

        <form v-else @submit.prevent="handleSubmit">
          <div class="modal-body">
            <div class="mb-3">
              <label for="projectName" class="form-label">Nom du projet *</label>
              <input 
                type="text" 
                class="form-control" 
                id="projectName"
                v-model="formData.name"
                required
                maxlength="100"
              >
            </div>
            
            <div class="mb-3">
              <label for="projectDescription" class="form-label">Description</label>
              <textarea 
                class="form-control" 
                id="projectDescription"
                v-model="formData.description"
                rows="3"
                placeholder="Description du projet..."
              ></textarea>
            </div>

            <div class="mb-3" v-if="project">
              <label for="projectStatus" class="form-label">Statut</label>
              <select class="form-select" id="projectStatus" v-model="formData.status">
                <option value="New">Nouveau</option>
                <option value="In Progress">En cours</option>
                <option value="On Hold">En pause</option>
                <option value="Completed">Terminé</option>
                <option value="Archived">Archivé</option>
              </select>
            </div>

            <!-- Section membres (seulement lors de la création) -->
            <div v-if="!project" class="mb-3">
              <div class="border rounded p-3 bg-light">
                <h6 class="mb-3">
                  <i class="fas fa-users me-2"></i>
                  Ajouter des membres (optionnel)
                </h6>
                
                <!-- Ajouter un membre -->
                <div class="row mb-2">
                  <div class="col-md-5">
                    <select 
                      class="form-select form-select-sm" 
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
                    <div v-if="loadingUsers" class="form-text">
                      <i class="spinner-border spinner-border-sm me-1"></i>
                      Chargement...
                    </div>
                  </div>
                  <div class="col-md-4">
                    <select class="form-select form-select-sm" v-model="newMember.role">
                      <option value="Member">Membre</option>
                      <option value="Admin">Administrateur</option>
                      <option value="Viewer">Lecteur</option>
                      <option value="Editor">Éditeur</option>
                    </select>
                  </div>
                  <div class="col-md-3">
                    <button 
                      type="button" 
                      class="btn btn-sm btn-outline-success w-100"
                      @click="addMemberToList"
                      :disabled="!newMember.userId"
                    >
                      <i class="fas fa-plus"></i>
                    </button>
                  </div>
                </div>

                <!-- Liste des membres à ajouter -->
                <div v-if="formData.members.length > 0">
                  <small class="text-muted mb-2 d-block">Membres à ajouter :</small>
                  <div class="d-flex flex-wrap gap-2">
                    <span 
                      v-for="(member, index) in formData.members" 
                      :key="index"
                      class="badge bg-primary d-flex align-items-center"
                    >
                      {{ getUserDisplayName(member.userId) }} ({{ member.role }})
                      <button 
                        type="button" 
                        class="btn-close btn-close-white ms-2"
                        style="font-size: 0.7em;"
                        @click="removeMemberFromList(index)"
                      ></button>
                    </span>
                  </div>
                </div>
                
                <small class="text-muted">
                  <i class="fas fa-info-circle me-1"></i>
                  Vous pouvez ajouter des membres maintenant ou plus tard via "Gérer les membres"
                </small>
              </div>
            </div>
          </div>
          
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="$emit('cancel')">
              Annuler
            </button>
            <button type="submit" class="btn btn-primary" :disabled="!formData.name.trim()">
              {{ project ? 'Modifier' : 'Créer' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { authAPI } from '../services/api'

export default {
  name: 'ProjectModal',
  props: {
    project: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      formData: {
        name: '',
        description: '',
        status: 'New',
        members: []
      },
      newMember: {
        userId: '',
        role: 'Member'
      },
      allUsers: [],
      loadingUsers: false
    }
  },
  computed: {
    availableUsers() {
      // Filtrer les utilisateurs qui ne sont pas déjà dans la liste des membres
      const memberIds = this.formData.members.map(m => m.userId)
      return this.allUsers.filter(user => !memberIds.includes(user.user_id))
    },
    canCreateProject() {
      return this.$store?.authStore?.canCreateProjects() || authStore.canCreateProjects()
    },
    userRole() {
      return authStore.getRoleName()
    }
  },
  async mounted() {
    if (this.project) {
      this.formData = {
        name: this.project.project_name || '',
        description: this.project.description || '',
        status: this.project.status || 'New',
        members: [] // Pas de gestion des membres en modification
      }
    }
    // Charger les utilisateurs pour la sélection
    await this.loadUsers()
  },
  methods: {
    async loadUsers() {
      this.loadingUsers = true
      try {
        const response = await authAPI.getAllUsers()
        this.allUsers = response.data.users || []
      } catch (error) {
        console.error('Erreur lors du chargement des utilisateurs:', error)
      } finally {
        this.loadingUsers = false
      }
    },

    handleSubmit() {
      if (this.formData.name.trim()) {
        this.$emit('save', this.formData)
      }
    },

    getUserDisplayName(userId) {
      const user = this.allUsers.find(u => u.user_id === userId)
      if (user) {
        return `${user.firstname} ${user.lastname}`
      }
      return `ID: ${userId}`
    },

    addMemberToList() {
      if (!this.newMember.userId) return

      // Vérifier qu'il n'est pas déjà dans la liste
      const exists = this.formData.members.some(m => m.userId === parseInt(this.newMember.userId))
      if (exists) {
        alert('Cet utilisateur est déjà dans la liste')
        return
      }

      this.formData.members.push({
        userId: parseInt(this.newMember.userId),
        role: this.newMember.role
      })

      // Réinitialiser le formulaire
      this.newMember = { userId: '', role: 'Member' }
    },

    removeMemberFromList(index) {
      this.formData.members.splice(index, 1)
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