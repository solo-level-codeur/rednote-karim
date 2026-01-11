<template>
  <div class="enhanced-notes-list">
    <div class="notes-header d-flex justify-content-between align-items-center mb-4">
      <h5 class="mb-0">
        {{ loading ? 'Chargement...' : `${filteredNotes.length} note${filteredNotes.length > 1 ? 's' : ''}` }}
      </h5>
      
      <div class="view-toggle">
        <div class="btn-group btn-group-sm" role="group">
          <input type="radio" class="btn-check" name="viewType" id="gridView" v-model="viewType" value="grid">
          <label class="btn btn-outline-secondary" for="gridView">
            <i class="fas fa-th"></i>
          </label>
          
          <input type="radio" class="btn-check" name="viewType" id="listView" v-model="viewType" value="list">
          <label class="btn btn-outline-secondary" for="listView">
            <i class="fas fa-list"></i>
          </label>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Chargement...</span>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredNotes.length === 0" class="empty-state text-center py-5">
      <i class="fas fa-sticky-note fa-4x text-muted mb-3"></i>
      <h4 class="text-muted">Aucune note trouvée</h4>
      <p class="text-muted mb-4">
        {{ hasFilters ? 'Aucune note ne correspond à vos critères de recherche' : 'Créez votre première note pour commencer' }}
      </p>
      <button class="btn btn-primary" @click="$emit('create-note')">
        <i class="fas fa-plus"></i> Créer une note
      </button>
    </div>

    <!-- Grid View -->
    <div v-else-if="viewType === 'grid'" class="notes-grid">
      <div class="row">
        <div 
          v-for="note in filteredNotes" 
          :key="note.id"
          class="col-lg-4 col-md-6 mb-4"
        >
          <NoteCard
            :note="note"
            @edit="$emit('edit-note', note)"
            @share="$emit('share-note', note)"
            @delete="handleDeleteNote"
          />
        </div>
      </div>
    </div>

    <!-- List View -->
    <div v-else class="notes-list">
      <div class="list-group">
        <NoteListItem
          v-for="note in filteredNotes"
          :key="note.id"
          :note="note"
          @edit="$emit('edit-note', note)"
          @share="$emit('share-note', note)"
          @delete="handleDeleteNote"
        />
      </div>
    </div>

    <!-- Load More Button -->
    <div v-if="hasMoreNotes && !loading" class="text-center mt-4">
      <button class="btn btn-outline-primary" @click="loadMore" :disabled="loadingMore">
        <span v-if="loadingMore" class="spinner-border spinner-border-sm me-2" role="status"></span>
        <i v-else class="fas fa-arrow-down me-2"></i>
        {{ loadingMore ? 'Chargement...' : 'Charger plus' }}
      </button>
    </div>
  </div>
</template>

<script>
import { notesAPI } from '@/services/api'
import NoteCard from './NoteCard.vue'
import NoteListItem from './NoteListItem.vue'

export default {
  name: 'EnhancedNotesList',
  components: {
    NoteCard,
    NoteListItem
  },
  props: {
    filters: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      notes: [],
      filteredNotes: [],
      loading: false,
      loadingMore: false,
      viewType: 'grid', // grid or list
      currentPage: 1,
      pageSize: 12,
      hasMoreNotes: true,
      searchDebounceTimer: null
    }
  },
  computed: {
    hasFilters() {
      return Object.values(this.filters).some(value => value && value.toString().trim() !== '')
    }
  },
  watch: {
    filters: {
      deep: true,
      handler() {
        this.debouncedSearch()
      }
    }
  },
  mounted() {
    this.loadNotes()
    // Restaurer la vue préférée
    const savedViewType = localStorage.getItem('notesViewType')
    if (savedViewType) {
      this.viewType = savedViewType
    }
  },
  methods: {
    async loadNotes(append = false) {
      if (!append) {
        this.loading = true
        this.currentPage = 1
      } else {
        this.loadingMore = true
      }

      try {
        let response
        
        if (this.hasFilters) {
          // Utiliser l'API de filtrage
          const filterParams = {
            ...this.filters,
            limit: this.pageSize,
            offset: (this.currentPage - 1) * this.pageSize
          }
          response = await notesAPI.getFilteredNotes(filterParams)
        } else {
          // Utiliser l'API standard
          response = await notesAPI.getAllAccessibleNotes()
        }

        const newNotes = response.data.notes || response.data.results || []
        
        if (append) {
          this.notes = [...this.notes, ...newNotes]
        } else {
          this.notes = newNotes
        }
        
        this.filteredNotes = this.notes
        this.hasMoreNotes = newNotes.length === this.pageSize

      } catch (error) {
        console.error('Erreur lors du chargement des notes:', error)
        this.$toast.error('Erreur lors du chargement des notes')
      } finally {
        this.loading = false
        this.loadingMore = false
      }
    },

    async loadMore() {
      this.currentPage++
      await this.loadNotes(true)
    },

    debouncedSearch() {
      clearTimeout(this.searchDebounceTimer)
      this.searchDebounceTimer = setTimeout(() => {
        this.loadNotes()
      }, 300)
    },

    async handleDeleteNote(noteId) {
      if (confirm('Êtes-vous sûr de vouloir supprimer cette note ?')) {
        try {
          await notesAPI.deleteNote(noteId)
          this.notes = this.notes.filter(note => note.id !== noteId)
          this.filteredNotes = this.filteredNotes.filter(note => note.id !== noteId)
          this.$toast.success('Note supprimée avec succès')
          this.$emit('note-updated')
        } catch (error) {
          console.error('Erreur lors de la suppression:', error)
          this.$toast.error('Erreur lors de la suppression de la note')
        }
      }
    }
  },
  watch: {
    viewType(newType) {
      localStorage.setItem('notesViewType', newType)
    }
  }
}
</script>

<style scoped>
.enhanced-notes-list {
  min-height: 400px;
}

.notes-header {
  padding-bottom: 1rem;
  border-bottom: 1px solid #dee2e6;
}

.view-toggle .btn-check:checked + .btn-outline-secondary {
  background-color: #007bff;
  border-color: #007bff;
  color: white;
}

.empty-state {
  color: #6c757d;
}

.notes-grid .row {
  margin: 0 -0.75rem;
}

.notes-grid .col-lg-4,
.notes-grid .col-md-6 {
  padding: 0 0.75rem;
}

.notes-list .list-group {
  border-radius: 0.375rem;
  overflow: hidden;
}

@media (max-width: 768px) {
  .notes-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .view-toggle {
    margin-top: 1rem;
  }
  
  .notes-grid .col-lg-4,
  .notes-grid .col-md-6 {
    padding: 0 0.5rem;
    margin-bottom: 1rem;
  }
}
</style>