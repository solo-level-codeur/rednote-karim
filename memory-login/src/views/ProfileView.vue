<!--
  ProfileView.vue
  
  🎯 PROFIL UTILISATEUR ORCHESTRATEUR
  Responsabilité: Coordonner les composants de profil
  
  Composants utilisés:
  - Sidebar (global) - Navigation latérale
  - ProfileHeader - Avatar + informations principales
  - ProfileInfo - Formulaire d'informations détaillées
  - ProfileProjects - Tableau des projets ouverts
-->
<template>
  <div class="profile-layout">
    <Sidebar />
    
    <main class="main-content">
      <div class="container-fluid py-4">
        
        <div class="row justify-content-center">
          <!-- Profil utilisateur -->
          <div class="col-md-8 mb-4">
            <ProfileHeader :user="user" />
            
            <!-- Description éditable -->
            <div class="mt-4">
              <ProfileInfo 
                :user="user"
                @user-updated="handleUserUpdate" />
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import Sidebar from '../components/Side.vue'
import ProfileHeader from '../components/profile/ProfileHeader.vue'
import ProfileInfo from '../components/profile/ProfileInfo.vue'
import { authStore } from '../stores/auth'

export default {
  name: 'ProfileView',
  components: {
    Sidebar,
    ProfileHeader,
    ProfileInfo
  },
  data() {
    return {
      user: {
        id: 1,
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean.dupont@entreprise.com',
        jobTitle: 'Développeur Full Stack',
        department: 'Équipe Tech',
        role: 'Developer',
        bio: 'Passionné par le développement web moderne, j\'aime créer des applications performantes et user-friendly. Spécialisé en Vue.js et Node.js avec plus de 5 ans d\'expérience.',
        skills: ['Vue.js', 'Node.js', 'JavaScript', 'TypeScript', 'MongoDB', 'Git'],
        avatar: null,
        avatarColor: '#3273dc'
      }
    }
  },
  async mounted() {
    await this.loadUserProfile()
  },
  methods: {
    async loadUserProfile() {
      try {
        const storedUser = authStore.state.user
        if (storedUser) {
          this.user = {
            ...this.user,
            ...storedUser
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement du profil:', error)
      }
    },
    
    
    
    handleUserUpdate(userData) {
      this.user = { ...this.user, ...userData }
      // Ici on pourrait sauvegarder via API
    }
  }
}
</script>

<style scoped>
.profile-layout {
  display: flex;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  margin-left: 250px;
  background: #f5f5f5;
}

@media (max-width: 1024px) {
  .main-content {
    margin-left: 0;
  }
}
</style>