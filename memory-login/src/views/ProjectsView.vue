<template>
  <div class="d-flex min-vh-100">
    <Sidebar />
    
    <main class="flex-grow-1" style="margin-left: var(--sidebar-width); background: var(--bg-light);">
      <div class="container-fluid p-4">
        <div class="bg-white p-4 rounded shadow-sm">
          <h1 class="theme-text-primary mb-4">Mes Projets</h1>
          
          <div class="row g-4">
            <div 
              v-for="project in projects" 
              :key="project.id" 
              class="col-md-4"
            >
              <ProjectCard 
                :project="project" 
                @click="openProject" 
              />
            </div>
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
import { authStore } from '@/stores/auth'

export default {
  name: 'ProjectsView',
  components: {
    ProjectCard,
    Sidebar
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
@media (max-width: 768px) {
  main {
    margin-left: 0 !important;
  }
}
</style>