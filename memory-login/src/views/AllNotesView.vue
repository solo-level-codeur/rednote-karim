<template>
  <div class="all-notes-layout">
    <Sidebar />
    
    <main class="main-content">
      <div class="hero-section">
        <DashboardHeader 
          userName="All Notes"
          @logout="() => {}" />
      </div>

      <div class="dashboard-content">
        <!-- Header Section -->
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h2 class="fw-bold mb-0 text-dark">Notes</h2>
          <button class="btn btn-danger" @click="showCreateForm = true">
            <i class="fas fa-plus me-2"></i>New Note
          </button>
        </div>

        <!-- Search and Filters -->
        <SearchFilterBar v-model="searchQuery" />

        <!-- Notes Table -->
        <NotesTable 
          :notes="filteredNotes" 
          :loading="loading" 
          @open-note="openNote" 
        />
      </div>
    </main>

    <!-- Create Note Modal -->
    <NoteCreateForm 
      v-if="showCreateForm"
      :show="showCreateForm"
      @create="handleCreateNote"
      @cancel="showCreateForm = false" 
    />

    <!-- Note Editor/Viewer Modal -->
    <NoteEditorModal 
      v-if="selectedNote"
      :note="selectedNote"
      @save="handleNoteSave"
      @cancel="selectedNote = null"
    />
  </div>
</template>

<script>
import Sidebar from '../components/Sidebar.vue'
import DashboardHeader from '../components/dashboard/DashboardHeader.vue'
import NoteCreateForm from '../components/notes/forms/NoteCreateForm.vue'
import NoteEditorModal from '../components/NoteEditorModal.vue'
import SearchFilterBar from '../components/common/SearchFilterBar.vue'
import NotesTable from '../components/common/NotesTable.vue'
import { notesAPI, shareAPI } from '../services/api'
import { authStore } from '../stores/auth'

export default {
  name: 'AllNotesView',
  components: {
    Sidebar,
    DashboardHeader,
    NoteCreateForm,
    NoteEditorModal,
    SearchFilterBar,
    NotesTable
  },
  data() {
    return {
      personalNotes: [],
      sharedNotes: [],
      loading: true,
      searchQuery: '',
      showCreateForm: false,
      selectedNote: null
    }
  },
  computed: {
    allNotes() {
      // Transform and merge notes
      const personal = this.personalNotes.map(note => ({
        ...note,
        type: 'personal',
        authorName: 'Me', // Or user's name from store
        uniqueId: `p-${note.id}`,
        permission: 'write' // Owner has full access
      }))

      const shared = this.sharedNotes.map(note => ({
        ...note,
        type: 'shared',
        authorName: `${note.shared_by_firstname} ${note.shared_by_lastname}`,
        uniqueId: `s-${note.id}`,
        // permission is already in note object
      }))

      return [...personal, ...shared].sort((a, b) => {
        const dateA = new Date(a.created_at || a.shared_at)
        const dateB = new Date(b.created_at || b.shared_at)
        return dateB - dateA // Newest first
      })
    },
    filteredNotes() {
      if (!this.searchQuery) return this.allNotes
      
      const query = this.searchQuery.toLowerCase()
      return this.allNotes.filter(note => 
        (note.title && note.title.toLowerCase().includes(query)) ||
        (note.authorName && note.authorName.toLowerCase().includes(query))
      )
    }
  },
  async mounted() {
    await this.fetchAllNotes()
  },
  methods: {
    async fetchAllNotes() {
      this.loading = true
      try {
        const [personalRes, sharedRes] = await Promise.all([
          notesAPI.getAllNotes(),
          shareAPI.getSharedNotes()
        ])
        
        this.personalNotes = personalRes.data || []
        this.sharedNotes = sharedRes.data.notes || []
      } catch (error) {
        console.error('Error fetching notes:', error)
      } finally {
        this.loading = false
      }
    },
    openNote(note) {
      this.selectedNote = note
    },
    async handleCreateNote(noteData) {
      try {
        await notesAPI.createNote(noteData)
        this.showCreateForm = false
        await this.fetchAllNotes()
      } catch (error) {
        console.error('Error creating note:', error)
      }
    },
    handleNoteSave() {
      this.selectedNote = null
      this.fetchAllNotes()
    }
  }
}
</script>

<style scoped>
.all-notes-layout {
  display: flex;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  margin-left: 250px;
  background: #f5f5f5;
}

.hero-section {
  background: #f5f5f5;
}

.dashboard-content {
  padding-top: 2rem;
  padding-bottom: 3rem;
  background: white;
  margin: 0 2rem 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
  }
  
  .hero-section {
    padding: 1rem;
  }
  
  .dashboard-content {
    margin: 0 1rem 1rem;
    padding: 1rem;
  }
}
</style>
