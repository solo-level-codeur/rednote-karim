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
      @create-note="showCreateForm = true" />

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
    <div v-if="error" class="notification is-danger">
      {{ error }}
    </div>

    <NotesGrid 
      :notes="notes"
      :loading="loading"
      @edit-note="editNote"
      @delete-note="deleteNoteConfirm" />
  </div>
</template>

<script>
import { notesAPI } from '../../services/api'
import NotesHeader from './layout/NotesHeader.vue'
import NoteCreateForm from './forms/NoteCreateForm.vue'
import NotesGrid from './layout/NotesGrid.vue'

export default {
  name: 'NotesList',
  components: {
    NotesHeader,
    NoteCreateForm,
    NotesGrid
  },
  data() {
    return {
      notes: [],
      loading: false,
      error: null,
      showCreateForm: false,
      newNote: {
        title: '',
        content: ''
      }
    }
  },
  async mounted() {
    await this.fetchNotes()
  },
  methods: {
    async fetchNotes() {
      this.loading = true
      this.error = null
      
      try {
        const response = await notesAPI.getAllNotes()
        this.notes = response.data
      } catch (error) {
        // Erreur lors du chargement des notes
        this.error = 'Erreur lors du chargement des notes'
      } finally {
        this.loading = false
      }
    },
    
    async createNote() {
      if (!this.newNote.title || !this.newNote.content) {
        return
      }

      this.loading = true
      this.error = null

      try {
        await notesAPI.createNote(this.newNote)
        this.newNote = { title: '', content: '' }
        this.showCreateForm = false
        await this.fetchNotes()
      } catch (error) {
        // Erreur lors de la création
        this.error = 'Erreur lors de la création de la note'
      } finally {
        this.loading = false
      }
    },

    cancelCreate() {
      this.showCreateForm = false
      this.newNote = { title: '', content: '' }
    },

    editNote(note) {
      // Rediriger vers NotesView pour l'édition avec TipTap
      this.$router.push('/notes')
    },

    async deleteNoteConfirm(note) {
      if (confirm(`Êtes-vous sûr de vouloir supprimer la note "${note.title}" ?`)) {
        await this.deleteNote(note.id)
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