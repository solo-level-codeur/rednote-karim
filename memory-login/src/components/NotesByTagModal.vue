<template>
  <div class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="fas fa-tag"></i> Notes avec ce tag
          </h5>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </div>
        
        <div class="modal-body">
          <div v-if="loading" class="text-center py-4">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Chargement...</span>
            </div>
          </div>

          <div v-else-if="notes.length === 0" class="text-center py-4">
            <i class="fas fa-sticky-note fa-3x text-muted mb-3"></i>
            <h5 class="text-muted">Aucune note trouvée</h5>
            <p class="text-muted">Aucune note n'utilise ce tag pour le moment</p>
          </div>

          <div v-else>
            <p class="text-muted mb-3">
              {{ notes.length }} note{{ notes.length > 1 ? 's' : '' }} trouvée{{ notes.length > 1 ? 's' : '' }}
            </p>

            <div class="note-list">
              <div 
                v-for="note in notes" 
                :key="note.note_id"
                class="card mb-3 note-card"
                @click="openNote(note.note_id)"
              >
                <div class="card-body">
                  <div class="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 class="card-title mb-2">{{ note.title }}</h6>
                      <p class="card-text text-muted small mb-2" v-if="note.content">
                        {{ getPreview(note.content) }}
                      </p>
                      <div class="note-meta">
                        <small class="text-muted">
                          <i class="fas fa-calendar"></i> 
                          {{ formatDate(note.updated_at) }}
                        </small>
                        <small v-if="note.project_name" class="text-muted ms-3">
                          <i class="fas fa-folder"></i> 
                          {{ note.project_name }}
                        </small>
                      </div>
                    </div>
                    <button class="btn btn-sm btn-outline-primary">
                      <i class="fas fa-eye"></i>
                    </button>
                  </div>
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
import { tagsAPI } from '@/services/api'

export default {
  name: 'NotesByTagModal',
  props: {
    tagId: {
      type: [String, Number],
      required: true
    }
  },
  data() {
    return {
      notes: [],
      loading: false
    }
  },
  mounted() {
    this.loadNotes()
  },
  methods: {
    async loadNotes() {
      this.loading = true
      try {
        const response = await tagsAPI.getNotesByTag(this.tagId)
        this.notes = response.data.notes || response.data
      } catch (error) {
        console.error('Erreur lors du chargement des notes:', error)
        this.$toast.error('Erreur lors du chargement des notes')
      } finally {
        this.loading = false
      }
    },

    openNote(noteId) {
      // Émettre un événement pour ouvrir la note dans l'éditeur
      this.$emit('open-note', noteId)
      this.$emit('close')
    },

    getPreview(content) {
      const maxLength = 120
      const text = content.replace(/<[^>]*>/g, '') // Supprimer les tags HTML
      return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
    },

    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
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

.note-card {
  cursor: pointer;
  transition: all 0.2s;
}

.note-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.note-list {
  max-height: 400px;
  overflow-y: auto;
}

.note-meta {
  border-top: 1px solid #eee;
  padding-top: 0.5rem;
  margin-top: 0.5rem;
}
</style>