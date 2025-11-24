<!--
  ProfileHeader.vue
  
  🎯 AVATAR ET INFORMATIONS PRINCIPALES
  Responsabilité: Afficher l'avatar et les informations de base
  
  Features:
  - Avatar circulaire coloré avec initiales
  - Affichage des informations personnelles (lecture seule)
-->
<template>
  <div class="card">
    
    <div class="card-body text-center">
      <!-- Avatar Section -->
      <div class="mb-4">
        <div 
          class="avatar mx-auto"
          :style="{ backgroundColor: user.avatarColor || '#48c78e' }"
        >
          {{ initials }}
        </div>
      </div>
      
      <!-- User Info Display -->
      <div class="text-center">
        <h5 class="mb-1">{{ fullName || 'Utilisateur' }}</h5>
        <p class="text-muted mb-2">{{ user.jobTitle || 'Poste non défini' }}</p>
        <p class="text-muted small">{{ user.department || 'Département non défini' }}</p>
        
        <hr class="my-3">
        
        <div class="row text-start">
          <div class="col-12 mb-2">
            <strong>Email:</strong>
            <div class="text-muted">{{ user.email || 'Non renseigné' }}</div>
          </div>
          <div class="col-12 mb-2">
            <strong>Rôle:</strong>
            <div class="text-muted">{{ user.role || 'Non défini' }}</div>
          </div>
          <div class="col-12" v-if="user.skills && user.skills.length > 0">
            <strong>Compétences:</strong>
            <div class="mt-1">
              <span 
                v-for="skill in user.skills" 
                :key="skill"
                class="badge bg-light text-dark me-1 mb-1"
              >
                {{ skill }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProfileHeader',
  props: {
    user: {
      type: Object,
      required: true
    }
  },
  computed: {
    initials() {
      const first = this.user.firstName?.charAt(0)?.toUpperCase() || ''
      const last = this.user.lastName?.charAt(0)?.toUpperCase() || ''
      return first + last || 'U'
    },
    
    fullName() {
      const first = this.user.firstName?.trim() || ''
      const last = this.user.lastName?.trim() || ''
      return first && last ? `${first} ${last}` : ''
    }
  }
}
</script>

<style scoped>
.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: 600;
  color: white;
}
</style>