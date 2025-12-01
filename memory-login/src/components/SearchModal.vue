<template>
  <div class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="fas fa-search"></i> Rechercher des notes
          </h5>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </div>
        
        <div class="modal-body">
          <!-- Barre de recherche -->
          <div class="search-form mb-4">
            <div class="input-group">
              <input 
                type="text" 
                class="form-control form-control-lg" 
                v-model="searchQuery"
                @input="performSearch"
                placeholder="Rechercher dans vos notes..."
                ref="searchInput"
              >
              <button class="btn btn-outline-secondary" type="button" @click="clearSearch">
                <i class="fas fa-times"></i>
              </button>
            </div>
            
            <!-- Filtres avancés -->
            <div class="advanced-filters mt-3">
              <div class="row">
                <div class="col-md-6">
                  <select class="form-select form-select-sm" v-model="filters.projectId" @change="performSearch">
                    <option value="">Tous les projets</option>
                    <option v-for="project in projects" :key="project.id" :value="project.id">
                      {{ project.name }}
                    </option>
                  </select>
                </div>
                <div class="col-md-6">
                  <select class="form-select form-select-sm" v-model="filters.sortBy" @change="performSearch">
                    <option value="updated_date">Plus récent</option>
                    <option value="creation_date">Date de création</option>
                    <option value="title">Titre A-Z</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <!-- Résultats de recherche -->
          <div class="search-results">
            <div v-if="searching" class="text-center py-3">
              <div class="spinner-border spinner-border-sm text-primary" role="status">
                <span class="visually-hidden">Recherche...</span>
              </div>
            </div>

            <div v-else-if="searchQuery && searchResults.length === 0" class="text-center py-4">
              <i class="fas fa-search fa-2x text-muted mb-2"></i>
              <h6 class="text-muted">Aucun résultat trouvé</h6>
              <p class="text-muted small">Aucune note ne correspond à votre recherche</p>
            </div>

            <div v-else-if="searchResults.length > 0">
              <div class="results-header mb-3">
                <small class="text-muted">
                  {{ searchResults.length }} résultat{{ searchResults.length > 1 ? 's' : '' }} trouvé{{ searchResults.length > 1 ? 's' : '' }}
                </small>
              </div>

              <div class="results-list">
                <div 
                  v-for="note in searchResults" 
                  :key="note.id"
                  class="result-item card mb-2"
                  @click="selectNote(note)"
                >
                  <div class="card-body py-3">
                    <div class="d-flex justify-content-between align-items-start">
                      <div class="flex-grow-1">
                        <h6 class="card-title mb-1" v-html="highlightText(note.title, searchQuery)"></h6>
                        
                        <p class="card-text text-muted small mb-2" v-if="note.content">
                          <span v-html="highlightText(getPreview(note.content), searchQuery)"></span>
                        </p>
                        
                        <div class="note-meta">
                          <small class="text-muted me-3">
                            <i class="fas fa-calendar me-1"></i>
                            {{ formatDate(note.updated_date) }}
                          </small>
                          
                          <small v-if="note.project_name" class="text-muted me-3">
                            <i class="fas fa-folder me-1"></i>
                            {{ note.project_name }}
                          </small>
                          
                          <small v-if="note.access_type === 'shared'" class="text-info">
                            <i class="fas fa-share-alt me-1"></i>
                            Partagée
                          </small>
                        </div>
                      </div>
                      
                      <button class="btn btn-sm btn-outline-primary">
                        <i class="fas fa-arrow-right"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Suggestions si pas de recherche -->
            <div v-else-if="!searchQuery && recentNotes.length > 0">
              <h6 class="text-muted mb-3">Notes récentes</h6>
              <div class="suggestions-list">
                <div 
                  v-for="note in recentNotes.slice(0, 5)" 
                  :key="note.id"
                  class="suggestion-item d-flex align-items-center py-2"
                  @click="selectNote(note)"
                >
                  <div class="suggestion-icon me-3">
                    <i class="fas fa-sticky-note text-muted"></i>
                  </div>
                  <div class="flex-grow-1">
                    <div class="suggestion-title">{{ note.title }}</div>
                    <small class="text-muted">{{ formatDate(note.updated_date) }}</small>
                  </div>
                  <i class="fas fa-arrow-right text-muted"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="$emit('close')">
            Fermer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { notesAPI, projectsAPI } from '@/services/api'

