<!--
  NotesView.vue
  
  🎯 NOTES VIEW SIMPLIFIÉE
  Responsabilité: Afficher et gérer les notes par projet
  
  Composants utilisés:
  - Sidebar (global) - Navigation latérale
  - NotesList - Liste des notes
-->
<template>
  <div class="notes-layout">
    <Sidebar />
    
    <main class="main-content">
      <!-- Breadcrumb si on est dans un projet -->
      <div v-if="project" class="breadcrumb-container bg-light px-3 py-2">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb mb-0">
            <li class="breadcrumb-item">
              <router-link to="/projects" class="text-decoration-none">
                <i class="fas fa-folder me-1"></i>Projets
              </router-link>
            </li>
            <li class="breadcrumb-item active">{{ project.project_name }}</li>
          </ol>
        </nav>
      </div>
      
      
      <div class="dashboard-content">
        <NotesList :projectId="$route.params.projectId" />
      </div>
    </main>
  </div>
</template>

<script>
// Sidebar est maintenant un composant global (voir main.js)
import NotesList from '../components/NotesList.vue'
import { projectsAPI } from '../services/api'

export default {
  name: 'NotesView',
  components: {
    NotesList
  },
  props: {
    projectId: {
      type: String,
      default: null
    },
    key: {
      type: String,
      default: 'default'
    }
  },
  data() {
    return {
      project: null
    }
  },
  async mounted() {
    if (this.$route.params.projectId) {
      try {
        const response = await projectsAPI.getProjectById(this.$route.params.projectId)
        this.project = response.data
      } catch (error) {
        console.error('Erreur lors du chargement du projet:', error)
      }
    }
  }
}
</script>

<style scoped>
.notes-layout {
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
}

/* Breadcrumb styles */
.breadcrumb-container {
  border-bottom: 1px solid #dee2e6;
}

.breadcrumb-item + .breadcrumb-item::before {
  content: "›";
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