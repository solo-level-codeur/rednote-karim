<template>
  <div class="note-detail-layout">
    <Sidebar />
    
    <main class="main-content">
      <!-- Header de navigation -->
      <div class="note-header bg-white border-bottom px-4 py-3">
        <div class="d-flex justify-content-between align-items-center">
          <div class="d-flex align-items-center">
            <button 
              class="btn btn-outline-secondary me-3"
              @click="goBack"
            >
              <i class="fas fa-arrow-left"></i> Retour
            </button>
            <div>
              <h1 class="h4 mb-1">{{ note?.title || 'Chargement...' }}</h1>
              <small class="text-muted">
                <i class="fas fa-user"></i> {{ authorName }} • 
                <i class="fas fa-calendar"></i> {{ formatDate(note?.updated_at || note?.created_at) }}
                <span v-if="note?.project_name" class="ms-2">
                  <i class="fas fa-folder"></i> {{ note.project_name }}
                </span>
              </small>
            </div>
          </div>
          
          <div class="d-flex align-items-center gap-2">
            <!-- Bouton commentaires -->
            <button 
              class="btn btn-outline-primary btn-sm"
              :class="{ 'active': showComments }"
              @click="showComments = !showComments"
            >
              <i class="fas fa-comments"></i> 
              Commentaires
            </button>
            
            <!-- Mode édition -->
            <button 
              v-if="canEditNote"
              class="btn btn-sm"
              :class="isEditing ? 'btn-success' : 'btn-primary'"
              @click="toggleEditMode"
            >
              <i :class="isEditing ? 'fas fa-save' : 'fas fa-edit'"></i>
              {{ isEditing ? 'Sauvegarder' : 'Modifier' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Contenu principal -->
      <div class="note-content-wrapper">
        <div class="row h-100 g-0">
          <!-- Colonne principale : Contenu de la note -->
          <div :class="showComments ? 'col-lg-8' : 'col-12'">
            <div class="note-content-area p-4">
              <!-- Métadonnées de la note (éditable si autorisé) -->
              <div v-if="canEditNote" class="note-metadata-panel bg-light p-3 rounded mb-3">
                <div class="row g-3">
                  <!-- Titre -->
                  <div class="col-md-8">
                    <label class="form-label fw-semibold">
                      <i class="fas fa-heading me-2"></i>Titre
                    </label>
                    <input 
                      type="text" 
                      class="form-control" 
                      v-model="editableTitle"
                      @blur="updateNoteTitle"
                      placeholder="Titre de la note..."
                    >
                  </div>
                  
                  <!-- Projet -->
                  <div class="col-md-4">
                    <label class="form-label fw-semibold">
                      <i class="fas fa-folder me-2"></i>Projet
                    </label>
                    <select class="form-select" v-model="editableProjectId" @change="updateNoteProject">
                      <option value="">Note personnelle</option>
                      <option v-for="project in projects" :key="project.project_id" :value="project.project_id">
                        {{ project.project_name }}
                      </option>
                    </select>
                  </div>
                  
                  <div class="col-12">
                    <div class="tags-section">
                      <TagSelector 
                        v-if="note"
                        :noteId="note.note_id"
                        v-model="noteTags"
                        @update:modelValue="handleTagsUpdate"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Zone d'édition TipTap -->
              <div class="tiptap-container">
                <TiptapEditor 
                  v-if="note"
                  v-model="noteContent"
                  :disabled="!isEditing"
                />
              </div>
            </div>
          </div>
          
          <!-- Colonne commentaires (si activée) -->
          <div v-if="showComments" class="col-lg-4 border-start">
            <div class="comments-panel h-100 p-4">
              <CommentsSection 
                v-if="note"
                :noteId="note.note_id" 
                :currentUserId="currentUser?.id"
              />
            </div>
          </div>
        </div>
      </div>
    </main>

  </div>
</template>

<script>
// Sidebar est maintenant un composant global (voir main.js)
import CommentsSection from '../components/CommentsSection.vue'
import TagSelector from '../components/TagSelector.vue'
import TiptapEditor from '../components/TiptapEditor.vue'
import { notesAPI, projectsAPI } from '../services/api'
import { authStore } from '../stores/auth'

export default {
  name: 'NoteDetailView',
  components: {
    CommentsSection,
    TagSelector,
    TiptapEditor
  },
  data() {
    return {
      note: null,
      loading: true,
      error: null,
      isEditing: false,
      showComments: false,
      noteContent: '',
      editableTitle: '',
      editableProjectId: '',
      noteTags: [],
      projects: [],
      noteAuthor: null
    }
  },
  computed: {
    currentUser() {
      return authStore.state.user
    },
    authorName() {
      if (!this.noteAuthor) return 'Chargement...'
      if (this.noteAuthor.firstname && this.noteAuthor.lastname) {
        return `${this.noteAuthor.firstname} ${this.noteAuthor.lastname}`
      }
      return 'Auteur inconnu'
    },
    canEditNote() {
      // Utiliser la propriété calculée côté serveur si disponible, sinon fallback sur la logique locale
      if (this.note && this.note.canEdit !== undefined) {
        return this.note.canEdit
      }
      
      // Fallback pour la compatibilité avec l'ancienne API
      if (!this.note || !this.currentUser) return false
      
      const isOwner = this.note.user_id === this.currentUser.id
      const hasWritePermission = this.note.permission === 'write'
      const hasAdminPermission = this.note.permission === 'admin'
      
      return isOwner || hasWritePermission || hasAdminPermission
    },
  },
  async mounted() {
    await this.loadNote()
    await this.loadNoteAuthor()
    await this.loadProjects()
  },
  methods: {
    async loadNote() {
      const noteId = this.$route.params.id
      this.loading = true
      
      try {
        console.log('🔍 Chargement de la note:', noteId)
        const response = await notesAPI.getNoteById(noteId)
        this.note = response.data
        this.noteContent = this.note.content || ''
        
        // Initialiser les valeurs éditables
        this.editableTitle = this.note.title || ''
        this.editableProjectId = this.note.project_id || ''
        
        console.log('✅ Note chargée:', this.note)
      } catch (error) {
        console.error('❌ Erreur lors du chargement de la note:', error)
        this.error = 'Note introuvable ou accès refusé'
      } finally {
        this.loading = false
      }
    },


    toggleEditMode() {
      if (this.isEditing) {
        // Sauvegarder
        this.saveNote()
      } else {
        // Entrer en mode édition
        this.isEditing = true
        console.log('📝 Mode édition activé')
      }
    },

    async saveNote() {
      try {
        await notesAPI.updateNote(this.note.note_id, {
          title: this.note.title,
          content: this.noteContent
        })
        
        this.note.content = this.noteContent
        this.isEditing = false
        
        console.log('✅ Note sauvegardée')
      } catch (error) {
        console.error('❌ Erreur lors de la sauvegarde:', error)
      }
    },


    goBack() {
      this.$router.go(-1)
    },


    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },


    async loadProjects() {
      try {
        const response = await projectsAPI.getAllProjects()
        this.projects = response.data
      } catch (error) {
        console.error('Erreur lors du chargement des projets:', error)
      }
    },

    async updateNoteTitle() {
      if (!this.note || this.editableTitle === this.note.title) return
      
      try {
        await notesAPI.updateNote(this.note.note_id, {
          title: this.editableTitle,
          content: this.note.content
        })
        
        this.note.title = this.editableTitle
        console.log('Titre mis à jour')
      } catch (error) {
        console.error('Erreur lors de la mise à jour du titre:', error)
        this.editableTitle = this.note.title // Restaurer
      }
    },

    async updateNoteProject() {
      if (!this.note) return
      
      try {
        await notesAPI.updateNote(this.note.note_id, {
          title: this.note.title,
          content: this.note.content,
          projectId: this.editableProjectId || null
        })
        
        this.note.project_id = this.editableProjectId
        this.note.project_name = this.projects.find(p => p.project_id == this.editableProjectId)?.project_name || null
        console.log('Projet mis à jour')
      } catch (error) {
        console.error('Erreur lors de la mise à jour du projet:', error)
        this.editableProjectId = this.note.project_id || '' // Restaurer
      }
    },

    async loadNoteAuthor() {
      const noteId = this.$route.params.id
      
      try {
        const response = await notesAPI.getNoteAuthor(noteId)
        this.noteAuthor = response.data
        console.log('✅ Auteur chargé:', this.noteAuthor)
      } catch (error) {
        console.error('❌ Erreur lors du chargement de l\'auteur:', error)
        this.noteAuthor = { firstname: 'Auteur', lastname: 'inconnu' }
      }
    },

    handleTagsUpdate(updatedTags) {
      this.noteTags = updatedTags
    }
  }
}
</script>

<style scoped>
.note-detail-layout {
  display: flex;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  margin-left: 250px;
  display: flex;
  flex-direction: column;
}

.note-header {
  flex-shrink: 0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.note-content-wrapper {
  flex: 1;
  overflow: hidden;
}

.note-content-area {
  height: 100%;
  overflow-y: auto;
}

.comments-panel {
  background-color: #f8f9fa;
  overflow-y: auto;
}


@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
  }
  
  .note-content-wrapper .row {
    flex-direction: column;
  }
  
  .comments-panel {
    height: auto;
    max-height: 300px;
  }
  
  :deep(.ProseMirror) {
    padding: 1rem;
  }
}
</style>