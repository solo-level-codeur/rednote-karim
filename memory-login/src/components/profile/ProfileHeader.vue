<!--
  ProfileHeader.vue
  
  🎯 AVATAR ET INFORMATIONS PRINCIPALES
  Responsabilité: Afficher l'avatar et les informations de base
  
  Features:
  - Avatar circulaire coloré avec initiales
  - Affichage des informations personnelles (lecture seule)
-->
<template>
  <div class="card border-0 shadow-sm">
    <div class="card-body text-center">
      <!-- Avatar Section -->
      <div class="mb-4">
        <div
          class="user-avatar mx-auto text-white fw-semibold d-flex align-items-center justify-content-center"
          :style="{ backgroundColor: user.avatarColor || '#48c78e' }"
        >
          {{ initials }}
        </div>
      </div>
      
      <!-- User Info Display -->
      <div class="text-center">
        <h5 class="mb-1">{{ fullName || 'Utilisateur' }}</h5>
        <p class="text-muted mb-2">{{ user.job_title || 'Poste non défini' }}</p>
        <p class="text-muted small">{{ user.department || 'Département non défini' }}</p>
        
        <hr class="my-3">
        
        <!-- Statistics avec Bootstrap Grid -->
        <div v-if="user.stats" class="row mb-3 text-center">
          <div class="col-3">
            <div class="p-2">
              <div class="h4 fw-bold text-primary mb-1">{{ user.stats.total_notes }}</div>
              <small class="text-muted text-uppercase fw-semibold" style="font-size: 0.75rem; letter-spacing: 0.5px;">Notes</small>
            </div>
          </div>
          <div class="col-3">
            <div class="p-2">
              <div class="h4 fw-bold text-primary mb-1">{{ user.stats.total_projects }}</div>
              <small class="text-muted text-uppercase fw-semibold" style="font-size: 0.75rem; letter-spacing: 0.5px;">Projets</small>
            </div>
          </div>
          <div class="col-3">
            <div class="p-2">
              <div class="h4 fw-bold text-primary mb-1">{{ user.stats.total_comments }}</div>
              <small class="text-muted text-uppercase fw-semibold" style="font-size: 0.75rem; letter-spacing: 0.5px;">Commentaires</small>
            </div>
          </div>
          <div class="col-3">
            <div class="p-2">
              <div class="h4 fw-bold text-primary mb-1">{{ user.stats.shared_notes }}</div>
              <small class="text-muted text-uppercase fw-semibold" style="font-size: 0.75rem; letter-spacing: 0.5px;">Partagées</small>
            </div>
          </div>
        </div>
        
        <hr class="my-3">
        
        <!-- Informations détaillées -->
        <div class="row text-start">
          <div class="col-12 mb-2">
            <strong>Email:</strong>
            <div class="text-muted">{{ user.email || 'Non renseigné' }}</div>
          </div>
          <div class="col-12 mb-2">
            <strong>Rôle:</strong>
            <div class="text-muted">{{ user.role || 'Non défini' }}</div>
          </div>
          <div class="col-12 mb-2" v-if="user.phone">
            <strong>Téléphone:</strong>
            <div class="text-muted">{{ user.phone }}</div>
          </div>
          <div class="col-12" v-if="user.created_at">
            <strong>Membre depuis:</strong>
            <div class="text-muted">{{ formatDate(user.created_at) }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// Utilise Bootstrap CSS avec Vue classique

export default {
  name: 'ProfileHeader',
  // Pas de composants Bootstrap Vue nécessaires
  props: {
    user: {
      type: Object,
      required: true
    }
  },
  computed: {
    initials() {
      const first = this.user.firstname?.charAt(0)?.toUpperCase() || ''
      const last = this.user.lastname?.charAt(0)?.toUpperCase() || ''
      return first + last || 'U'
    },
    
    fullName() {
      const first = this.user.firstname?.trim() || ''
      const last = this.user.lastname?.trim() || ''
      return first && last ? `${first} ${last}` : ''
    }
  },
  methods: {
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }
  }
}
</script>

<style scoped>
.user-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  font-size: 2.5rem;
  font-weight: 600;
}
</style>