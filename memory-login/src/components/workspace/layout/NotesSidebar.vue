<!--
  NotesSidebar.vue
  
  🏗️ WORKSPACE LAYOUT COMPONENT
  Responsabilité: Sidebar avec liste des notes et gestion des états
  
  Props:
  - notes: Array - Liste des notes
  - currentNote: Object - Note actuellement sélectionnée
  - loading: Boolean - État de chargement
  - searchQuery: String - Terme de recherche
  
  Events:
  - @select-note - Note sélectionnée
  - @delete-note - Note à supprimer
  - @create-note - Création d'une note
-->
<template>
  <aside class="notes-sidebar">
    <div class="notes-container">
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Chargement de vos notes...</p>
      </div>
      
      <div v-else-if="filteredNotes.length === 0" class="empty-notes">
        <p>{{ searchQuery ? 'Aucun résultat' : 'Aucune note' }}</p>
        <button v-if="!searchQuery" class="btn-empty-create" @click="$emit('create-note')">
          Créer une note
        </button>
      </div>
      
      <div v-else class="notes-list">
        <TransitionGroup name="note-list" tag="div">
          <div 
            v-for="note in filteredNotes" 
            :key="note.id"
            class="note-card"
            :class="{ active: currentNote?.id === note.id }"
            @click="$emit('select-note', note)"
          >
            <div class="note-content">
              <h4 class="note-title">{{ note.title || 'Sans titre' }}</h4>
              <p class="note-preview">{{ getPreview(note.content) }}</p>
              <div class="note-meta">
                <span class="note-date">{{ formatRelativeDate(note.updated_at || note.created_at) }}</span>
              </div>
            </div>
            
            <div class="note-actions">
              <button 
                @click.stop="$emit('delete-note', note.id)" 
                class="action-delete"
                title="Supprimer"
              >
                ×
              </button>
            </div>
          </div>
        </TransitionGroup>
      </div>
    </div>
  </aside>
</template>

<script>
import { stripHtmlAndTruncate } from '../../../utils/textUtils'

export default {
  name: 'NotesSidebar',
  props: {
    notes: {
      type: Array,
      default: () => []
    },
    currentNote: {
      type: Object,
      default: null
    },
    loading: {
      type: Boolean,
      default: false
    },
    searchQuery: {
      type: String,
      default: ''
    }
  },
  emits: ['select-note', 'delete-note', 'create-note'],
  computed: {
    filteredNotes() {
      let filtered = this.notes

      // Filtre par recherche
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        filtered = filtered.filter(note => 
          note.title?.toLowerCase().includes(query) ||
          note.content?.toLowerCase().includes(query)
        )
      }

      // Trier par date de modification
      return filtered.sort((a, b) => 
        new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at)
      )
    }
  },
  methods: {
    getPreview(content) {
      return stripHtmlAndTruncate(content, 100) || 'Note vide...'
    },

    formatRelativeDate(dateString) {
      if (!dateString) return ''
      
      const date = new Date(dateString)
      const now = new Date()
      const diffInSeconds = Math.floor((now - date) / 1000)
      
      if (diffInSeconds < 60) return 'À l\'instant'
      if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)}m`
      if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)}h`
      if (diffInSeconds < 604800) return `Il y a ${Math.floor(diffInSeconds / 86400)}j`
      
      return date.toLocaleDateString('fr-FR', { 
        day: 'numeric', 
        month: 'short',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      })
    }
  }
}
</script>

<style scoped>
.notes-sidebar {
  width: 350px;
  min-width: 350px;
  background: #f5f5f5;
  border-right: 1px solid #ccc;
  height: 100%;
  overflow-y: auto;
}

.notes-container {
  padding: 1rem;
}

.loading-state, .empty-notes {
  text-align: center;
  padding: 2rem 1rem;
}

.btn-empty-create {
  background: #007bff;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  cursor: pointer;
  margin-top: 1rem;
}

.notes-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.note-card {
  background: white;
  border: 1px solid #ddd;
  padding: 1rem;
  cursor: pointer;
  position: relative;
}

.note-card.active {
  border-color: #007bff;
  background: #e6f3ff;
}

.note-content {
  padding-right: 2rem;
}

.note-title {
  font-size: 1rem;
  font-weight: bold;
  margin: 0 0 0.5rem 0;
}

.note-preview {
  font-size: 0.85rem;
  color: #666;
  margin: 0 0 0.5rem 0;
}

.note-date {
  font-size: 0.75rem;
  color: #999;
}

.note-actions {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
}

.action-delete {
  background: #dc3545;
  border: none;
  color: white;
  width: 20px;
  height: 20px;
  cursor: pointer;
  font-size: 12px;
}

/* Responsive */
@media (max-width: 768px) {
  .notes-sidebar {
    width: 100%;
    min-width: auto;
    height: 300px;
    max-height: 300px;
  }
}
</style>