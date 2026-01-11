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
                <i class="fas fa-calendar"></i> {{ formatDate(note?.updated_date || note?.creation_date) }}
                <span v-if="note?.project_name" class="ms-2">
                  <i class="fas fa-folder"></i> {{ note.project_name }}
                </span>
              </small>
            </div>
          </div>
          
          <div class="d-flex align-items-center gap-2">
            <!-- Bouton permissions/partage -->
            <button 
              v-if="canManageNote"
              class="btn btn-outline-info btn-sm"
              @click="showShareModal = true"
            >
              <i class="fas fa-users"></i> Gestion des droits
            </button>
            
            <!-- Bouton commentaires -->
            <button 
              class="btn btn-outline-primary btn-sm"
              :class="{ 'active': showComments }"
              @click="showComments = !showComments"
            >
              <i class="fas fa-comments"></i> 
              Commentaires ({{ commentsCount }})
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
              <!-- Zone d'édition TipTap -->
              <div class="tiptap-container">
                <div 
                  ref="tiptapEditor" 
                  class="note-editor"
                  :class="{ 'editing': isEditing, 'readonly': !isEditing }"
                ></div>
              </div>
            </div>
          </div>
          
          <!-- Colonne commentaires (si activée) -->
          <div v-if="showComments" class="col-lg-4 border-start">
            <div class="comments-panel h-100 p-4">
              <CommentsSection 
                v-if="note"
                :noteId="note.id" 
                :currentUserId="currentUser?.id_users"
                @comments-count="updateCommentsCount"
              />
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Modal de gestion des droits -->
    <ShareNoteModal
      v-if="showShareModal && note"
      :noteId="note.id"
      :noteTitle="note.title"
      @close="showShareModal = false"
    />
  </div>
</template>

<script>
import Sidebar from '../components/Sidebar.vue'
import CommentsSection from '../components/CommentsSection.vue'
import ShareNoteModal from '../components/ShareNoteModal.vue'
import { notesAPI } from '../services/api'
import { authStore } from '../stores/auth'
import { Editor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'

export default {
  name: 'NoteDetailView',
  components: {
    Sidebar,
    CommentsSection,
    ShareNoteModal
  },
  data() {
    return {
      note: null,
      loading: true,
      error: null,
      isEditing: false,
      showComments: false,
      showShareModal: false,
      commentsCount: 0,
      editor: null,
      originalContent: ''
    }
  },
  computed: {
    currentUser() {
      return authStore.state.user
    },
    authorName() {
      if (!this.note) return ''
      if (this.note.authorName) return this.note.authorName
      if (this.note.author_firstname && this.note.author_lastname) {
        return `${this.note.author_firstname} ${this.note.author_lastname}`
      }
      return 'Auteur inconnu'
    },
    canEditNote() {
      if (!this.note || !this.currentUser) return false
      // Peut éditer si propriétaire ou permission write
      return this.note.id_users === this.currentUser.id_users || 
             this.note.permission === 'write' || 
             this.note.permission === 'admin'
    },
    canManageNote() {
      if (!this.note || !this.currentUser) return false
      // Peut gérer les droits si propriétaire
      return this.note.id_users === this.currentUser.id_users
    }
  },
  async mounted() {
    await this.loadNote()
    this.initializeTipTap()
  },
  beforeUnmount() {
    if (this.editor) {
      this.editor.destroy()
    }
  },
  methods: {
    async loadNote() {
      const noteId = this.$route.params.id
      this.loading = true
      
      try {
        console.log('🔍 Chargement de la note:', noteId)
        const response = await notesAPI.getNoteById(noteId)
        this.note = response.data
        this.originalContent = this.note.content || ''
        console.log('✅ Note chargée:', this.note)
      } catch (error) {
        console.error('❌ Erreur lors du chargement de la note:', error)
        this.error = 'Note introuvable ou accès refusé'
      } finally {
        this.loading = false
      }
    },

    initializeTipTap() {
      if (this.editor) {
        this.editor.destroy()
      }

      this.editor = new Editor({
        element: this.$refs.tiptapEditor,
        extensions: [
          StarterKit,
          Placeholder.configure({
            placeholder: 'Commencez à écrire...'
          })
        ],
        content: this.note?.content || '',
        editable: false, // Commencer en mode lecture
        editorProps: {
          attributes: {
            class: 'prose prose-lg max-w-none focus:outline-none p-4'
          }
        }
      })
    },

    toggleEditMode() {
      if (this.isEditing) {
        // Sauvegarder
        this.saveNote()
      } else {
        // Entrer en mode édition
        this.isEditing = true
        this.editor.setEditable(true)
        this.editor.commands.focus()
      }
    },

    async saveNote() {
      try {
        const content = this.editor.getHTML()
        
        await notesAPI.updateNote(this.note.id, {
          title: this.note.title,
          content: content
        })
        
        this.note.content = content
        this.originalContent = content
        this.isEditing = false
        this.editor.setEditable(false)
        
        this.$toast?.success('Note sauvegardée avec succès')
        console.log('✅ Note sauvegardée')
      } catch (error) {
        console.error('❌ Erreur lors de la sauvegarde:', error)
        this.$toast?.error('Erreur lors de la sauvegarde')
      }
    },

    cancelEdit() {
      this.editor.commands.setContent(this.originalContent)
      this.isEditing = false
      this.editor.setEditable(false)
    },

    goBack() {
      this.$router.go(-1)
    },

    updateCommentsCount(count) {
      this.commentsCount = count
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

.tiptap-container {
  min-height: 500px;
}

.note-editor {
  min-height: 500px;
  border: 2px solid transparent;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.note-editor.editing {
  border-color: #007bff;
  background-color: #fff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.note-editor.readonly {
  background-color: #f8f9fa;
}

/* Styles TipTap */
:deep(.ProseMirror) {
  outline: none;
  padding: 2rem;
  min-height: 500px;
}

:deep(.ProseMirror h1) {
  font-size: 2rem;
  font-weight: bold;
  margin: 1.5rem 0 1rem;
}

:deep(.ProseMirror h2) {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 1.25rem 0 0.75rem;
}

:deep(.ProseMirror h3) {
  font-size: 1.25rem;
  font-weight: bold;
  margin: 1rem 0 0.5rem;
}

:deep(.ProseMirror p) {
  margin: 0.75rem 0;
  line-height: 1.6;
}

:deep(.ProseMirror ul, .ProseMirror ol) {
  margin: 0.75rem 0;
  padding-left: 2rem;
}

:deep(.ProseMirror blockquote) {
  border-left: 4px solid #ddd;
  padding-left: 1rem;
  margin: 1rem 0;
  color: #666;
}

:deep(.ProseMirror code) {
  background-color: #f4f4f4;
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
  font-family: 'Monaco', 'Courier New', monospace;
}

:deep(.ProseMirror pre) {
  background-color: #f4f4f4;
  padding: 1rem;
  border-radius: 6px;
  overflow-x: auto;
}

:deep(.ProseMirror .placeholder) {
  color: #aaa;
  pointer-events: none;
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