export default {
  name: 'SearchModal',
  data() {
    return {
      searchQuery: '',
      searchResults: [],
      recentNotes: [],
      projects: [],
      searching: false,
      searchTimeout: null,
      filters: {
        projectId: '',
        sortBy: 'updated_date'
      }
    }
  },
  mounted() {
    this.loadInitialData()
    this.$nextTick(() => {
      this.$refs.searchInput?.focus()
    })
  },
  methods: {
    async loadInitialData() {
      try {
        await Promise.all([
          this.loadRecentNotes(),
          this.loadProjects()
        ])
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error)
      }
    },

    async loadRecentNotes() {
      try {
        const response = await notesAPI.getAllAccessibleNotes()
        this.recentNotes = response.data.notes || response.data || []
      } catch (error) {
        console.error('Erreur lors du chargement des notes récentes:', error)
      }
    },

    async loadProjects() {
      try {
        const response = await projectsAPI.getAllProjects()
        this.projects = response.data
      } catch (error) {
        console.error('Erreur lors du chargement des projets:', error)
      }
    },

    performSearch() {
      clearTimeout(this.searchTimeout)
      
      if (!this.searchQuery.trim()) {
        this.searchResults = []
        return
      }

      if (this.searchQuery.trim().length < 2) {
        return
      }

      this.searchTimeout = setTimeout(async () => {
        this.searching = true
        try {
          const response = await notesAPI.searchNotes(
            this.searchQuery.trim(), 
            this.filters.projectId || null
          )
          
          this.searchResults = response.data.results || []
          
          // Trier les résultats selon le filtre
          if (this.filters.sortBy) {
            this.searchResults.sort((a, b) => {
              const aValue = a[this.filters.sortBy]
              const bValue = b[this.filters.sortBy]
              
              if (this.filters.sortBy === 'title') {
                return aValue.localeCompare(bValue)
              } else {
                return new Date(bValue) - new Date(aValue)
              }
            })
          }
          
        } catch (error) {
          console.error('Erreur lors de la recherche:', error)
          this.$toast.error('Erreur lors de la recherche')
        } finally {
          this.searching = false
        }
      }, 300)
    },

    selectNote(note) {
      this.$emit('note-selected', note)
    },

    clearSearch() {
      this.searchQuery = ''
      this.searchResults = []
      this.$refs.searchInput?.focus()
    },

    getPreview(content) {
      if (!content) return ''
      const textContent = content.replace(/<[^>]*>/g, '')
      return textContent.length > 100 
        ? textContent.substring(0, 100) + '...'
        : textContent
    },

    highlightText(text, query) {
      if (!query.trim()) return text
      
      const regex = new RegExp(`(${query.trim()})`, 'gi')
      return text.replace(regex, '<mark>$1</mark>')
    },

    formatDate(dateString) {
      const date = new Date(dateString)
      const now = new Date()
      const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))
      
      if (diffInDays === 0) {
        return 'Aujourd\'hui'
      } else if (diffInDays === 1) {
        return 'Hier'
      } else if (diffInDays < 7) {
        return `Il y a ${diffInDays} jours`
      } else {
        return date.toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'short'
        })
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

.search-form .input-group {
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  border-radius: 0.5rem;
  overflow: hidden;
}

.advanced-filters {
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 0.375rem;
}

.result-item,
.suggestion-item {
  cursor: pointer;
  transition: all 0.2s;
}

.result-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.suggestion-item:hover {
  background-color: #f8f9fa;
  padding-left: 1rem;
}

.suggestion-title {
  font-weight: 500;
  color: #495057;
}

.results-list {
  max-height: 400px;
  overflow-y: auto;
}

.suggestions-list {
  max-height: 300px;
  overflow-y: auto;
}

:deep(mark) {
  background-color: #fff3cd;
  color: #856404;
  padding: 0 0.2rem;
  border-radius: 0.25rem;
}

@media (max-width: 768px) {
  .advanced-filters .row .col-md-6 {
    margin-bottom: 0.5rem;
  }
  
  .result-item .card-body {
    padding: 0.75rem;
  }
  
  .suggestion-item {
    padding: 0.75rem 0;
  }
}
</style>