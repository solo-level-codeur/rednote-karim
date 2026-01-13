<template>
  <div class="notes-sidebar bg-light border-end d-flex flex-column">
    <!-- Barre de recherche et filtre -->
    <div class="p-3 border-bottom">
      <!-- Filtre par projet -->
      <div class="mb-3">
        <select class="form-select form-select-sm" v-model="selectedProjectId" @change="onProjectChange">
          <option value="">Tous les projets</option>
          <option v-for="project in projects" :key="project.project_id" :value="project.project_id">
            {{ project.project_name }}
          </option>
        </select>
      </div>
      
      <!-- Recherche -->
      <div class="input-group">
        <input 
          type="text" 
          class="form-control"
          placeholder="Rechercher une note..."
          v-model="searchQuery"
          @input="onSearch"
        >
        <button class="btn btn-outline-secondary" type="button">
          <i class="fas fa-search"></i>
        </button>
      </div>
    </div>

    <!-- Bouton nouvelle note et infos projet -->
    <div class="p-3 border-bottom">
      <div v-if="selectedProjectId" class="bg-light p-2 rounded text-center mb-2">
        <small class="text-muted">
          <i class="fas fa-folder"></i> 
          {{ currentProjectName }}
        </small>
      </div>
      
      <button 
        class="btn btn-primary w-100 mb-2"
        @click="createNewNote"
      >
        <i class="fas fa-plus"></i> 
        {{ selectedProjectId ? 'Nouvelle note dans ce projet' : 'Nouvelle note' }}
      </button>
      
    </div>

    <!-- Liste des notes -->
    <div class="flex-grow-1" style="overflow-y: auto;">
      <div v-if="loading" class="text-center p-3">
        <div class="spinner-border spinner-border-sm" role="status">
          <span class="visually-hidden">Chargement...</span>
        </div>
      </div>

      <div v-else-if="filteredNotes.length === 0" class="text-center p-3 text-muted">
        <i class="fas fa-sticky-note fa-2x mb-2"></i>
        <p class="mb-0">{{ searchQuery ? 'Aucune note trouvée' : 'Aucune note disponible' }}</p>
        <small v-if="!searchQuery" class="d-block mt-2">
          Cliquez sur "Nouvelle note" pour créer votre première note
        </small>
      </div>

      <div v-else class="py-2">
        <div 
          v-for="note in filteredNotes" 
          :key="note.note_id"
          class="note-item"
          :class="{ 'active': selectedNote && selectedNote.id === note.note_id }"
          @click="selectNote(note)"
        >
          <div class="note-header">
            <div class="d-flex align-items-center">
              <h6 class="note-title flex-grow-1">{{ note.title || 'Sans titre' }}</h6>
              <div class="note-indicators">
                <span v-if="note.isShared" class="badge bg-info badge-sm me-1" title="Note partagée">
                  <i class="fas fa-share-alt"></i>
                </span>
                <span v-if="note.permission === 'read'" class="badge bg-warning badge-sm me-1" title="Lecture seule">
                  <i class="fas fa-eye"></i>
                </span>
              </div>
            </div>
            <!-- Afficher l'auteur si c'est une note dans un projet et qu'elle n'est pas de l'utilisateur actuel -->
            <div v-if="note.authorName && selectedProjectId" class="note-author">
              <small class="text-info">
                <i class="fas fa-user"></i> {{ note.authorName }}
              </small>
            </div>
            <small class="note-date">{{ formatDate(note.updated_at || note.updated_at || note.created_at || note.created_at) }}</small>
          </div>
          <div class="note-preview">
            {{ getTextPreview(note.content) }}
          </div>
          <div class="note-actions" @click.stop>
            <button 
              v-if="!note.isShared"
              class="btn btn-sm btn-outline-danger"
              @click="deleteNote(note)"
              title="Supprimer"
            >
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotesListSidebar',
  props: {
    notes: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    selectedNote: {
      type: Object,
      default: null
    },
    projects: {
      type: Array,
      default: () => []
    }
  },
  emits: ['note-selected', 'create-note', 'delete-note', 'project-filter-changed'],
  data() {
    return {
      searchQuery: '',
      selectedProjectId: ''
    }
  },
  computed: {
    filteredNotes() {
      if (!this.searchQuery.trim()) {
        return this.notes
      }
      
      const query = this.searchQuery.toLowerCase()
      return this.notes.filter(note => {
        // Recherche d'abord dans le titre (plus rapide)
        if (note.title && note.title.toLowerCase().includes(query)) {
          return true
        }
        // Puis dans le contenu si nécessaire
        if (note.content) {
          const textContent = this.getTextPreview(note.content).toLowerCase()
          return textContent.includes(query)
        }
        return false
      })
    },
    currentProject() {
      return this.projects.find(p => p.id == this.selectedProjectId)
    },
    currentProjectName() {
      return this.currentProject?.name || 'Projet inconnu'
    }
  },
  methods: {
    selectNote(note) {
      this.$router.push(`/notes/${note.note_id}`)
    },

    createNewNote() {
      this.$emit('create-note')
    },

    deleteNote(note) {
      if (confirm(`Êtes-vous sûr de vouloir supprimer la note "${note.title}" ?`)) {
        this.$emit('delete-note', note)
      }
    },

    onSearch() {
      // Émet l'événement de recherche si nécessaire pour des traitements supplémentaires
    },

    onProjectChange() {
      console.log('🔄 Changement de projet vers:', this.selectedProjectId)
      this.$emit('project-filter-changed', this.selectedProjectId)
    },


    formatDate(dateString) {
      const date = new Date(dateString)
      const now = new Date()
      const diffInMs = now - date
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
      
      if (diffInDays === 0) {
        return 'Aujourd\'hui'
      } else if (diffInDays === 1) {
        return 'Hier'
      } else if (diffInDays < 7) {
        return `Il y a ${diffInDays} jours`
      } else {
        return date.toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        })
      }
    },

    getTextPreview(htmlContent) {
      if (!htmlContent) return ''
      
      // Retirer les balises HTML avec regex (plus performant)
      const text = htmlContent.replace(/<[^>]*>/g, '').trim()
      
      // Limiter à 100 caractères
      return text.length > 100 ? text.substring(0, 100) + '...' : text
    }
  }
}
</script>

