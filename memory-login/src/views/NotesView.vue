<!--
  NotesView.vue
  
  🎯 NOTES WORKSPACE ORCHESTRATEUR
  Responsabilité: Coordonner les composants workspace et gérer l'état global
  
  Composants utilisés:
  - Sidebar (global) - Navigation latérale
  - WorkspaceHeader (layout) - En-tête avec recherche
  - NotesSidebar (layout) - Liste des notes
  - NotesEditor (editor) - Éditeur principal
  
  État global:
  - notes, currentNote, loading, searchQuery
  
  Méthodes API:
  - fetchNotes(), createNote(), updateNote(), deleteNote()
-->
<template>
  <div class="notes-workspace">
    <Sidebar />
    
    <main class="workspace-main">
      <WorkspaceHeader 
        :searchQuery="searchQuery"
        @update:searchQuery="searchQuery = $event"
        @create-note="createNote" />
      
      <div class="workspace-body">
        <NotesSidebar 
          :notes="notes"
          :currentNote="currentNote"
          :loading="loading"
          :searchQuery="searchQuery"
          @select-note="selectNote"
          @delete-note="deleteNote"
          @create-note="createNote" />
        
        <NotesEditor 
          :currentNote="currentNote"
          :loading="saving"
          @update-note="updateNote"
          @create-note="createNote" />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Sidebar from '../components/Side.vue'
import WorkspaceHeader from '../components/workspace/layout/WorkspaceHeader.vue'
import NotesSidebar from '../components/workspace/layout/NotesSidebar.vue'
import NotesEditor from '../components/workspace/editor/NotesEditor.vue'
import { notesAPI } from '../services/api'

// State
const notes = ref([])
const currentNote = ref(null)
const loading = ref(false)
const saving = ref(false)
const searchQuery = ref('')

let saveTimeout = null

// Fonctions principales
const fetchNotes = async () => {
  loading.value = true
  try {
    const response = await notesAPI.getAllNotes()
    notes.value = response.data
  } catch (error) {
    // Erreur lors du chargement
  } finally {
    loading.value = false
  }
}

const selectNote = (note) => {
  currentNote.value = note
}

const createNote = async () => {
  try {
    const newNote = {
      title: 'Nouvelle note',
      content: ''
    }
    
    const response = await notesAPI.createNote(newNote)
    await fetchNotes()
    
    // Sélectionner la nouvelle note
    if (response.data) {
      currentNote.value = response.data
    }
  } catch (error) {
    // Erreur lors du chargement
    alert('Erreur lors de la création de la note')
  }
}

const updateNote = (updatedNote) => {
  // Mettre à jour la note actuelle
  currentNote.value = updatedNote
  
  // Mettre à jour dans la liste
  const index = notes.value.findIndex(note => note.id === updatedNote.id)
  if (index !== -1) {
    notes.value[index] = updatedNote
  }
  
  // Sauvegarder avec debounce
  debouncedSave()
}

const debouncedSave = () => {
  if (saveTimeout) {
    clearTimeout(saveTimeout)
  }
  
  saving.value = true
  
  saveTimeout = setTimeout(async () => {
    if (currentNote.value) {
      try {
        await notesAPI.updateNote(currentNote.value.id, {
          title: currentNote.value.title,
          content: currentNote.value.content
        })
      } catch (error) {
        // Erreur lors de la sauvegarde
      } finally {
        saving.value = false
      }
    }
  }, 1000)
}

const deleteNote = async (noteId) => {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cette note ?')) return
  
  try {
    await notesAPI.deleteNote(noteId)
    if (currentNote.value?.id === noteId) {
      currentNote.value = null
    }
    await fetchNotes()
  } catch (error) {
    // Erreur lors du chargement
    alert('Erreur lors de la suppression')
  }
}

// Initialisation
onMounted(() => {
  fetchNotes()
})
</script>

<style scoped>
.notes-workspace {
  display: flex;
  height: 100vh;
}

.workspace-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 250px; /* Espace pour la sidebar */
}

.workspace-body {
  flex: 1;
  display: flex;
  height: calc(100vh - 80px); /* Hauteur moins le header */
}

/* Responsive */
@media (max-width: 768px) {
  .workspace-main {
    margin-left: 0;
  }
  
  .workspace-body {
    flex-direction: column;
  }
}
</style>