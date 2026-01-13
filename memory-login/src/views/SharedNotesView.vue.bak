<template>
  <div class="shared-notes-page">
    <Sidebar />
    
    <main class="main-content">
      <div class="container-fluid p-4">
        <div class="header-section mb-4">
          <div class="d-flex justify-content-between align-items-center">
            <h2 class="mb-0">
              <i class="fas fa-share-alt text-primary me-2"></i>
              Notes partagées avec moi
            </h2>
            <span class="badge bg-info">{{ sharedNotes.length }} note(s)</span>
          </div>
          <p class="text-muted mt-2">
            Notes que d'autres utilisateurs ont partagées avec vous
          </p>
        </div>

        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Chargement...</span>
          </div>
          <p class="text-muted mt-3">Chargement des notes partagées...</p>
        </div>

        <div v-else-if="sharedNotes.length === 0" class="empty-state text-center py-5">
          <i class="fas fa-share-alt fa-3x text-muted mb-3"></i>
          <h4 class="text-muted">Aucune note partagée</h4>
          <p class="text-muted">Aucune note n'a été partagée avec vous pour le moment.</p>
        </div>

        <div v-else class="notes-grid">
          <div class="row g-4">
            <div 
              v-for="note in sharedNotes" 
              :key="note.id"
              class="col-md-6 col-lg-4"
            >
              <div class="card h-100 shadow-sm hover-card">
                <div class="card-header d-flex justify-content-between align-items-start">
                  <div>
                    <h6 class="card-title mb-1">{{ note.title || 'Note sans titre' }}</h6>
                    <small class="text-muted">
                      Partagée le {{ formatDate(note.shared_date) }}
                    </small>
                  </div>
                  <span 
                    class="badge"
                    :class="permissionBadgeClass(note.permission)"
                  >
                    {{ getPermissionLabel(note.permission) }}
                  </span>
                </div>
                
                <div class="card-body">
                  <div class="note-content mb-3">
                    <div 
                      class="note-preview"
                      v-html="getContentPreview(note.content)"
                    ></div>
                  </div>
                  
                  <div class="note-meta">
                    <div class="mb-2">
                      <small class="text-muted">
                        <i class="fas fa-user me-1"></i>
                        Par: {{ note.shared_by_firstname }} {{ note.shared_by_lastname }}
                      </small>
                    </div>
                    
                    <div v-if="note.project_name" class="mb-2">
                      <small class="text-muted">
                        <i class="fas fa-folder me-1"></i>
                        Projet: {{ note.project_name }}
                      </small>
                    </div>
                    
                    <div>
                      <small class="text-muted">
                        <i class="fas fa-clock me-1"></i>
                        Modifiée: {{ formatDate(note.updated_date) }}
                      </small>
                    </div>
                  </div>
                </div>
                
                <div class="card-footer bg-transparent">
                  <div class="d-flex gap-2">
                    <button 
                      @click="openNote(note)"
                      class="btn btn-primary btn-sm flex-grow-1"
                    >
                      <i class="fas fa-eye me-1"></i>
                      Voir
                    </button>
                    
                    <button 
                      v-if="note.permission === 'write'"
                      @click="editNote(note)"
                      class="btn btn-outline-primary btn-sm flex-grow-1"
                    >
                      <i class="fas fa-edit me-1"></i>
                      Modifier
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Modal d'affichage de note -->
    <div v-if="selectedNote" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              {{ selectedNote.title || 'Note sans titre' }}
            </h5>
            <button type="button" class="btn-close" @click="selectedNote = null"></button>
          </div>
          
          <div class="modal-body">
            <div class="note-meta-info mb-3">
              <div class="row">
                <div class="col-6">
                  <small class="text-muted">
                    <strong>Partagée par:</strong><br>
                    {{ selectedNote.shared_by_firstname }} {{ selectedNote.shared_by_lastname }}
                  </small>
                </div>
                <div class="col-6">
                  <small class="text-muted">
                    <strong>Permission:</strong><br>
                    <span :class="permissionBadgeClass(selectedNote.permission)">
                      {{ getPermissionLabel(selectedNote.permission) }}
                    </span>
                  </small>
                </div>
              </div>
            </div>
            
            <div class="note-content" v-html="selectedNote.content || 'Aucun contenu'"></div>
          </div>
          
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="selectedNote = null">
              Fermer
            </button>
            <button 
              v-if="selectedNote.permission === 'write'"
              type="button" 
              class="btn btn-primary"
              @click="editNote(selectedNote)"
            >
              <i class="fas fa-edit me-1"></i>
              Modifier
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// Sidebar est maintenant un composant global (voir main.js)
import { shareAPI } from '../services/api'

