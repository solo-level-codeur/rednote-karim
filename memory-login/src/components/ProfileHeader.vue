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
        <h5 class="mb-3">{{ fullName || 'Utilisateur' }}</h5>
        
        <!-- Description simple -->
        <div class="mb-3">
          <input 
            v-model="description" 
            @blur="saveDescription"
            placeholder="Description (max 30 caractères)"
            maxlength="30" 
            class="form-control form-control-sm text-center"
          >
        </div>
        
        <!-- Informations détaillées -->
        <div class="row text-start">
          <div class="col-12 mb-2">
            <strong>Email:</strong>
            <div class="text-muted">{{ user.email || 'Non renseigné' }}</div>
          </div>
          <div class="col-12 mb-2" v-if="user.telephone">
            <strong>Téléphone:</strong>
            <div class="text-muted">{{ user.telephone }}</div>
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
  props: {
    user: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      description: this.user.description || ''
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
    saveDescription() {
      this.$emit('update-description', this.description.trim())
    },

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