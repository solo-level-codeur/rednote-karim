<template>
  <div class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
    <div class="modal-dialog modal-xl">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            {{ note ? 'Modifier la note' : 'Nouvelle note' }}
          </h5>
          <button type="button" class="btn-close" @click="$emit('cancel')"></button>
        </div>
        
        <form @submit.prevent="handleSubmit">
          <div class="modal-body">
            <div class="row mb-3">
              <div class="col-md-8">
                <label for="noteTitle" class="form-label">Titre *</label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="noteTitle"
                  v-model="formData.title"
                  required
                  maxlength="100"
                  placeholder="Titre de la note..."
                >
              </div>
              
              <div class="col-md-4">
                <label for="noteProject" class="form-label">Projet</label>
                <select class="form-select" id="noteProject" v-model="formData.projectId">
                  <option value="">Note personnelle</option>
                  <option v-for="project in projects" :key="project.id" :value="project.id">
                    {{ project.name }}
                  </option>
                </select>
              </div>
            </div>
            
            <div class="mb-3">
              <label class="form-label">Contenu</label>
              <div class="editor-container">
                <div ref="editor" class="note-editor"></div>
              </div>
            </div>

            <!-- Tags Section -->
            <div class="mb-3">
              <label class="form-label">Tags</label>
              <div class="tags-section">
                <div class="selected-tags mb-2" v-if="selectedTags.length > 0">
                  <span 
                    v-for="tag in selectedTags" 
                    :key="tag.id"
                    class="badge me-1"
                    :style="{ backgroundColor: tag.color }"
                  >
                    {{ tag.name }}
                    <button 
                      type="button" 
                      class="btn-close btn-close-white ms-1"
                      style="font-size: 0.6rem;"
                      @click="removeTag(tag.id)"
                    ></button>
                  </span>
                </div>
                
                <div class="available-tags">
                  <small class="text-muted d-block mb-2">Tags disponibles :</small>
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
            </div>
          </div>
          
          <div class="modal-footer d-flex justify-content-between">
            <div>
              <button 
                v-if="note"
                type="button" 
                class="btn btn-outline-info me-2" 
                @click="showShareModal = true"
              >
                <i class="fas fa-share-alt"></i> Partager
              </button>
              
              <button 
                v-if="note"
                type="button" 
                class="btn btn-outline-secondary" 
                @click="showComments = !showComments"
              >
                <i class="fas fa-comments"></i> 
                {{ showComments ? 'Masquer commentaires' : 'Voir commentaires' }}
              </button>
            </div>
            
            <div>
              <button type="button" class="btn btn-secondary me-2" @click="$emit('cancel')">
                Annuler
              </button>
              <button type="submit" class="btn btn-primary" :disabled="!formData.title.trim()">
                {{ note ? 'Modifier' : 'Créer' }}
              </button>
            </div>
          </div>
        </form>

        <!-- Comments Section -->
        <div v-if="showComments && note" class="modal-footer border-top">
          <div class="w-100">
            <CommentsSection 
              :noteId="note.id" 
              :currentUserId="currentUser?.id_users"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Share Modal -->
    <ShareNoteModal
      v-if="showShareModal && note"
      :noteId="note.id"
      :noteTitle="note.title"
      @close="showShareModal = false"
    />
  </div>
</template>

<script>
import { Editor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import { notesAPI, tagsAPI } from '@/services/api'
import CommentsSection from './CommentsSection.vue'
import ShareNoteModal from './ShareNoteModal.vue'
import { authStore } from '@/stores/auth'

export default {
  name: 'NoteEditorModal',
  components: {
    CommentsSection,
    ShareNoteModal
  },
  props: {
    note: {
      type: Object,
      default: null
    },
    projects: {
      type: Array,
      default: () => []
    }
  },
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
      showComments: false,
      showShareModal: false
    }
  },
  computed: {
    currentUser() {
      return authStore.state.user
    }
  },
  async mounted() {
    this.initializeForm()
    this.initializeEditor()
    await this.loadTags()
    
    if (this.note) {
      await this.loadNoteTags()
    }
  },
  beforeUnmount() {
    if (this.editor) {
      this.editor.destroy()
    }
  },
  methods: {
    initializeForm() {
      if (this.note) {
        this.formData = {
          title: this.note.title || '',
          content: this.note.content || '',
          projectId: this.note.id_projects || ''
        }
      }
    },

    initializeEditor() {
      this.editor = new Editor({
        element: this.$refs.editor,
        extensions: [StarterKit],
        content: this.formData.content,
        onUpdate: ({ editor }) => {
          this.formData.content = editor.getHTML()
        },
        editorProps: {
          attributes: {
            class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-48 p-3 border rounded',
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
        // Retirer les tags sélectionnés des tags disponibles
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
    },

    removeTag(tagId) {
      const tag = this.selectedTags.find(t => t.id === tagId)
      if (tag) {
        this.selectedTags = this.selectedTags.filter(t => t.id !== tagId)
        this.availableTags.push(tag)
      }
    },

    async handleSubmit() {
      try {
        const noteData = {
          title: this.formData.title.trim(),
          content: this.formData.content,
          projectId: this.formData.projectId || null
        }

        let savedNote
        if (this.note) {
          // Modification
          await notesAPI.updateNote(this.note.id, noteData)
          savedNote = { ...this.note, ...noteData }
        } else {
          // Création
          const response = await notesAPI.createNote(noteData)
          savedNote = response.data
        }

        // Gérer les tags
        if (this.note) {
          await this.updateNoteTags(this.note.id)
        } else if (savedNote.id) {
          await this.updateNoteTags(savedNote.id)
        }

        this.$emit('save', savedNote)
      } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error)
        this.$toast.error('Erreur lors de la sauvegarde de la note')
      }
    },

    async updateNoteTags(noteId) {
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

.editor-container {
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  min-height: 300px;
}

.note-editor {
  min-height: 300px;
  padding: 1rem;
}

.note-editor:focus {
  outline: none;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
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

.selected-tags .badge {
  display: inline-flex;
  align-items: center;
}

.available-tags {
  max-height: 120px;
  overflow-y: auto;
}

@media (max-width: 768px) {
  .modal-dialog {
    margin: 1rem;
    max-width: calc(100vw - 2rem);
  }
  
  .editor-container {
    min-height: 200px;
  }
  
  .note-editor {
    min-height: 200px;
    padding: 0.75rem;
  }
}
</style>