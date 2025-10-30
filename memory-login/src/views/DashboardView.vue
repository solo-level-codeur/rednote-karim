<!--
  DashboardView.vue
  
  🎯 DASHBOARD ORCHESTRATEUR
  Responsabilité: Coordonner header, stats et liste des notes
  
  Composants utilisés:
  - Sidebar (global) - Navigation latérale
  - DashboardHeader - En-tête avec salutation
  - DashboardStats - Statistiques des notes
  - NotesList - Liste/grille des notes
-->
<template>
  <div class="dashboard-layout">
    <Sidebar />
    
    <main class="main-content">
      <div class="hero-section">
        <DashboardHeader 
          :userName="userName"
          @logout="logout" />
        
        <DashboardStats 
          :totalNotes="totalNotes"
          :todayNotes="todayNotes"
          :weekNotes="weekNotes" />
      </div>
      
      <div class="dashboard-content">
        <NotesList />
      </div>
    </main>
  </div>
</template>

<script>
import Sidebar from '../components/Side.vue'
import DashboardHeader from '../components/dashboard/DashboardHeader.vue'
import DashboardStats from '../components/dashboard/DashboardStats.vue'
import NotesList from '../components/notes/NotesList.vue'
import { authStore } from '../stores/auth'

export default {
  name: 'DashboardView',
  components: {
    Sidebar,
    DashboardHeader,
    DashboardStats,
    NotesList
  },
  data() {
    return {
      totalNotes: 0,
      todayNotes: 0,
      weekNotes: 0
    }
  },
  computed: {
    userName() {
      return authStore.state.user?.username || 'Utilisateur'
    }
  },
  async mounted() {
    await this.loadStats()
  },
  methods: {
    async loadStats() {
      try {
        const { notesAPI } = await import('../services/api')
        const response = await notesAPI.getAllNotes()
        const notes = response.data
        
        this.totalNotes = notes.length
        
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        
        const weekAgo = new Date()
        weekAgo.setDate(today.getDate() - 7)
        
        this.todayNotes = notes.filter(note => {
          const noteDate = new Date(note.created_at)
          noteDate.setHours(0, 0, 0, 0)
          return noteDate.getTime() === today.getTime()
        }).length
        
        this.weekNotes = notes.filter(note => {
          const noteDate = new Date(note.created_at)
          return noteDate >= weekAgo
        }).length
        
      } catch (error) {
        // Erreur lors du chargement des stats
      }
    },
    logout() {
      if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
        authStore.logout()
        this.$router.push('/login')
      }
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
  background: #f5f5f5;
}

.hero-section {
  background: #f5f5f5;
}

.dashboard-content {
  padding: 2rem;
  background: white;
  margin: 0 2rem 2rem;
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