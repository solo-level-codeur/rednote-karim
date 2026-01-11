<template>
  <div class="note-editor-panel">
    <div v-if="!note && !isCreating" class="empty-state">
      <i class="fas fa-sticky-note fa-4x text-muted mb-3"></i>
      <h5 class="text-muted">Sélectionnez une note</h5>
      <p class="text-muted">Choisissez une note dans la liste à gauche pour la modifier</p>
    </div>

    <div v-else class="editor-container">
      <!-- En-tête de l'éditeur -->
      <div class="editor-header">
        <div class="row align-items-center">
          <div class="col-md-8">
            <input 
              type="text" 
              class="form-control form-control-lg"
              placeholder="Titre de la note..."
              v-model="formData.title"
              @input="debouncedSave"
              :disabled="!canEdit"
            >
          </div>
          <div class="col-md-4">
            <select class="form-select" v-model="formData.projectId" @change="debouncedSave" :disabled="!canEdit">
              <option value="">Note personnelle</option>
              <option v-for="project in projects" :key="project.id" :value="project.id">
                {{ project.name }}
              </option>
            </select>
          </div>
        </div>

        <!-- Tags Section -->
        <div class="tags-section mt-3">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <label class="form-label mb-0">Tags</label>
            <button 
              type="button" 
              class="btn btn-sm btn-outline-primary"
              @click="showTagModal = true"
              v-if="canEdit"
            >
              <i class="fas fa-plus"></i> Nouveau tag
            </button>
          </div>

          <div class="selected-tags mb-2" v-if="selectedTags.length > 0">
            <span 
              v-for="tag in selectedTags" 
              :key="tag.id"
              class="badge me-1"
              :style="{ backgroundColor: tag.color }"
            >
              {{ tag.name }}
              <button 
                v-if="canEdit"
                type="button" 
                class="btn-close btn-close-white ms-1"
                style="font-size: 0.6rem;"
                @click="removeTag(tag.id)"
              ></button>
            </span>
          </div>
          
          <div class="available-tags" v-if="availableTags.length > 0 && canEdit">
            <small class="text-muted d-block mb-1">Ajouter des tags :</small>
            <span 
              v-for="tag in availableTags" 
              :key="tag.id"
              class="badge badge-clickable me-1 mb-1"
              :style="{ backgroundColor: tag.color, cursor: 'pointer', opacity: 0.7 }"
              @click="addTag(tag)"
            >
              {{ tag.name }}
            </span>
          </div>
        </div>

        <!-- Barre d'outils -->
        <div class="toolbar-section mt-3">
          <EditorToolbar :editor="editor" />
        </div>
      </div>

      <!-- Zone d'édition -->
      <div class="editor-content-area">
        <div v-if="!canEdit && !isCreating" class="read-only-banner">
          <i class="fas fa-eye"></i> Mode lecture seule
        </div>
        <EditorContent 
          :editor="editor" 
          class="tiptap-editor"
          :class="{ 'read-only': !canEdit && !isCreating }"
        />
      </div>

      <!-- Actions -->
      <div class="editor-actions">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <span v-if="isCreating" class="badge bg-success">Nouvelle note</span>
            <span v-else-if="lastSaved" class="text-muted small">
              <i class="fas fa-save"></i> Sauvegardé {{ formatDate(lastSaved) }}
            </span>
          </div>
          
          <div>
            <button 
              v-if="isCreating"
              type="button" 
              class="btn btn-outline-secondary me-2" 
              @click="cancelCreate"
            >
              Annuler
            </button>
            
            <button 
              v-if="!isCreating && canEdit"
              type="button" 
              class="btn btn-outline-info me-2" 
              @click="showShareModal = true"
            >
              <i class="fas fa-share-alt"></i> Partager
            </button>

            <button 
              v-if="canEdit"
              type="button" 
              class="btn btn-primary" 
              @click="saveNote"
              :disabled="!formData.title.trim()"
            >
              <i class="fas fa-save"></i> {{ isCreating ? 'Créer' : 'Sauvegarder' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <ShareNoteModal
      v-if="showShareModal && note"
      :noteId="note.id"
      :noteTitle="note.title"
      @close="showShareModal = false"
    />

    <TagModal
      v-if="showTagModal"
      @save="handleTagCreate"
      @cancel="showTagModal = false"
    />
  </div>
</template>

<script>
import { Editor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import { TextStyle } from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import EditorToolbar from './toolbar/EditorToolbar.vue'
import ShareNoteModal from './ShareNoteModal.vue'
import TagModal from './TagModal.vue'
import { notesAPI, tagsAPI, shareAPI } from '@/services/api'
import { authStore } from '@/stores/auth'

export default {
  name: 'NoteEditorPanel',
  components: {
    EditorContent,
    EditorToolbar,
    ShareNoteModal,
    TagModal
  },
  props: {
    note: {
      type: Object,
      default: null
    },
    projects: {
      type: Array,
      default: () => []
    },
    isCreating: {
      type: Boolean,
      default: false
    },
    defaultProjectId: {
      type: [String, Number],
      default: null
    }
  },
  emits: ['note-saved', 'note-created', 'cancel-create'],
  data() {
    return {
      editor: null,
      formData: {
        title: '',
        content: '',
        projectId: ''
      },
      selectedTags: [],
      availableTags: [],
      lastSaved: null,
      saveTimeout: null,
      showShareModal: false,
      showTagModal: false,
      notePermission: null,
      isOwner: true
    }
  },
  watch: {
    note: {
      handler(newNote) {
        this.initializeForm()
        if (newNote) {
          this.loadNoteTags()
        } else {
          this.selectedTags = []
        }
      },
      immediate: true
    },
    isCreating(newVal) {
      if (newVal) {
        this.initializeNewNote()
      }
    }
  },
  computed: {
    currentUser() {
      return authStore.state.user
    },
    canEdit() {
      // Si on est en train de créer une nouvelle note, on peut éditer
      if (this.isCreating) return true
      
      // Si pas de note sélectionnée, pas d'édition possible
      if (!this.note) return false
      
      // Si c'est le propriétaire de la note
      if (this.isOwner) return true
      
      // Si la note est partagée avec des droits d'écriture
      return this.notePermission === 'write'
    }
  },
  async mounted() {
    this.initializeEditor()
    await this.loadTags()
  },
  beforeUnmount() {
    if (this.editor) {
      this.editor.destroy()
    }
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout)
    }
  },
  methods: {
    async initializeForm() {
      if (this.note) {
        this.formData = {
          title: this.note.title || '',
          content: this.note.content || '',
          projectId: this.note.id_projects || ''
        }
        
        // Vérifier les permissions pour cette note
        await this.checkNotePermissions()
        
        if (this.editor) {
          this.editor.commands.setContent(this.formData.content)
          // Désactiver l'édition si pas de droits d'écriture
          this.editor.setEditable(this.canEdit)
        }
      } else if (this.isCreating) {
        this.initializeNewNote()
      } else {
        this.formData = {
          title: '',
          content: '',
          projectId: ''
        }
        
        this.notePermission = null
        this.isOwner = true
        
        if (this.editor) {
          this.editor.commands.setContent('')
          this.editor.setEditable(true)
        }
      }
    },

    initializeNewNote() {
      this.formData = {
        title: '',
        content: '<p>Commencez à écrire votre note...</p>',
        projectId: this.defaultProjectId || ''
      }
      this.selectedTags = []
      
      if (this.editor) {
        this.editor.commands.setContent(this.formData.content)
      }
    },

    initializeEditor() {
      this.editor = new Editor({
        extensions: [
          StarterKit,
          Underline,
          TextStyle,
          Color,
          Highlight.configure({
            multicolor: true
          }),
          TextAlign.configure({
            types: ['heading', 'paragraph'],
          }),
          Link.configure({
            openOnClick: false,
          }),
          Image.configure({
            inline: true,
            allowBase64: true,
          }),
          TaskList,
          TaskItem.configure({
            nested: true,
          }),
        ],
        content: this.formData.content,
        onUpdate: ({ editor }) => {
          this.formData.content = editor.getHTML()
          this.debouncedSave()
        },
        editorProps: {
          attributes: {
            class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none p-4',
          },
        },
      })
    },

    async loadTags() {
      try {
        const response = await tagsAPI.getAllTags()
        this.availableTags = response.data.filter(tag => 
          !this.selectedTags.find(selected => selected.id === tag.id)
        )
      } catch (error) {
        console.error('Erreur lors du chargement des tags:', error)
      }
    },

    async loadNoteTags() {
      if (!this.note?.id) return
      
      try {
        const response = await tagsAPI.getNoteTags(this.note.id)
        this.selectedTags = response.data
        this.availableTags = this.availableTags.filter(tag => 
          !this.selectedTags.find(selected => selected.id === tag.id)
        )
      } catch (error) {
        console.error('Erreur lors du chargement des tags de la note:', error)
      }
    },

    addTag(tag) {
      this.selectedTags.push(tag)
      this.availableTags = this.availableTags.filter(t => t.id !== tag.id)
      this.debouncedSave()
    },

    removeTag(tagId) {
      const tag = this.selectedTags.find(t => t.id === tagId)
      if (tag) {
        this.selectedTags = this.selectedTags.filter(t => t.id !== tagId)
        this.availableTags.push(tag)
        this.debouncedSave()
      }
    },

    debouncedSave() {
      if (this.isCreating || !this.note) return
      
      if (this.saveTimeout) {
        clearTimeout(this.saveTimeout)
      }
      
      this.saveTimeout = setTimeout(() => {
        this.autoSave()
      }, 2000) // Sauvegarde automatique après 2 secondes d'inactivité
    },

    async autoSave() {
      if (!this.note || this.isCreating) return
      
      try {
        const noteData = {
          title: this.formData.title.trim() || 'Sans titre',
          content: this.formData.content,
          projectId: this.formData.projectId || null
        }

        await notesAPI.updateNote(this.note.id, noteData)
        await this.updateNoteTags(this.note.id)
        
        this.lastSaved = new Date()
        this.$emit('note-saved', { ...this.note, ...noteData })
      } catch (error) {
        console.error('Erreur lors de la sauvegarde automatique:', error)
      }
    },

    async saveNote() {
      if (!this.formData.title.trim()) {
        alert('Veuillez saisir un titre pour la note')
        return
      }

      try {
        const noteData = {
          title: this.formData.title.trim(),
          content: this.formData.content,
          projectId: this.formData.projectId || null
        }

        if (this.isCreating) {
          // Création d'une nouvelle note
          const response = await notesAPI.createNote(noteData)
          const createdNote = response.data
          
          // Associer les tags
          await this.updateNoteTags(createdNote.id)
          
          this.$emit('note-created', createdNote)
        } else {
          // Modification d'une note existante
          await notesAPI.updateNote(this.note.id, noteData)
          await this.updateNoteTags(this.note.id)
          
          this.lastSaved = new Date()
          this.$emit('note-saved', { ...this.note, ...noteData })
        }
      } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error)
        alert('Erreur lors de la sauvegarde de la note')
      }
    },

    async updateNoteTags(noteId) {
      if (!noteId) return

      try {
        // Récupérer les tags actuels de la note
        const currentTagsResponse = await tagsAPI.getNoteTags(noteId)
        const currentTags = currentTagsResponse.data

        // Tags à ajouter
        const tagsToAdd = this.selectedTags.filter(tag => 
          !currentTags.find(current => current.id === tag.id)
        )

        // Tags à supprimer
        const tagsToRemove = currentTags.filter(tag => 
          !this.selectedTags.find(selected => selected.id === tag.id)
        )

        // Ajouter les nouveaux tags
        for (const tag of tagsToAdd) {
          await tagsAPI.addTagToNote(noteId, tag.id)
        }

        // Supprimer les tags non sélectionnés
        for (const tag of tagsToRemove) {
          await tagsAPI.removeTagFromNote(noteId, tag.id)
        }
      } catch (error) {
        console.error('Erreur lors de la mise à jour des tags:', error)
      }
    },

    cancelCreate() {
      this.$emit('cancel-create')
    },

    async checkNotePermissions() {
      if (!this.note || !this.currentUser) return
      
      try {
        // Vérifier si l'utilisateur actuel est le propriétaire de la note
        this.isOwner = this.note.user_id === this.currentUser.id_users
        
        if (!this.isOwner) {
          // Vérifier les permissions de partage
          const response = await shareAPI.getNoteShares(this.note.id)
          const shares = response.data.shares || []
          const userShare = shares.find(share => share.id_users === this.currentUser.id_users)
          
          if (userShare) {
            this.notePermission = userShare.permission
          } else {
            this.notePermission = null // Pas d'accès
          }
        } else {
          this.notePermission = 'write' // Le propriétaire a toujours les droits d'écriture
        }
      } catch (error) {
        console.error('Erreur lors de la vérification des permissions:', error)
        this.notePermission = null
        this.isOwner = false
      }
    },

    async handleTagCreate(tagData) {
      try {
        const response = await tagsAPI.createTag(tagData)
        const newTag = response.data
        
        // Ajouter le nouveau tag à la liste des tags disponibles
        this.availableTags.push(newTag)
        
        // Fermer la modal
        this.showTagModal = false
        
        // Optionnel : ajouter automatiquement le nouveau tag à la note
        if (this.note && this.canEdit) {
          this.addTag(newTag)
        }
      } catch (error) {
        console.error('Erreur lors de la création du tag:', error)
        alert('Erreur lors de la création du tag')
      }
    },

    formatDate(date) {
      const now = new Date()
      const diffInMs = now - date
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
      
      if (diffInMinutes < 1) {
        return 'à l\'instant'
      } else if (diffInMinutes < 60) {
        return `il y a ${diffInMinutes} min`
      } else {
        return date.toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit'
        })
      }
    }
  }
}
</script>