<style scoped>
.notes-sidebar {
  height: 100vh;
}






.note-item {
  padding: 1rem;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.2s ease;
  position: relative;
}

.note-item:hover {
  background-color: #e9ecef;
}

.note-item.active {
  background-color: #007bff;
  color: white;
}

.note-item.active .note-date,
.note-item.active .note-preview {
  color: rgba(255, 255, 255, 0.8);
}

.note-header {
  margin-bottom: 0.5rem;
}

.note-indicators {
  opacity: 0.8;
}

.badge-sm {
  font-size: 0.7rem;
}

.note-title {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
  line-height: 1.2;
  flex: 1;
  margin-right: 0.5rem;
}

.note-date {
  font-size: 0.75rem;
  color: #6c757d;
  white-space: nowrap;
}

.note-author {
  margin-top: 0.25rem;
}

.note-author small {
  font-size: 0.7rem;
}

.note-preview {
  font-size: 0.8rem;
  line-height: 1.3;
  color: #6c757d;
  margin-bottom: 0.5rem;
}

.note-actions {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.note-item:hover .note-actions {
  opacity: 1;
}

.note-item.active .note-actions {
  opacity: 1;
}

.note-item.active .note-actions .btn {
  color: rgba(255, 255, 255, 0.8);
  border-color: rgba(255, 255, 255, 0.3);
}

.note-item.active .note-actions .btn:hover {
  color: white;
  border-color: rgba(255, 255, 255, 0.5);
  background-color: rgba(255, 255, 255, 0.1);
}

/* Scrollbar personnalisée */
.notes-list-container::-webkit-scrollbar {
  width: 6px;
}

.notes-list-container::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.notes-list-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.notes-list-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

@media (max-width: 768px) {
  .note-title {
    font-size: 0.85rem;
  }
  
  .note-preview {
    font-size: 0.75rem;
  }
  
  .note-date {
    font-size: 0.7rem;
  }
}
</style>