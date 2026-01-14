<template>
  <!-- Sidebar Bootstrap native -->
  <div class="d-flex flex-column position-fixed top-0 start-0 bg-dark text-white h-100" style="width: 250px; z-index: 1000;">
    
    <!-- Header -->
    <div class="p-4 border-bottom border-secondary">
      <h5 class="mb-0 text-info">
        <i class="fas fa-memory me-2"></i>
        Memory
      </h5>
    </div>
    
    <!-- Navigation -->
    <nav class="flex-grow-1 p-3">
      <ul class="nav nav-pills flex-column">
        <li class="nav-item mb-1">
          <router-link to="/home" class="nav-link text-white" active-class="active">
            <i class="fas fa-home me-2"></i>
            Accueil
          </router-link>
        </li>
        
        <li class="nav-item mb-1">
          <router-link to="/dashboard" class="nav-link text-white" active-class="active">
            <i class="fas fa-tachometer-alt me-2"></i>
            Dashboard
          </router-link>
        </li>
        
        <li class="nav-item mb-1">
          <router-link to="/notes" class="nav-link text-white" active-class="active">
            <i class="fas fa-sticky-note me-2"></i>
            Notes
          </router-link>
        </li>
        
        <li class="nav-item mb-1">
          <router-link to="/all-notes" class="nav-link text-white" active-class="active">
            <i class="fas fa-list me-2"></i>
            All Notes
          </router-link>
        </li>
        
        <li class="nav-item mb-1">
          <router-link to="/projects" class="nav-link text-white" active-class="active">
            <i class="fas fa-folder me-2"></i>
            Projets
          </router-link>
        </li>
        
        <li class="nav-item mb-1">
          <router-link to="/profile" class="nav-link text-white" active-class="active">
            <i class="fas fa-user me-2"></i>
            Profil
          </router-link>
        </li>
        
        <li class="nav-item mb-1">
          <router-link to="/tags" class="nav-link text-white" active-class="active">
            <i class="fas fa-tags me-2"></i>
            Tags
          </router-link>
        </li>
        
        <li class="nav-item mb-1">
          <router-link to="/shared-notes" class="nav-link text-white" active-class="active">
            <i class="fas fa-share-alt me-2"></i>
            Notes Partagées
          </router-link>
        </li>
        
        <!-- Section Admin -->
        <li v-if="isAdmin" class="nav-item mb-1 mt-3">
          <h6 class="text-muted px-3 mb-2">Administration</h6>
          <router-link to="/admin/users" class="nav-link text-white" active-class="active">
            <i class="fas fa-users me-2"></i>
            Utilisateurs
          </router-link>
          <router-link to="/register" class="nav-link text-white" active-class="active">
            <i class="fas fa-user-plus me-2"></i>
            Ajouter utilisateur
          </router-link>
        </li>
      </ul>
    </nav>
    
    <!-- Footer utilisateur -->
    <div class="mt-auto p-3 border-top border-secondary">
      <div v-if="currentUser" class="d-flex align-items-center bg-light bg-opacity-10 rounded p-2 mb-2">
        <div class="bg-info text-white rounded-circle d-flex align-items-center justify-content-center me-2" 
             style="width: 35px; height: 35px; font-size: 14px;">
          {{ userInitials }}
        </div>
        <div class="small">
          <div class="fw-medium">{{ currentUser.firstname }} {{ currentUser.lastname }}</div>
          <div class="text-muted">{{ currentUser.role || 'Utilisateur' }}</div>
        </div>
      </div>
      
      <button @click="logout" class="btn btn-outline-light btn-sm w-100">
        <i class="fas fa-sign-out-alt me-1"></i>
        Déconnexion
      </button>
    </div>
  </div>
</template>

<script>
import { authStore } from '../stores/auth'

export default {
  name: 'SimpleSidebar',
  
  computed: {
    currentUser() {
      return authStore.state.user
    },
    
    isAdmin() {
      return authStore.isAdmin() // Utilise la méthode centralisée
    },
    
    userInitials() {
      if (!this.currentUser) return ''
      const first = this.currentUser.firstname?.charAt(0) || ''
      const last = this.currentUser.lastname?.charAt(0) || ''
      return (first + last).toUpperCase()
    }
  },
  
  methods: {
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
/* Styles minimal - on utilise Bootstrap au maximum */
.nav-link {
  border-radius: 6px;
  transition: background-color 0.15s ease-in-out;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.1) !important;
  color: white !important;
}

.nav-link.active {
  background-color: var(--bs-primary) !important;
  color: white !important;
}
</style>