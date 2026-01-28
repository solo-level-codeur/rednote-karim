
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
import { authStore } from '../stores/auth'

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
        status: 'New'
      }
    }
  },
  computed: {
    canCreateProject() {
      return authStore.canCreateProjects()
    },
    userRole() {
      return authStore.getRoleName()
    }
  },
  mounted() {
    if (this.project) {
      this.formData = {
        name: this.project.project_name || '',
        description: this.project.description || '',
        status: this.project.status || 'New'
      }
    }
  },
  methods: {
    handleSubmit() {
      if (this.formData.name.trim()) {
        this.$emit('save', this.formData)
      }
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