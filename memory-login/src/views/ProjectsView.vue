<template>
  <div class="projects-layout">
    <Sidebar />
    
    <main class="main-content">
      <div class="hero-section">
        <DashboardHeader 
          :userName="userName"
          @logout="logout" />
      </div>
      
      <div class="projects-content">
        <h1 class="title">Mes Projets</h1>
        
        <div class="columns is-multiline">
          <div 
            v-for="project in projects" 
            :key="project.id" 
            class="column is-one-third"
          >
            <ProjectCard 
              :project="project" 
              @click="openProject" 
            />
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import ProjectCard from '@/components/projects/ProjectCard.vue'
import Sidebar from '@/components/Side.vue'
import DashboardHeader from '@/components/dashboard/DashboardHeader.vue'
import { authStore } from '@/stores/auth'

export default {
  name: 'ProjectsView',
  components: {
    ProjectCard,
    Sidebar,
    DashboardHeader
  },
  setup() {
    const router = useRouter()
    const projects = ref([])
    
    // Données de test
    const mockProjects = [
      {
        id: 1,
        name: 'Mon Premier Projet',
        description: 'Description du projet 1',
        owner: 'Karim'
      },
      {
        id: 2,
        name: 'Projet Vue.js',
        description: 'Application avec Vue.js',
        owner: 'Karim'
      }
    ]
    
    const openProject = (project) => {
      console.log('Ouverture du projet:', project.name)
      // router.push(`/project/${project.id}`)
    }
    
    onMounted(() => {
      projects.value = mockProjects
    })
    
    const userName = computed(() => {
      return authStore.state.user?.username || 'Utilisateur'
    })
    
    const logout = () => {
      if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
        authStore.logout()
        router.push('/login')
      }
    }
    
    return {
      projects,
      openProject,
      userName,
      logout
    }
  }
}
</script>

<style scoped>
.projects-layout {
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

.projects-content {
  padding: 2rem;
  background: white;
  margin: 0 2rem 2rem;
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
  }
  
  .projects-content {
    margin: 0 1rem 1rem;
    padding: 1rem;
  }
}
</style>