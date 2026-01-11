<!--
  DashboardView.vue
  
  🎯 DASHBOARD AVEC LAYOUT NOTES
  Responsabilité: Interface principale avec liste des notes à gauche et éditeur TipTap à droite
  
  Composants utilisés:
  - NotesListSidebar - Liste des notes avec recherche (panneau gauche)
  - NoteEditorPanel - Éditeur TipTap (panneau droit)
-->
<template>
  <div class="dashboard-layout">
    <Sidebar />
    
    <main class="main-content">
      <div class="notes-layout">
        <!-- Panneau gauche : Liste des notes -->
        <div class="notes-sidebar-container">
          <!-- Debug info (à retirer en production) -->
          <div v-if="error" class="alert alert-danger m-2">{{ error }}</div>
          
          <NotesListSidebar 
            :notes="notes"
            :loading="loading"
            :selectedNote="selectedNote"
            :projects="projects"
            @note-selected="selectNote"
            @create-note="createNewNote"
            @delete-note="deleteNote"
            @project-filter-changed="handleProjectFilterChange"
          />
        </div>
        
        <!-- Panneau droit : Éditeur -->
        <div class="notes-editor-container">
          <NoteEditorPanel 
            :note="selectedNote"
            :projects="projects"
            :isCreating="isCreating"
            :defaultProjectId="selectedProjectId"
            @note-saved="handleNoteSaved"
            @note-created="handleNoteCreated"
            @cancel-create="cancelCreate"
          />
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import Sidebar from '../components/Sidebar.vue'
import NotesListSidebar from '../components/NotesListSidebar.vue'
import NoteEditorPanel from '../components/NoteEditorPanel.vue'
import { notesAPI, projectsAPI } from '../services/api'
import { authStore } from '../stores/auth'

