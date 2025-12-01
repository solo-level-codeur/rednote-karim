<template>
  <div class="shared-notes-view">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h5 class="mb-0">
        <i class="fas fa-share-alt"></i> Notes partagées avec moi
      </h5>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Chargement...</span>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="sharedNotes.length === 0" class="empty-state text-center py-5">
      <i class="fas fa-share-alt fa-4x text-muted mb-3"></i>
      <h4 class="text-muted">Aucune note partagée</h4>
      <p class="text-muted">Aucune note n'a été partagée avec vous pour le moment</p>
    </div>

    <!-- Shared Notes List -->
    <div v-else class="shared-notes-list">
      <div 
        v-for="note in sharedNotes" 
        :key="note.id"
        class="card mb-3 shared-note-card"
        @click="$emit('edit-note', note)"
      >
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start">
            <div class="flex-grow-1">
              <div class="d-flex align-items-center mb-2">
                <h6 class="card-title mb-0 me-3">{{ note.title }}</h6>
                <span class="badge bg-info">
                  {{ getPermissionLabel(note.permission) }}
                </span>
              </div>
              
              <p class="card-text text-muted mb-2" v-if="note.content">
                {{ getPreview(note.content) }}
              </p>
              
              <div class="note-meta">
                <small class="text-muted me-3">
                  <i class="fas fa-user me-1"></i>
                  Partagé par {{ note.shared_by_firstname }} {{ note.shared_by_lastname }}
                </small>
                
                <small class="text-muted me-3">
                  <i class="fas fa-calendar me-1"></i>
                  {{ formatDate(note.shared_at) }}
                </small>
                
                <small v-if="note.project_name" class="text-muted">
                  <i class="fas fa-folder me-1"></i>
                  {{ note.project_name }}
                </small>
              </div>
            </div>
            
            <div class="note-actions">
              <button 
                class="btn btn-sm btn-outline-primary"
                @click.stop="$emit('edit-note', note)"
              >
                <i class="fas fa-eye"></i>
                {{ note.permission === 'write' ? 'Modifier' : 'Voir' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { shareAPI } from '@/services/api'

export default {
  name: 'SharedNotesView',
  data() {
    return {
      sharedNotes: [],
      loading: false
    }
  },
  mounted() {
    this.loadSharedNotes()
  },
  methods: {
    async loadSharedNotes() {
      this.loading = true
      try {
        const response = await shareAPI.getSharedNotes()
        this.sharedNotes = response.data.notes || []
      } catch (error) {
        console.error('Erreur lors du chargement des notes partagées:', error)
        this.$toast.error('Erreur lors du chargement des notes partagées')
      } finally {
        this.loading = false
      }
    },

    getPermissionLabel(permission) {
      return permission === 'write' ? 'Écriture' : 'Lecture'
    },

    getPreview(content) {
      if (!content) return ''
      const textContent = content.replace(/<[^>]*>/g, '')
      return textContent.length > 150 
        ? textContent.substring(0, 150) + '...'
        : textContent
    },

    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }
  }
}
</script>

<style scoped>
.shared-notes-view {
  min-height: 400px;
}

.shared-note-card {
  cursor: pointer;
  transition: all 0.2s;
  border-left: 4px solid #17a2b8;
}

.shared-note-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.note-meta {
  padding-top: 0.5rem;
  border-top: 1px solid #eee;
  margin-top: 0.5rem;
}

.empty-state {
  color: #6c757d;
}
</style>