export default {
  name: 'SharedNotesView',
  components: {
    // Sidebar est maintenant global
  },
  data() {
    return {
      sharedNotes: [],
      loading: true,
      selectedNote: null
    }
  },
  
  async mounted() {
    await this.loadSharedNotes()
  },
  
  methods: {
    async loadSharedNotes() {
      this.loading = true
      try {
        const response = await shareAPI.getSharedNotes()
        this.sharedNotes = response.data.notes || []
      } catch (error) {
        console.error('Erreur lors du chargement des notes partagées:', error)
        alert('Erreur lors du chargement des notes partagées')
      } finally {
        this.loading = false
      }
    },
    
    openNote(note) {
      this.selectedNote = note
    },
    
    editNote(note) {
      this.selectedNote = null
      // Rediriger vers la page dédiée de la note
      this.$router.push(`/notes/${note.id}`)
    },
    
    getPermissionLabel(permission) {
      switch (permission) {
        case 'read': return 'Lecture'
        case 'write': return 'Lecture + Écriture'
        default: return permission
      }
    },
    
    permissionBadgeClass(permission) {
      switch (permission) {
        case 'read': return 'badge bg-info'
        case 'write': return 'badge bg-success'
        default: return 'badge bg-secondary'
      }
    },
    
    getContentPreview(content) {
      if (!content) return 'Aucun contenu'
      
      // Nettoyer le HTML et limiter à 150 caractères
      const text = content.replace(/<[^>]+>/g, '').trim()
      return text.length > 150 ? text.substring(0, 150) + '...' : text
    },
    
    formatDate(dateString) {
      if (!dateString) return ''
      
      const date = new Date(dateString)
      const now = new Date()
      const diff = now - date
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      
      if (days === 0) {
        return 'Aujourd\'hui'
      } else if (days === 1) {
        return 'Hier'
      } else if (days < 7) {
        return `Il y a ${days} jours`
      } else {
        return date.toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        })
      }
    }
  }
}
</script>

<style scoped>
.shared-notes-page {
  display: flex;
  height: 100vh;
}

.main-content {
  flex: 1;
  margin-left: 250px; /* Espace pour la sidebar */
  background-color: #f8f9fa;
  overflow-y: auto;
}

.header-section {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.hover-card {
  transition: all 0.3s ease;
  cursor: pointer;
}

.hover-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.15) !important;
}

.card {
  border: none;
  border-radius: 12px;
  overflow: hidden;
}

.card-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  padding: 1rem;
}

.card-title {
  color: #2c3e50;
  font-weight: 600;
  margin: 0;
}

.note-preview {
  color: #6c757d;
  font-size: 0.9rem;
  line-height: 1.5;
  max-height: 4.5em;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.note-meta small {
  display: block;
  margin-bottom: 0.25rem;
}

.empty-state {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin: 2rem 0;
  padding: 3rem;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1055;
}

.note-content {
  max-height: 60vh;
  overflow-y: auto;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  line-height: 1.6;
}

.note-meta-info {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
}

.badge {
  font-size: 0.75rem;
  padding: 0.35em 0.65em;
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
}

/* Responsive */
@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
  }
  
  .header-section {
    padding: 1.5rem;
  }
}
</style>