<template>
  <div class="project-manager">
    <div class="d-flex justify-content-end mb-4">
      <button 
        class="btn btn-primary" 
        @click="showCreateModal = true"
      >
        <i class="fas fa-plus"></i> Nouveau Projet
      </button>
    </div>

    <!-- Liste des projets -->
    <div class="row">
      <div class="col-md-6 col-lg-4 mb-3" v-for="project in projects" :key="project.project_id">
        <div class="card project-card">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start">
              <h5 class="card-title">
                <router-link 
                  :to="`/projects/${project.project_id}/notes`" 
                  class="text-decoration-none"
                >
                  {{ project.project_name }}
                </router-link>
              </h5>
              <div class="btn-group-vertical btn-group-sm">
                <button 
                  type="button"
                  class="btn btn-sm btn-outline-primary"
                  @click="editProject(project)"
                  title="Modifier"
                >
                  <i class="fas fa-edit"></i>
                </button>
                <button 
                  type="button"
                  class="btn btn-sm btn-outline-info"
                  @click="manageMembers(project)"
                  data-bs-toggle="modal" 
                  data-bs-target="#projectMembersModal"
                  title="Gérer les membres"
                >
                  <i class="fas fa-users"></i>
                </button>
                <button 
                  type="button"
                  class="btn btn-sm btn-outline-danger"
                  @click="deleteProject(project.project_id)"
                  title="Supprimer"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
            
            <p class="card-text text-muted">{{ project.description || 'Pas de description' }}</p>
            
            <div class="project-meta">
              <small class="text-muted">
                <i class="fas fa-calendar"></i> 
                Créé le {{ formatDate(project.created_at) }}
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

    <!-- Modal de gestion des membres -->
    <ProjectMembersModal 
      :project="managingMembersProject"
      @members-updated="handleMembersUpdated"
      @show-error="handleError"
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
import ProjectMembersModal from './ProjectMembersModal.vue'

export default {
  name: 'ProjectManager',
  components: {
    ProjectModal,
    ProjectMembersModal
  },
  data() {
    return {
      projects: [],
      loading: false,
      showCreateModal: false,
      editingProject: null,
      managingMembersProject: null,
      error: null
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
        console.error('Erreur lors du chargement des projets:', error)
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
          this.projects = this.projects.filter(p => p.project_id !== projectId)
          console.log('Projet supprimé avec succès')
        } catch (error) {
          console.error('Erreur lors de la suppression:', error)
          console.error('Erreur lors de la suppression du projet:', error)
        }
      }
    },

    async handleSaveProject(projectData) {
      try {
        if (this.editingProject) {
          // Modification
          const response = await projectsAPI.updateProject(this.editingProject.project_id, projectData)
          const index = this.projects.findIndex(p => p.project_id === this.editingProject.project_id)
          if (index !== -1) {
            this.projects[index] = { ...this.projects[index], ...projectData }
          }
          console.log('Projet modifié avec succès')
        } else {
          // Création
          const response = await projectsAPI.createProject({
            name: projectData.name,
            description: projectData.description
          })
          
          const newProject = {
            ...projectData,
            project_id: response.data.project_id,
            created_at: new Date().toISOString(),
            status: 'New'
          }
          
          this.projects.unshift(newProject)
          
          // Ajouter les membres si spécifiés
          if (projectData.members && projectData.members.length > 0) {
            console.log('🔄 Ajout des membres au nouveau projet:', projectData.members)
            
            for (const member of projectData.members) {
              try {
                await projectsAPI.addProjectMember(newProject.project_id, {
                  userId: member.userId,
                  role: member.role
                })
                console.log(`✅ Membre ${member.userId} ajouté avec le rôle ${member.role}`)
              } catch (memberError) {
                console.error(`❌ Erreur lors de l'ajout du membre ${member.userId}:`, memberError)
                // Ne pas faire échouer la création pour une erreur d'ajout de membre
              }
            }
          }
          
          console.log('Projet créé avec succès')
        }
      } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error)
        console.error('Erreur lors de la sauvegarde du projet:', error)
      }
      this.handleCancelProject()
    },

    handleCancelProject() {
      this.showCreateModal = false
      this.editingProject = null
    },

    manageMembers(project) {
      console.log('🚀 Ouverture modal membres pour projet:', project?.project_name)
      this.managingMembersProject = project
      // Le modal s'ouvrira automatiquement grâce aux attributs data-bs-*
    },

    handleMembersUpdated() {
      console.log('✅ Membres mis à jour, rechargement des projets...')
      this.loadProjects()
    },

    handleError(message) {
      this.error = message
      console.error(message)
      // Effacer l'erreur après 5 secondes
      setTimeout(() => {
        this.error = null
      }, 5000)
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

.project-meta {
  margin-top: 1rem;
  padding-top: 0.5rem;
  border-top: 1px solid #eee;
}

.btn-group-vertical .btn {
  border-radius: 0.25rem !important;
  margin-bottom: 2px;
}

.btn-group-vertical .btn:last-child {
  margin-bottom: 0;
}
</style>