<style scoped>
.note-editor-panel {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: white;
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

.editor-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.editor-header {
  padding: 1.5rem;
  border-bottom: 1px solid #dee2e6;
  background: #f8f9fa;
}

.tags-section {
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 0.375rem;
  border: 1px solid #dee2e6;
}

.badge-clickable:hover {
  opacity: 1 !important;
  transform: scale(1.05);
}

.toolbar-section {
  border-top: 1px solid #dee2e6;
  background: white;
  padding-top: 1rem;
}

.editor-content-area {
  flex: 1;
  overflow-y: auto;
  background: white;
}

.tiptap-editor {
  height: 100%;
  min-height: 400px;
}

.tiptap-editor :deep(.ProseMirror) {
  height: 100%;
  min-height: 400px;
  outline: none;
  padding: 2rem;
}

.tiptap-editor :deep(.ProseMirror h1, .ProseMirror h2, .ProseMirror h3) {
  font-weight: bold;
}

.tiptap-editor :deep(.ProseMirror ul, .ProseMirror ol) {
  padding-left: 20px;
}

.tiptap-editor :deep(.ProseMirror blockquote) {
  border-left: 3px solid #ddd;
  padding: 10px;
  background: #f5f5f5;
}

.tiptap-editor :deep(.ProseMirror pre, .ProseMirror code) {
  background: #f5f5f5;
  font-family: monospace;
}

.tiptap-editor :deep(.ProseMirror pre) {
  padding: 10px;
}

.tiptap-editor :deep(.ProseMirror code) {
  padding: 2px 4px;
}

.tiptap-editor :deep(.ProseMirror img) {
  max-width: 100%;
}

.editor-actions {
  padding: 1rem 1.5rem;
  border-top: 1px solid #dee2e6;
  background: #f8f9fa;
}

/* Mode lecture seule */
.read-only-banner {
  background: #fff3cd;
  color: #856404;
  padding: 0.5rem 1rem;
  text-align: center;
  border-bottom: 1px solid #ffeaa7;
  font-size: 0.9rem;
}

.tiptap-editor.read-only {
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 0.375rem;
}

.tiptap-editor.read-only :deep(.ProseMirror) {
  background-color: #f8f9fa;
  cursor: default;
}

/* Scrollbar personnalisée */
.editor-content-area::-webkit-scrollbar {
  width: 8px;
}

.editor-content-area::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.editor-content-area::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.editor-content-area::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

@media (max-width: 768px) {
  .editor-header {
    padding: 1rem;
  }
  
  .tiptap-editor :deep(.ProseMirror) {
    padding: 1rem;
  }
  
  .editor-actions {
    padding: 1rem;
  }
}
</style>