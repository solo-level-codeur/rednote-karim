<template>
  <div class="custom-sidebar">
    <!-- Header avec logo -->
    <div class="p-4 border-bottom border-light border-opacity-25">
      <div class="d-flex align-items-center text-info fw-bold h5 mb-0">
        <i class="fas fa-memory-card me-2"></i>
        <span>Memory</span>
      </div>
    </div>
    
    <!-- Navigation -->
    <nav class="flex-grow-1 p-3">
      <ul class="nav flex-column">
        <li class="nav-item-custom mb-1">
          <router-link
            to="/dashboard"
            class="nav-link-custom d-flex align-items-center py-3 px-3 rounded-end-pill text-white text-decoration-none"
          >
            <i class="fas fa-tachometer-alt me-3" style="width: 20px;"></i>
            <span class="fw-medium">Dashboard</span>
          </router-link>
        </li>
        
        <li class="nav-item-custom mb-1">
          <router-link
            to="/notes"
            class="nav-link-custom d-flex align-items-center py-3 px-3 rounded-end-pill text-white text-decoration-none"
          >
            <i class="fas fa-sticky-note me-3" style="width: 20px;"></i>
            <span class="fw-medium">Notes</span>
          </router-link>
        </li>
        
        <li class="nav-item-custom mb-1">
          <router-link
            to="/projects"
            class="nav-link-custom d-flex align-items-center py-3 px-3 rounded-end-pill text-white text-decoration-none"
          >
            <i class="fas fa-folder me-3" style="width: 20px;"></i>
            <span class="fw-medium">Projets</span>
          </router-link>
        </li>
        
        <li class="nav-item-custom mb-1">
          <router-link
            to="/profile"
            class="nav-link-custom d-flex align-items-center py-3 px-3 rounded-end-pill text-white text-decoration-none"
          >
            <i class="fas fa-user me-3" style="width: 20px;"></i>
            <span class="fw-medium">Profil</span>
          </router-link>
        </li>
        
        <!-- Section Organisation -->
        <li class="mt-4">
          <div class="text-light text-opacity-75 text-uppercase small fw-semibold px-3 py-2 border-bottom border-light border-opacity-25 mb-2">
            <i class="fas fa-layer-group me-2"></i>
            Organisation
          </div>
        </li>
        
        <li class="nav-item-custom mb-1">
          <router-link
            to="/tags"
            class="nav-link-custom d-flex align-items-center py-3 px-3 rounded-end-pill text-white text-decoration-none"
          >
            <i class="fas fa-tags me-3" style="width: 20px;"></i>
            <span class="fw-medium">Tags</span>
          </router-link>
        </li>
        
        <li class="nav-item-custom mb-1">
          <router-link
            to="/shared-notes"
            class="nav-link-custom d-flex align-items-center py-3 px-3 rounded-end-pill text-white text-decoration-none"
          >
            <i class="fas fa-share-alt me-3" style="width: 20px;"></i>
            <span class="fw-medium">Notes partagées</span>
          </router-link>
        </li>
        
        <!-- Section Administration -->
        <li v-if="isAdmin" class="mt-4">
          <div class="text-light text-opacity-75 text-uppercase small fw-semibold px-3 py-2 border-bottom border-light border-opacity-25 mb-2">
            <i class="fas fa-cogs me-2"></i>
            Administration
          </div>
        </li>
        
        <li v-if="isAdmin" class="nav-item-custom mb-1">
          <router-link
            to="/admin/users"
            class="nav-link-custom d-flex align-items-center py-3 px-3 rounded-end-pill text-white text-decoration-none"
          >
            <i class="fas fa-users me-3" style="width: 20px;"></i>
            <span class="fw-medium">Utilisateurs</span>
          </router-link>
        </li>
      </ul>
    </nav>
    
    <!-- Footer utilisateur -->
    <div class="mt-auto p-3 border-top border-light border-opacity-25">
      <div v-if="currentUser" class="d-flex align-items-center bg-white bg-opacity-10 rounded p-3">
        <div
          class="user-avatar bg-info text-white fw-bold me-3"
        >
          {{ getInitials(currentUser.firstname, currentUser.lastname) }}
        </div>
        
        <div class="flex-grow-1 me-2">
          <div class="text-white fw-semibold small">{{ currentUser.firstname }} {{ currentUser.lastname }}</div>
          <div class="text-light text-opacity-75 small">{{ currentUser.role }}</div>
        </div>
        
        <button
          class="btn btn-outline-danger btn-sm btn-logout-custom border-0 p-2"
          @click="logout"
          title="Se déconnecter"
        >
          <i class="fas fa-sign-out-alt"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { authStore } from '@/stores/auth'

export default {
  name: 'Sidebar',
  computed: {
    currentUser() {
      return authStore.state.user
    },
    isAdmin() {
      console.log('🔍 Debug Sidebar - Current user:', this.currentUser)
      console.log('🔍 Debug Sidebar - User role:', this.currentUser?.role)
      console.log('🔍 Debug Sidebar - Is Admin:', this.currentUser?.role === 'Admin')
      return this.currentUser?.role === 'Admin'
    }
  },
  methods: {
    getInitials(firstname, lastname) {
      return `${firstname?.charAt(0) || ''}${lastname?.charAt(0) || ''}`.toUpperCase()
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
/* Sidebar avec gradient primaire personnalisé */
.custom-sidebar {
  background: linear-gradient(180deg, #2c3e50 0%, #34495e 100%) !important;
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  height: 100vh !important;
  width: 250px !important;
  z-index: 1000 !important;
  display: flex !important;
  flex-direction: column !important;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
}

/* Navigation personnalisée */
.nav-item-custom {
  margin-right: 1rem;
}

.nav-link-custom {
  transition: all 0.3s ease !important;
  color: #ecf0f1 !important;
}

.nav-link-custom:hover {
  background: rgba(52, 152, 219, 0.2) !important;
  color: #3498db !important;
  transform: translateX(5px);
}

.nav-link-custom.router-link-active {
  background: #3498db !important;
  color: white !important;
  box-shadow: 0 2px 10px rgba(52, 152, 219, 0.3);
}

/* Avatar utilisateur */
.user-avatar {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
}

/* Bouton déconnexion personnalisé */
.btn-logout-custom {
  color: #e74c3c !important;
  transition: all 0.3s ease;
}

.btn-logout-custom:hover {
  background: rgba(231, 76, 60, 0.2) !important;
  transform: scale(1.1);
  border-color: transparent !important;
}

/* Responsive */
@media (max-width: 768px) {
  .custom-sidebar {
    transform: translateX(-100%) !important;
    transition: transform 0.3s ease !important;
  }
  
  .custom-sidebar.mobile-open {
    transform: translateX(0) !important;
  }
}
</style>