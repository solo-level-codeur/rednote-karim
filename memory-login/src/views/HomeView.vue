<template>
  <div class="d-flex min-vh-100 bg-light">
    <Sidebar />
    
    <main class="flex-grow-1 ms-5" style="margin-left: 250px !important;">
      <div class="container-fluid p-4">
        <!-- Section héro -->
        <div class="bg-white p-4 rounded shadow-sm mb-5">
          <h1 class="display-6 fw-bold text-dark mb-2">Bienvenue sur Elite Memory</h1>
          <p class="text-muted mb-0">Centralisez et organisez vos connaissances techniques</p>
        </div>

        <!-- Cards de statistiques -->
        <div class="row g-4 mb-5">
          <!-- Total Notes -->
          <div class="col-md-6">
            <div class="card h-100 border-0 shadow-sm">
              <div class="card-body d-flex align-items-center">
                <div class="bg-primary text-white rounded me-3 d-flex align-items-center justify-content-center" style="width: 48px; height: 48px; font-size: 1.25rem;">
                  <i class="fas fa-sticky-note"></i>
                </div>
                <div>
                  <h3 class="fs-2 fw-bold mb-0 text-dark">{{ stats.totalNotes }}</h3>
                  <p class="text-muted small mb-0">Total Notes</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Projets actifs -->
          <div class="col-md-6">
            <div class="card h-100 border-0 shadow-sm">
              <div class="card-body d-flex align-items-center">
                <div class="bg-warning text-white rounded me-3 d-flex align-items-center justify-content-center" style="width: 48px; height: 48px; font-size: 1.25rem;">
                  <i class="fas fa-folder"></i>
                </div>
                <div>
                  <h3 class="fs-2 fw-bold mb-0 text-dark">{{ stats.activeProjects }}</h3>
                  <p class="text-muted small mb-0">Projets actifs</p>
                </div>
              </div>
            </div>
          </div>
        </div>


        <!-- Notes récentes -->
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-white border-0">
            <h5 class="mb-0">Notes récentes</h5>
          </div>
          
          <div class="card-body p-0">
            <!-- Liste des notes -->
            <div v-if="recentNotes.length > 0">
              <div 
                v-for="note in recentNotes" 
                :key="note.note_id"
                class="list-group-item list-group-item-action border-0 border-bottom"
                style="cursor: pointer;"
                @click="openNote(note)"
              >
                <div class="d-flex justify-content-between align-items-start">
                  <div class="flex-grow-1">
                    <h6 class="mb-2 fw-semibold">{{ note.title || 'Sans titre' }}</h6>
                    <div class="d-flex gap-3 mb-2">
                      <small class="text-muted">
                        <i class="fas fa-folder me-1"></i>{{ note.project_name || 'Elite Memory' }}
                      </small>
                      <small class="text-muted">{{ formatDate(note.updated_at || note.created_at) }}</small>
                    </div>
                    <p class="text-muted small mb-2">{{ getTextPreview(note.content) }}</p>
                    
                    <!-- Tags Bootstrap -->
                    <div v-if="note.tags && note.tags.length > 0" class="d-flex gap-1">
                      <span 
                        v-for="tag in note.tags.slice(0, 3)" 
                        :key="tag.id"
                        class="badge bg-secondary rounded-pill"
                        style="font-size: 0.75rem"
                      >
                        {{ tag.name }}
                      </span>
                      <span v-if="note.tags.length > 3" class="badge bg-light text-dark rounded-pill" style="font-size: 0.75rem">
                        +{{ note.tags.length - 3 }}
                      </span>
                    </div>
                  </div>
                  
                  <div class="ms-3 text-muted">
                    <i class="fas fa-external-link-alt"></i>
                  </div>
                </div>
              </div>
            </div>

            <!-- État vide -->
            <div v-else class="text-center py-5">
              <i class="fas fa-sticky-note fa-3x text-muted mb-3"></i>
              <h6 class="text-muted">Aucune note récente</h6>
              <p class="text-muted small">Utilisez le menu "Notes" pour créer votre première note</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { notesAPI, projectsAPI } from '../services/api'
import { authStore } from '../stores/auth'

export default {
  name: 'HomeView',
  data() {
    return {
      stats: {
        totalNotes: 0,
        activeProjects: 0
      },
      recentNotes: [],
      loading: true
    }
  },
  computed: {
    currentUser() {
      return authStore.state.user
    }
  },
  async mounted() {
    await this.loadHomeData()
  },
  methods: {
    async loadHomeData() {
      this.loading = true
      
      try {
        // Charger les données en parallèle
        const [notesResponse, projectsResponse] = await Promise.all([
          notesAPI.getAllNotes(),
          projectsAPI.getAllProjects().catch(() => ({ data: [] }))
        ])

        const notes = Array.isArray(notesResponse.data) ? notesResponse.data : []
        const projects = Array.isArray(projectsResponse.data) ? projectsResponse.data : []

        // Calculer les statistiques simples
        this.stats.totalNotes = notes.length
        this.stats.activeProjects = projects.length

        // Notes récentes (5 dernières)
        this.recentNotes = notes
          .sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at))
          .slice(0, 5)

      } catch (error) {
        console.error('❌ Erreur home:', error)
      } finally {
        this.loading = false
      }
    },

    openNote(note) {
      this.$router.push(`/notes/${note.note_id}`)
    },

    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      const now = new Date()
      const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))
      
      if (diffInDays === 0) return 'Aujourd\'hui'
      if (diffInDays === 1) return 'Hier'
      if (diffInDays < 7) return `Il y a ${diffInDays} jours`
      
      return date.toLocaleDateString('fr-FR', { 
        day: '2-digit', 
        month: '2-digit',
        year: diffInDays > 365 ? 'numeric' : undefined
      })
    },

    getTextPreview(htmlContent) {
      if (!htmlContent) return 'Aucun contenu...'
      const text = htmlContent.replace(/<[^>]*>/g, '').trim()
      return text.length > 100 ? text.substring(0, 100) + '...' : text
    }
  }
}
</script>

<style scoped>
/* CSS minimal - utilisation maximale de Bootstrap */
</style>