export default {
  name: 'DashboardView',
  components: {
    Sidebar,
    NotesListSidebar,
    NoteEditorPanel
  },
  data() {
    return {
      notes: [],
      projects: [],
      selectedNote: null,
      selectedProjectId: null,
      loading: false,
      isCreating: false,
      error: null
    }
  },
  computed: {
    userName() {
      return authStore.state.user?.username || 'Utilisateur'
    }
  },
  async mounted() {
    await this.loadNotes()
    await this.loadProjects()
  },
  methods: {
    async loadNotes() {
      this.loading = true
      this.error = null
      
      try {
        console.log('🔄 Chargement des notes...', this.selectedProjectId ? `pour projet ${this.selectedProjectId}` : 'tous projets')
        
        let allNotes = []
        
        if (this.selectedProjectId) {
          // Si un projet est sélectionné, récupérer TOUTES les notes du projet (y compris celles des autres membres)
          try {
            const projectNotesResponse = await notesAPI.getAllNotesFromProject(this.selectedProjectId)
            console.log('📋 Notes du projet reçues:', projectNotesResponse.data)
            
            // La nouvelle API retourne un objet avec { projectId, count, notes }
            allNotes = projectNotesResponse.data.notes || []
            
            console.log(`✅ ${allNotes.length} notes trouvées dans le projet ${this.selectedProjectId}`)
          } catch (error) {
            console.error('❌ Erreur lors du chargement des notes du projet:', error)
            if (error.response?.status === 403) {
              this.error = 'Vous n\'avez pas accès à ce projet'
            } else {
              this.error = 'Erreur lors du chargement des notes du projet'
            }
            allNotes = []
          }
        } else {
          // Aucun projet sélectionné : charger les notes personnelles de l'utilisateur
          try {
            const userNotesResponse = await notesAPI.getAllNotes()
            console.log('📝 Notes personnelles reçues:', userNotesResponse.data)
            allNotes = Array.isArray(userNotesResponse.data) ? userNotesResponse.data : []
            
            console.log(`✅ ${allNotes.length} notes personnelles trouvées`)
          } catch (error) {
            console.error('❌ Erreur lors du chargement des notes personnelles:', error)
            this.error = 'Erreur lors du chargement des notes personnelles'
            allNotes = []
          }
        }
        
        // Traiter les notes pour ajouter les métadonnées
        this.notes = allNotes.map(note => ({
          ...note,
          // Dans le nouveau système, les notes dans un projet peuvent provenir d'autres utilisateurs
          isShared: note.note_role === 'member' || note.author_firstname !== undefined,
          isOwner: note.note_role === 'owner' || note.note_role === undefined,
          // Ajouter les informations d'auteur si disponibles
          authorName: note.author_firstname && note.author_lastname 
            ? `${note.author_firstname} ${note.author_lastname}` 
            : null
        })).sort((a, b) => {
          const dateA = new Date(a.updated_date || a.updated_at || a.creation_date || a.created_at)
          const dateB = new Date(b.updated_date || b.updated_at || b.creation_date || b.created_at)
          return dateB - dateA
        })
        
        console.log(`📊 Total notes chargées: ${this.notes.length}`)
        if (this.notes.length > 0) {
          console.log('📋 Notes détails:', this.notes.map(n => ({
            id: n.id, 
            title: n.title, 
            project: n.id_projects,
            author: n.authorName || 'Moi',
            role: n.note_role || 'owner'
          })))
        }
      } catch (error) {
        this.error = 'Erreur lors du chargement des notes'
        console.error('💥 Erreur globale lors du chargement des notes:', error)
      } finally {
        this.loading = false
      }
    },

    async loadProjects() {
      try {
        const response = await projectsAPI.getAllProjects()
        this.projects = response.data
      } catch (error) {
        console.error('Erreur lors du chargement des projets:', error)
      }
    },

    selectNote(note) {
      this.selectedNote = note
      this.isCreating = false
    },

    createNewNote() {
      this.selectedNote = null
      this.isCreating = true
    },

    async deleteNote(note) {
      this.loading = true
      
      try {
        await notesAPI.deleteNote(note.id)
        
        // Retirer la note de la liste locale
        this.notes = this.notes.filter(n => n.id !== note.id)
        
        // Si la note supprimée était sélectionnée, désélectionner
        if (this.selectedNote && this.selectedNote.id === note.id) {
          this.selectedNote = null
          this.isCreating = false
        }
      } catch (error) {
        this.error = 'Erreur lors de la suppression de la note'
        console.error('Erreur lors de la suppression:', error)
      } finally {
        this.loading = false
      }
    },

    handleNoteSaved(updatedNote) {
      // Mettre à jour la note dans la liste locale
      const index = this.notes.findIndex(n => n.id === updatedNote.id)
      if (index !== -1) {
        this.notes[index] = updatedNote
      }
      
      // Mettre à jour la note sélectionnée
      this.selectedNote = updatedNote
    },

    async handleNoteCreated(createdNote) {
      // Ajouter la nouvelle note au début de la liste
      this.notes.unshift(createdNote)
      
      // Sélectionner la nouvelle note
      this.selectedNote = createdNote
      this.isCreating = false
    },

    cancelCreate() {
      this.isCreating = false
      
      // Si aucune note n'était sélectionnée avant la création, rester sur l'état vide
      if (!this.selectedNote) {
        this.selectedNote = null
      }
    },

    async handleProjectFilterChange(projectId) {
      this.selectedProjectId = projectId
      this.selectedNote = null // Réinitialiser la note sélectionnée
      this.isCreating = false
      await this.loadNotes() // Recharger les notes avec le nouveau filtre
    }
  }
}
</script>

<style scoped>
.dashboard-layout {
  display: flex;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  margin-left: 250px;
  display: flex;
  flex-direction: column;
}

.notes-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.notes-sidebar-container {
  width: 350px;
  min-width: 350px;
  border-right: 1px solid #dee2e6;
}

.notes-editor-container {
  flex: 1;
  overflow: hidden;
}

@media (max-width: 1200px) {
  .notes-sidebar-container {
    width: 300px;
    min-width: 300px;
  }
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
  }
  
  .notes-layout {
    flex-direction: column;
  }
  
  .notes-sidebar-container {
    width: 100%;
    height: 40vh;
    border-right: none;
    border-bottom: 1px solid #dee2e6;
  }
  
  .notes-editor-container {
    height: 60vh;
  }
}
</style>