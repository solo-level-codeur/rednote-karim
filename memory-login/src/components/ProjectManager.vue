<template>
  <div class="project-manager">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2><i class="fas fa-folder-open"></i> Mes Projets</h2>
      <button 
        class="btn btn-primary" 
        @click="showCreateModal = true"
      >
        <i class="fas fa-plus"></i> Nouveau Projet
      </button>
    </div>

    <!-- Liste des projets -->
    <div class="row">
      <div class="col-md-6 col-lg-4 mb-3" v-for="project in projects" :key="project.id">
        <div class="card project-card">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start">
              <h5 class="card-title">
                <router-link 
                  :to="`/projects/${project.id}/notes`" 
                  class="text-decoration-none"
                >
                  {{ project.name }}
                </router-link>
              </h5>
              <div class="dropdown">
                <button 
                  class="btn btn-sm btn-outline-secondary dropdown-toggle" 
                  type="button" 
                  :id="`dropdown-${project.id}`"
                  data-bs-toggle="dropdown"
                >
                  <i class="fas fa-ellipsis-v"></i>
                </button>
                <ul class="dropdown-menu">
                  <li>
                    <a class="dropdown-item" href="#" @click="editProject(project)">
                      <i class="fas fa-edit"></i> Modifier
                    </a>
                  </li>
                  <li>
                    <a class="dropdown-item text-danger" href="#" @click="deleteProject(project.id)">
                      <i class="fas fa-trash"></i> Supprimer
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            
            <p class="card-text text-muted">{{ project.description || 'Pas de description' }}</p>
            
            <div class="project-meta">
              <small class="text-muted">
                <i class="fas fa-calendar"></i> 
                Créé le {{ formatDate(project.creation_date) }}
              </small>
              <br>
              <span class="badge" :class="getStatusBadgeClass(project.status)">
                {{ project.status }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Message si pas de projets -->
    <div v-if="projects.length === 0 && !loading" class="text-center py-5">
      <i class="fas fa-folder-open fa-3x text-muted mb-3"></i>
      <h4 class="text-muted">Aucun projet trouvé</h4>
      <p class="text-muted">Créez votre premier projet pour commencer à organiser vos notes</p>
    </div>

    <!-- Modal de création/édition -->
    <ProjectModal 
      v-if="showCreateModal || editingProject"
      :project="editingProject"
      @save="handleSaveProject"
      @cancel="handleCancelProject"
    />

    <!-- Loading -->
    <div v-if="loading" class="text-center py-4">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Chargement...</span>
      </div>
    </div>
  </div>
</template>

<script>
import { projectsAPI } from '@/services/api'
import ProjectModal from './ProjectModal.vue'

export default {
  name: 'ProjectManager',
  components: {
    ProjectModal
  },
  data() {
    return {
      projects: [],
      loading: false,
      showCreateModal: false,
      editingProject: null
    }
  },
  mounted() {
    this.loadProjects()
  },
  methods: {
    async loadProjects() {
      this.loading = true
      try {
        const response = await projectsAPI.getAllProjects()
        this.projects = response.data
      } catch (error) {
        console.error('Erreur lors du chargement des projets:', error)
        this.$toast.error('Erreur lors du chargement des projets')
      } finally {
        this.loading = false
      }
    },

    editProject(project) {
      this.editingProject = { ...project }
    },

    async deleteProject(projectId) {
      if (confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
        try {
          await projectsAPI.deleteProject(projectId)
          this.projects = this.projects.filter(p => p.id !== projectId)
          this.$toast.success('Projet supprimé avec succès')
        } catch (error) {
          console.error('Erreur lors de la suppression:', error)
          this.$toast.error('Erreur lors de la suppression du projet')
        }
      }
    },

    async handleSaveProject(projectData) {
      try {
        if (this.editingProject) {
          // Modification
          const response = await projectsAPI.updateProject(this.editingProject.id, projectData)
          const index = this.projects.findIndex(p => p.id === this.editingProject.id)
          if (index !== -1) {
            this.projects[index] = { ...this.projects[index], ...projectData }
          }
          this.$toast.success('Projet modifié avec succès')
        } else {
          // Création
          const response = await projectsAPI.createProject(projectData)
          this.projects.unshift({
            ...projectData,
            id: response.data.id,
            creation_date: new Date().toISOString(),
            status: 'New'
          })
          this.$toast.success('Projet créé avec succès')
        }
      } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error)
        this.$toast.error('Erreur lors de la sauvegarde du projet')
      }
      this.handleCancelProject()
    },

    handleCancelProject() {
      this.showCreateModal = false
      this.editingProject = null
    },

    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString('fr-FR')
    },

    getStatusBadgeClass(status) {
      const classes = {
        'New': 'bg-info',
        'In Progress': 'bg-primary', 
        'On Hold': 'bg-warning',
        'Completed': 'bg-success',
        'Archived': 'bg-secondary'
      }
      return classes[status] || 'bg-secondary'
    }
  }
}
</script>

<style scoped>
.project-card {
  transition: transform 0.2s, box-shadow 0.2s;
}

.project-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.project-meta {
  margin-top: 1rem;
  padding-top: 0.5rem;
  border-top: 1px solid #eee;
}

.dropdown-toggle::after {
  display: none;
}
</style>