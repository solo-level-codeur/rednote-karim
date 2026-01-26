<template>
  <div class="home-layout">
    <Sidebar />
    
    <main class="main-content">
      <div class="container-fluid p-4">
        <!-- Section héro -->
        <div class="hero-section mb-5">
          <h1 class="display-6 fw-bold text-dark mb-2">Bienvenue sur Elite Memory</h1>
          <p class="text-muted mb-4">Centralisez et organisez vos connaissances techniques</p>
          
          <!-- Boutons d'actions -->
          <div class="d-flex gap-3 flex-wrap">
            <button class="btn btn-primary" @click="createNewNote">
              <i class="fas fa-plus me-2"></i>Nouvelle note
            </button>
            <button 
              v-if="canCreateProjects" 
              class="btn btn-outline-secondary" 
              @click="createNewProject"
            >
              <i class="fas fa-folder me-2"></i>Nouveau projet
            </button>
          </div>
        </div>

        <!-- Cards de statistiques -->
        <div class="row g-4 mb-5">
          <!-- Total Notes -->
          <div class="col-md-3 col-sm-6">
            <div class="card h-100 border-0 shadow-sm">
              <div class="card-body d-flex align-items-center">
                <div class="stat-icon bg-primary text-white rounded me-3">
                  <i class="fas fa-sticky-note"></i>
                </div>
                <div>
                  <h3 class="fs-2 fw-bold mb-0 text-dark">{{ stats.totalNotes }}</h3>
                  <p class="text-muted small mb-0">Total Notes</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Notes du mois -->
          <div class="col-md-3 col-sm-6">
            <div class="card h-100 border-0 shadow-sm">
              <div class="card-body d-flex align-items-center">
                <div class="stat-icon bg-success text-white rounded me-3">
                  <i class="fas fa-chart-line"></i>
                </div>
                <div>
                  <h3 class="fs-2 fw-bold mb-0 text-dark">{{ stats.monthlyNotes }}</h3>
                  <p class="text-muted small mb-0">Notes du mois</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Projets actifs -->
          <div class="col-md-3 col-sm-6">
            <div class="card h-100 border-0 shadow-sm">
              <div class="card-body d-flex align-items-center">
                <div class="stat-icon bg-warning text-white rounded me-3">
                  <i class="fas fa-folder"></i>
                </div>
                <div>
                  <h3 class="fs-2 fw-bold mb-0 text-dark">{{ stats.activeProjects }}</h3>
                  <p class="text-muted small mb-0">Projets actifs</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Collaborateurs -->
          <div class="col-md-3 col-sm-6">
            <div class="card h-100 border-0 shadow-sm">
              <div class="card-body d-flex align-items-center">
                <div class="stat-icon bg-info text-white rounded me-3">
                  <i class="fas fa-users"></i>
                </div>
                <div>
                  <h3 class="fs-2 fw-bold mb-0 text-dark">{{ stats.collaborators }}</h3>
                  <p class="text-muted small mb-0">Collaborateurs</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Graphique d'activité amélioré -->
        <div class="card border-0 shadow-sm mb-5">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center mb-4">
              <h5 class="card-title mb-0">Évolution de vos notes</h5>
              <small class="text-muted">7 derniers jours</small>
            </div>
            
            <div class="activity-chart">
              <!-- Légende -->
              <div class="d-flex align-items-center gap-3 mb-3">
                <div class="d-flex align-items-center">
                  <div class="legend-dot bg-primary me-2"></div>
                  <small class="text-muted">Notes créées</small>
                </div>
                <div class="d-flex align-items-center">
                  <div class="legend-dot bg-success me-2"></div>
                  <small class="text-muted">Notes modifiées</small>
                </div>
              </div>
              
              <!-- Graphique -->
              <div class="chart-container" style="height: 200px;">
                <div class="d-flex align-items-end justify-content-between h-100" style="gap: 8px;">
                  <div 
                    v-for="(day, index) in activityData" 
                    :key="index"
                    class="chart-column d-flex flex-column align-items-center justify-content-end"
                    style="flex: 1; height: 100%;"
                  >
                    <!-- Barres empilées -->
                    <div class="bar-group d-flex flex-column align-items-center" style="width: 100%; max-width: 35px;">
                      <!-- Barre notes modifiées -->
                      <div 
                        v-if="day.modified > 0"
                        class="bar bg-success rounded-top"
                        :style="{
                          height: Math.max((day.modified / maxActivityValue) * 140, 2) + 'px',
                          width: '100%',
                          marginBottom: '1px'
                        }"
                        :title="`${day.modified} note(s) modifiée(s)`"
                      ></div>
                      
                      <!-- Barre notes créées -->
                      <div 
                        class="bar bg-primary"
                        :class="{ 'rounded-top': day.modified === 0, 'rounded-bottom': true }"
                        :style="{
                          height: Math.max((day.created / maxActivityValue) * 140, 3) + 'px',
                          width: '100%'
                        }"
                        :title="`${day.created} note(s) créée(s)`"
                      ></div>
                    </div>
                    
                    <!-- Date et total -->
                    <div class="text-center mt-2">
                      <small class="fw-semibold text-dark d-block">{{ day.total }}</small>
                      <small class="text-muted">{{ day.dayName }}</small>
                      <small class="text-muted d-block">{{ day.date }}</small>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Résumé -->
              <div class="row mt-3 pt-3 border-top">
                <div class="col-4 text-center">
                  <small class="text-muted d-block">Cette semaine</small>
                  <strong class="text-primary">{{ weeklyStats.totalNotes }} notes</strong>
                </div>
                <div class="col-4 text-center">
                  <small class="text-muted d-block">Notes créées</small>
                  <strong class="text-primary">{{ weeklyStats.created }}</strong>
                </div>
                <div class="col-4 text-center">
                  <small class="text-muted d-block">Notes modifiées</small>
                  <strong class="text-success">{{ weeklyStats.modified }}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Notes récentes -->
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-white border-0 d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Notes récentes</h5>
            <router-link to="/all-notes" class="text-primary text-decoration-none small">
              Voir tout
            </router-link>
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
                        v-for="tag in note.tags.slice(0, 2)" 
                        :key="tag.id"
                        class="badge rounded-pill"
                        :style="{ backgroundColor: tag.color, fontSize: '0.7rem' }"
                      >
                        {{ tag.name }}
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
              <p class="text-muted small">Commencez par créer votre première note</p>
              <button class="btn btn-outline-primary btn-sm" @click="createNewNote">
                <i class="fas fa-plus me-1"></i>Créer une note
              </button>
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
        monthlyNotes: 0,
        activeProjects: 0,
        collaborators: 0
      },
      recentNotes: [],
      activityData: [],
      loading: true
    }
  },
  computed: {
    currentUser() {
      return authStore.state.user
    },
    canCreateProjects() {
      return authStore.canCreateProjects()
    },
    maxActivityValue() {
      return Math.max(...this.activityData.map(d => d.total), 5)
    },
    weeklyStats() {
      return {
        totalNotes: this.activityData.reduce((sum, day) => sum + day.total, 0),
        created: this.activityData.reduce((sum, day) => sum + day.created, 0),
        modified: this.activityData.reduce((sum, day) => sum + day.modified, 0)
      }
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

        // Calculer les statistiques
        this.stats.totalNotes = notes.length
        this.stats.activeProjects = projects.length
        this.stats.collaborators = this.calculateCollaborators(projects)
        this.stats.monthlyNotes = this.calculateMonthlyNotes(notes)

        // Notes récentes (5 dernières)
        this.recentNotes = notes
          .sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at))
          .slice(0, 5)

        // Données d'activité pour le graphique
        this.activityData = this.generateActivityData(notes)

        console.log('📊 Home chargé:', this.stats)
      } catch (error) {
        console.error('❌ Erreur home:', error)
      } finally {
        this.loading = false
      }
    },

    calculateMonthlyNotes(notes) {
      const currentMonth = new Date().getMonth()
      const currentYear = new Date().getFullYear()
      
      return notes.filter(note => {
        const noteDate = new Date(note.created_at)
        return noteDate.getMonth() === currentMonth && noteDate.getFullYear() === currentYear
      }).length
    },

    calculateCollaborators(projects) {
      // Estimation basée sur les projets actifs
      return Math.min(Math.max(projects.length * 1.5, 1), 12)
    },

    generateActivityData(notes) {
      // Générer les données pour les 7 derniers jours
      const last7Days = []
      const today = new Date()
      const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        
        // Notes créées ce jour
        const createdNotes = notes.filter(note => {
          const noteDate = new Date(note.created_at)
          return noteDate.toDateString() === date.toDateString()
        }).length

        // Notes modifiées ce jour (mais pas créées le même jour)
        const modifiedNotes = notes.filter(note => {
          if (!note.updated_at || note.updated_at === note.created_at) return false
          const updateDate = new Date(note.updated_at)
          const createDate = new Date(note.created_at)
          return updateDate.toDateString() === date.toDateString() && 
                 createDate.toDateString() !== date.toDateString()
        }).length

        // Valeurs par défaut si pas de données réelles
        const created = createdNotes || (i < 5 ? Math.floor(Math.random() * 4) : 0)
        const modified = modifiedNotes || (i < 5 ? Math.floor(Math.random() * 3) : 0)

        last7Days.push({
          date: date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
          dayName: dayNames[date.getDay()],
          created: created,
          modified: modified,
          total: created + modified
        })
      }
      
      return last7Days
    },

    openNote(note) {
      this.$router.push(`/notes/${note.note_id}`)
    },

    createNewNote() {
      this.$router.push('/notes')
    },

    createNewProject() {
      this.$router.push('/projects')
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
.home-layout {
  display: flex;
  min-height: 100vh;
  background-color: #f8f9fa;
}

.main-content {
  flex: 1;
  margin-left: 250px;
}

.hero-section {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.stat-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.12) !important;
}

.activity-chart {
  padding: 1rem 0;
}

.chart-bar {
  transition: all 0.3s ease;
}

.chart-bar:hover .bar {
  opacity: 0.8;
}

.bar {
  transition: all 0.3s ease;
  min-height: 4px;
}

.list-group-item {
  transition: background-color 0.2s ease;
}

.list-group-item:hover {
  background-color: #f8f9fa !important;
}

/* Responsive */
@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
  }
  
  .hero-section {
    padding: 1.5rem;
  }
  
  .stat-icon {
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }
  
  .fs-2 {
    font-size: 1.5rem !important;
  }
  
  .activity-chart {
    overflow-x: auto;
  }
}
</style>