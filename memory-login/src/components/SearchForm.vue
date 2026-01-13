<template>
  <div class="search-form">
    <!-- Barre de recherche -->
    <div class="mb-4">
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
      <div class="mt-3">
        <div class="row">
          <div class="col-md-6">
            <select class="form-select" v-model="filters.project" @change="performSearch">
              <option value="">Tous les projets</option>
              <option v-for="project in projects" :key="project.project_id" :value="project.project_id">
                {{ project.project_name }}
              </option>
            </select>
          </div>
          <div class="col-md-6">
            <select class="form-select" v-model="filters.sortBy" @change="performSearch">
              <option value="created_desc">Plus récent</option>
              <option value="created_asc">Plus ancien</option>
              <option value="title">Titre A-Z</option>
              <option value="updated">Dernière modification</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Résultats de recherche -->
    <div class="search-results">
      <div v-if="loading" class="text-center py-4">
        <div class="spinner-border"></div>
        <p class="mt-2 text-muted">Recherche en cours...</p>
      </div>
      
      <div v-else-if="searchQuery && results.length === 0" class="text-center py-4 text-muted">
        <i class="fas fa-search fa-2x mb-3"></i>
        <p>Aucun résultat pour "{{ searchQuery }}"</p>
      </div>
      
      <div v-else-if="results.length > 0" class="results-list">
        <p class="text-muted mb-3">{{ results.length }} résultat(s)</p>
        
        <div class="list-group">
          <button 
            v-for="note in results" 
            :key="note.note_id"
            @click="selectNote(note)"
            class="list-group-item list-group-item-action"
          >
            <div class="d-flex justify-content-between align-items-start">
              <div class="flex-grow-1">
                <h6 class="mb-1">{{ note.title || 'Note sans titre' }}</h6>
                <p class="mb-1 text-muted small">{{ getPreview(note.content) }}</p>
                <small class="text-muted">
                  <i class="fas fa-calendar me-1"></i>
                  {{ formatDate(note.updated_at || note.created_at) }}
                  <span v-if="note.project_name" class="ms-3">
                    <i class="fas fa-folder me-1"></i>
                    {{ note.project_name }}
                  </span>
                </small>
              </div>
              <span class="badge bg-primary">{{ note.type || 'Note' }}</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { notesAPI, projectsAPI } from '../services/api'

export default {
  name: 'SearchForm',
  data() {
    return {
      searchQuery: '',
      results: [],
      projects: [],
      loading: false,
      filters: {
        project: '',
        sortBy: 'created_desc'
      }
    }
  },
  async mounted() {
    this.$refs.searchInput?.focus()
    await this.loadProjects()
  },
  methods: {
    async loadProjects() {
      try {
        const response = await projectsAPI.getAllProjects()
        this.projects = response.data || []
      } catch (error) {
        console.error('Erreur lors du chargement des projets:', error)
      }
    },

    async performSearch() {
      if (!this.searchQuery.trim() && !this.filters.project) {
        this.results = []
        return
      }
      
      this.loading = true
      try {
        const response = await notesAPI.searchNotes({
          query: this.searchQuery.trim(),
          project_id: this.filters.project || undefined,
          sort_by: this.filters.sortBy
        })
        
        this.results = response.data.notes || []
      } catch (error) {
        console.error('Erreur lors de la recherche:', error)
        this.results = []
      } finally {
        this.loading = false
      }
    },

    clearSearch() {
      this.searchQuery = ''
      this.filters.project = ''
      this.filters.sortBy = 'created_desc'
      this.results = []
    },

    selectNote(note) {
      this.$emit('note-selected', note)
    },

    getPreview(content) {
      if (!content) return 'Aucun contenu'
      const text = content.replace(/<[^>]+>/g, '').trim()
      return text.length > 120 ? text.substring(0, 120) + '...' : text
    },

    formatDate(dateString) {
      if (!dateString) return ''
      return new Date(dateString).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric'
      })
    }
  },
  emits: ['note-selected']
}
</script>