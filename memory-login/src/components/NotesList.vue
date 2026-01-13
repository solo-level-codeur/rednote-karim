<!--
  NotesList.vue
  
  🎯 ORCHESTRATEUR PRINCIPAL
  Responsabilité: Coordonner tous les sous-composants et gérer l'état global
  
  Composants utilisés:
  - NotesHeader (layout) - En-tête avec bouton
  - NoteCreateForm (forms) - Formulaire de création  
  - NotesGrid (layout) - Grille des notes
  
  État global:
  - notes, loading, error, showCreateForm, newNote
  
  Méthodes API:
  - fetchNotes(), createNote(), deleteNote()
-->
<template>
  <div class="notes-container" style="padding: 2rem 5%;">
    
    <NotesHeader 
      :showCreateForm="showCreateForm" 
      @create-note="showCreateForm = true"
      @search="showSearchModal = true" />

    <NoteCreateForm 
      :show="showCreateForm"
      :loading="loading"
      :newNote="newNote"
      @create="createNote"
      @cancel="cancelCreate" />

    <!-- ============================================ -->
    <!-- SECTION 3: GESTION D'ÉTAT - Reste dans NotesList.vue -->
    <!-- Responsabilité: Messages d'erreur, loading -->
    <!-- ============================================ -->
    <div v-if="error" class="alert alert-danger d-flex align-items-center">
      <i class="fas fa-exclamation-triangle me-2"></i>
      {{ error }}
    </div>

    <NotesGrid 
      :notes="notes"
      :loading="loading"
      @delete-note="deleteNoteConfirm"
      @tags-updated="handleTagsUpdated"
      @project-updated="handleProjectUpdated" />


    <!-- Search Modal -->
    <SimpleModal
      v-if="showSearchModal"
      :show="showSearchModal"
      title="Rechercher des notes"
      icon="fas fa-search"
      size="lg"
      @close="showSearchModal = false"
    >
      <SearchForm
        @note-selected="handleNoteSelected"
      />
    </SimpleModal>
  </div>
</template>

<script>
import { notesAPI, projectsAPI, tagsAPI, shareAPI } from '../services/api'
import NotesHeader from './NotesHeader.vue'
import NoteCreateForm from './NoteCreateForm.vue'
import NotesGrid from './NotesGrid.vue'
import SimpleModal from './SimpleModal.vue'
import SearchForm from './SearchForm.vue'

export default {
  name: 'NotesList',
  components: {
    NotesHeader,
    NoteCreateForm,
    NotesGrid,
    SimpleModal,
    SearchForm
  },
  props: {
    projectId: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      notes: [],
      loading: false,
      error: null,
      showCreateForm: false,
      showSearchModal: false,
      projects: [],
      newNote: {
        title: '',
        content: ''
      }
    }
  },
  async mounted() {
    await this.fetchNotes()
    await this.loadProjects()
  },
  watch: {
    // Recharger les notes quand on change de projet
    projectId(newProjectId, oldProjectId) {
      if (newProjectId !== oldProjectId) {
        console.log('🔄 Changement de projet:', oldProjectId, '→', newProjectId)
        this.fetchNotes()
      }
    }
  },
  methods: {
    async fetchNotes() {
      this.loading = true
      this.error = null
      
      try {
        console.log('🔍 Chargement des notes pour projectId:', this.projectId)
        
        if (this.projectId) {
          // Si on est dans un projet spécifique, récupérer seulement les notes de ce projet
          const response = await notesAPI.getAllNotesFromProject(this.projectId)
          console.log('📋 Notes du projet reçues:', response.data)
          this.notes = response.data.notes || []
        } else {
          // Sinon récupérer toutes les notes de l'utilisateur
          const response = await notesAPI.getAllNotes()
          console.log('📝 Notes personnelles reçues:', response.data)
          this.notes = response.data
        }
        
        console.log(`✅ ${this.notes.length} notes chargées`)
      } catch (error) {
        console.error('❌ Erreur lors du chargement des notes:', error)
        if (error.response?.status === 403) {
          this.error = 'Vous n\'avez pas accès à ce projet'
        } else {
          this.error = 'Erreur lors du chargement des notes'
        }
      } finally {
        this.loading = false
      }
    },
    
    async createNote(noteData) {
      if (!noteData.title || !noteData.content) {
        return
      }

      this.loading = true
      this.error = null

      try {
        // Créer la note avec les données de base
        const basicNoteData = {
          title: noteData.title,
          content: noteData.content,
          projectId: noteData.projectId || null
        }
        
        const noteResponse = await notesAPI.createNote(basicNoteData)
        const createdNote = noteResponse.data
        
        // Associer les tags si présents
        if (noteData.tags && noteData.tags.length > 0) {
          for (const tag of noteData.tags) {
            try {
              await tagsAPI.addTagToNote(createdNote.id, tag.id)
            } catch (tagError) {
              console.error('Erreur lors de l\'ajout du tag:', tagError)
            }
          }
        }
        
        // Partager la note si demandé
        if (noteData.shareSettings?.shouldShare && noteData.shareSettings?.shareEmail) {
          try {
            await shareAPI.shareNote(createdNote.id, {
              email: noteData.shareSettings.shareEmail,
              permission: 'read' // Permission par défaut
            })
          } catch (shareError) {
            console.error('Erreur lors du partage:', shareError)
            // Ne pas faire échouer la création pour une erreur de partage
          }
        }
        
        this.newNote = { title: '', content: '' }
        this.showCreateForm = false
        await this.fetchNotes()
      } catch (error) {
        // Erreur lors de la création
        this.error = 'Erreur lors de la création de la note'
        console.error('Erreur lors de la création de la note:', error)
      } finally {
        this.loading = false
      }
    },

    cancelCreate() {
      this.showCreateForm = false
      this.newNote = { title: '', content: '' }
    },


    async deleteNoteConfirm(note) {
      if (confirm(`Êtes-vous sûr de vouloir supprimer la note "${note.title}" ?`)) {
        await this.deleteNote(note.note_id)
      }
    },

    async deleteNote(noteId) {
      this.loading = true
      this.error = null

      try {
        await notesAPI.deleteNote(noteId)
        await this.fetchNotes()
      } catch (error) {
        // Erreur lors de la suppression
        this.error = 'Erreur lors de la suppression de la note'
      } finally {
        this.loading = false
      }
    },

    handleTagsUpdated(noteId, tags) {
      console.log('Tags mis à jour pour la note:', noteId, tags)
      // Optionnel: mettre à jour localement la note avec les nouveaux tags
      // ou rafraîchir les données si nécessaire
    },

    handleProjectUpdated(noteId, projectId) {
      console.log('Projet mis à jour pour la note:', noteId, projectId)
      // Optionnel: mettre à jour localement la note avec le nouveau projet
      // ou rafraîchir les données si nécessaire
    },

    async loadProjects() {
      try {
        const response = await projectsAPI.getAllProjects()
        this.projects = response.data
      } catch (error) {
        console.error('Erreur lors du chargement des projets:', error)
      }
    },


    handleNoteSelected(note) {
      this.showSearchModal = false
      this.$router.push(`/notes/${note.note_id}`)
    }
  }
}
</script>

<style scoped>
.notes-container {
  max-width: 1200px;
  margin: 0 auto;
}

</style>