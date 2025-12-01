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
  <div class="d-flex min-vh-100">
    <Sidebar />
    
    <main class="flex-grow-1 ms-auto bg-light" style="margin-left: 250px;">
      <div class="container-fluid py-4">
        
        <!-- État de chargement -->
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary mb-3"></div>
          <p class="text-muted">Chargement du profil...</p>
        </div>
        
        <!-- État d'erreur -->
        <div v-else-if="error" class="alert alert-danger text-center">
          <i class="fas fa-exclamation-triangle me-2"></i>
          {{ error }}
          <button 
            @click="loadUserProfile" 
            class="btn btn-outline-danger btn-sm ms-3"
          >
            Réessayer
          </button>
        </div>
        
        <!-- Contenu principal -->
        <div v-else-if="user" class="row justify-content-center">
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
import Sidebar from '../components/Sidebar.vue'
import ProfileHeader from '../components/profile/ProfileHeader.vue'
import ProfileInfo from '../components/profile/ProfileInfo.vue'
import { authStore } from '../stores/auth'
import { profileAPI } from '../services/api'
// Utilise Bootstrap CSS avec Vue classique

export default {
  name: 'ProfileView',
  components: {
    Sidebar,
    ProfileHeader,
    ProfileInfo
  },
  data() {
    return {
      user: null,
      loading: true,
      error: null
    }
  },
  async mounted() {
    await this.loadUserProfile()
  },
  methods: {
    async loadUserProfile() {
      this.loading = true
      try {
        const response = await profileAPI.getUserProfileWithStats()
        this.user = response.data
        this.error = null
      } catch (error) {
        console.error('Erreur lors du chargement du profil:', error)
        this.error = 'Erreur lors du chargement du profil utilisateur'
      } finally {
        this.loading = false
      }
    },
    
    async handleUserUpdate(userData) {
      try {
        const response = await profileAPI.updateUserProfile(userData)
        if (response.data.success) {
          this.user = response.data.user
          alert('Profil mis à jour avec succès!')
        }
      } catch (error) {
        console.error('Erreur lors de la mise à jour du profil:', error)
        alert('Erreur lors de la mise à jour du profil')
      }
    }
  }
}
</script>

<style scoped>
/* Layout responsive géré par Bootstrap */
@media (max-width: 1024px) {
  .main-content {
    margin-left: 0 !important;
  }
}
</style>