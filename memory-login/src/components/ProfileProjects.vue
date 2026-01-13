<!--
  ProfileProjects.vue
  
  🎯 TABLEAU DES PROJETS UTILISATEUR
  Responsabilité: Affichage tabulaire des projets ouverts avec descriptions
  
  Features:
  - Vue tableau responsive
  - Statuts colorés
  - Barre de progression
  - Descriptions expandables
  - Actions rapides
-->
<template>
  <div class="card shadow-sm">
    <div class="card-header bg-white d-flex justify-content-between align-items-center">
      <h5 class="card-title mb-0 fw-semibold text-dark">
        <i class="fas fa-folder-open me-2 text-primary"></i>
        Projets ouverts
      </h5>
    </div>
    
    <div class="card-body">
      <div v-if="projects.length === 0" class="text-center py-5">
        <div class="mb-4">
          <i class="fas fa-folder text-muted" style="font-size: 4rem;"></i>
        </div>
        <h5 class="text-dark mb-2">Aucun projet ouvert</h5>
        <p class="text-muted">Vos projets apparaîtront ici une fois créés</p>
      </div>
      
      <div v-else class="table-responsive">
        <table class="table table-hover align-middle">
          <thead class="table-light">
            <tr>
              <th scope="col" class="border-0 text-uppercase text-muted small fw-semibold">
                Nom du projet
              </th>
              <th scope="col" class="border-0 text-uppercase text-muted small fw-semibold">
                Statut
              </th>
              <th scope="col" class="border-0 text-uppercase text-muted small fw-semibold">
                Progression
              </th>
              <th scope="col" class="border-0 text-uppercase text-muted small fw-semibold">
                Priorité
              </th>
              <th scope="col" class="border-0 text-uppercase text-muted small fw-semibold">
                Dernière MAJ
              </th>
              <th scope="col" class="border-0 text-uppercase text-muted small fw-semibold">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            <template v-for="project in projects" :key="project.project_id">
              <tr class="project-row">
                <td class="border-0">
                  <div>
                    <h6 class="mb-1 fw-semibold text-dark">{{ project.project_name }}</h6>
                    <button 
                      v-if="project.description"
                      @click="toggleDescription(project.project_id)"
                      class="btn btn-link btn-sm p-0 text-decoration-none"
                    >
                      <i :class="expandedProject === project.project_id ? 'fas fa-chevron-down' : 'fas fa-chevron-right'" 
                         class="me-1 small"></i>
                      {{ expandedProject === project.project_id ? 'Masquer' : 'Voir' }} description
                    </button>
                  </div>
                </td>
                
                <td class="border-0">
                  <span :class="getStatusClass(project.status)" class="badge px-3 py-2">
                    {{ project.status }}
                  </span>
                </td>
                
                <td class="border-0">
                  <div class="d-flex align-items-center">
                    <div class="progress me-3" style="width: 100px; height: 8px;">
                      <div 
                        class="progress-bar" 
                        :class="getProgressClass(project.progress)"
                        :style="{ width: project.progress + '%' }"
                        role="progressbar" 
                        :aria-valuenow="project.progress" 
                        aria-valuemin="0" 
                        aria-valuemax="100"
                      ></div>
                    </div>
                    <span class="badge bg-light text-dark small">{{ project.progress }}%</span>
                  </div>
                </td>
                
                <td class="border-0">
                  <span :class="getPriorityClass(project.priority)" class="badge px-3 py-2">
                    {{ project.priority }}
                  </span>
                </td>
                
                <td class="border-0">
                  <small class="text-muted">{{ formatDate(project.lastUpdate) }}</small>
                </td>
                
                <td class="border-0">
                  <div class="btn-group btn-group-sm" role="group">
                    <button 
                      @click="editProject(project)"
                      class="btn btn-outline-primary btn-sm"
                      title="Modifier"
                    >
                      <i class="fas fa-edit"></i>
                    </button>
                    <button 
                      @click="viewProject(project)"
                      class="btn btn-outline-info btn-sm"
                      title="Voir détails"
                    >
                      <i class="fas fa-eye"></i>
                    </button>
                  </div>
                </td>
              </tr>
              
              <tr v-if="expandedProject === project.project_id" class="project-description">
                <td colspan="6" class="border-0 bg-light">
                  <div class="p-3 rounded">
                    <h6 class="text-primary mb-2">
                      <i class="fas fa-info-circle me-1"></i>
                      Description du projet :
                    </h6>
                    <p class="mb-0 text-dark">{{ project.description }}</p>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProfileProjects',
  props: {
    projects: {
      type: Array,
      default: () => []
    }
  },
  emits: ['project-updated'],
  data() {
    return {
      expandedProject: null
    }
  },
  methods: {
    toggleDescription(projectId) {
      this.expandedProject = this.expandedProject === projectId ? null : projectId
    },
    
    getStatusClass(status) {
      const statusMap = {
        'En cours': 'bg-success text-white',
        'En attente': 'bg-warning text-dark',
        'Terminé': 'bg-info text-white',
        'Suspendu': 'bg-danger text-white'
      }
      return statusMap[status] || 'bg-secondary text-white'
    },
    
    getProgressClass(progress) {
      if (progress >= 80) return 'bg-success'
      if (progress >= 50) return 'bg-warning'
      return 'bg-danger'
    },
    
    getPriorityClass(priority) {
      const priorityMap = {
        'Haute': 'bg-danger text-white',
        'Moyenne': 'bg-warning text-dark',
        'Basse': 'bg-success text-white'
      }
      return priorityMap[priority] || 'bg-secondary text-white'
    },
    
    formatDate(date) {
      if (!date) return '-'
      
      const now = new Date()
      const diff = now - new Date(date)
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      
      if (days === 0) return 'Aujourd\'hui'
      if (days === 1) return 'Hier'
      if (days < 7) return `Il y a ${days} jours`
      
      return new Date(date).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short'
      })
    },
    
    editProject(project) {
      // Emit event for parent to handle
      this.$emit('project-updated', { action: 'edit', project })
    },
    
    viewProject(project) {
      // Emit event for parent to handle  
      this.$emit('project-updated', { action: 'view', project })
    }
  }
}
</script>

<style scoped>
.card {
  border: none;
  border-radius: 8px;
}

/* Styles simples sans animations */
</style>