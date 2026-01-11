<!--
  ProfileInfo.vue
  
  🎯 DESCRIPTION UTILISATEUR ÉDITABLE
  Responsabilité: Permettre à l'utilisateur de modifier sa description/bio uniquement
  
  Features:
  - Modification de la description personnelle
  - Sauvegarde automatique
-->
<template>
  <div class="card border-0 shadow-sm">
    <div class="card-header">
      <h6 class="mb-0">
        <i class="fas fa-edit me-2"></i>
        Modifier mon profil
      </h6>
    </div>
    
    <div class="card-body">
      <form @submit.prevent="saveProfile">
        <div class="row">
          <!-- Informations personnelles -->
          <div class="col-md-6">
            <div class="mb-3">
              <label class="form-label">Prénom</label>
              <input
                v-model="localUser.firstname"
                type="text"
                class="form-control"
                placeholder="Votre prénom"
                required
              >
            </div>
          </div>
          
          <div class="col-md-6">
            <div class="mb-3">
              <label class="form-label">Nom</label>
              <input
                v-model="localUser.lastname"
                type="text"
                class="form-control"
                placeholder="Votre nom"
                required
              >
            </div>
          </div>
          
          <div class="col-md-6">
            <div class="mb-3">
              <label class="form-label">Email</label>
              <input
                v-model="localUser.email"
                type="email"
                class="form-control"
                placeholder="votre.email@entreprise.com"
                required
              >
            </div>
          </div>
          
          <div class="col-md-6">
            <div class="mb-3">
              <label class="form-label">Téléphone</label>
              <input
                v-model="localUser.phone"
                type="tel"
                class="form-control"
                placeholder="+33 1 23 45 67 89"
              >
            </div>
          </div>
          
          <!-- Informations professionnelles -->
          <div class="col-md-6">
            <div class="mb-3">
              <label class="form-label">Poste</label>
              <input
                v-model="localUser.job_title"
                type="text"
                class="form-control"
                placeholder="Votre titre de poste"
              >
            </div>
          </div>
          
          <div class="col-md-6">
            <div class="mb-3">
              <label class="form-label">Département</label>
              <input
                v-model="localUser.department"
                type="text"
                class="form-control"
                placeholder="Votre département"
              >
            </div>
          </div>
          
          <!-- Liens sociaux -->
          <div class="col-md-6">
            <div class="mb-3">
              <label class="form-label">
                <i class="fab fa-linkedin me-1"></i>
                LinkedIn
              </label>
              <input
                v-model="localUser.linkedin_url"
                type="url"
                class="form-control"
                placeholder="https://linkedin.com/in/votre-profil"
              >
            </div>
          </div>
          
          <div class="col-md-6">
            <div class="mb-3">
              <label class="form-label">
                <i class="fab fa-github me-1"></i>
                GitHub
              </label>
              <input
                v-model="localUser.github_url"
                type="url"
                class="form-control"
                placeholder="https://github.com/votre-username"
              >
            </div>
          </div>
          
          <!-- Bio Section -->
          <div class="col-12">
            <div class="mb-3">
              <label class="form-label">Description personnelle</label>
              <textarea
                v-model="localUser.bio"
                class="form-control"
                rows="4"
                placeholder="Parlez-nous de vous, votre expérience, vos intérêts..."
                maxlength="500"
              ></textarea>
              <div class="form-text text-end">
                {{ bioLength }}/500 caractères
              </div>
            </div>
          </div>
        </div>
        
        <!-- Action Buttons -->
        <div class="d-flex justify-content-end gap-2">
          <button
            type="button"
            class="btn btn-secondary"
            @click="resetForm"
            :disabled="saving || !hasChanged"
          >
            Annuler
          </button>
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="saving || !hasChanged"
          >
            <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
            {{ saving ? 'Sauvegarde...' : 'Sauvegarder' }}
          </button>
        </div>
        
        <!-- Success/Error messages -->
        <div
          v-if="showSuccess"
          class="alert alert-success mt-3 alert-dismissible"
        >
          <i class="fas fa-check-circle me-2"></i>
          Profil mis à jour avec succès !
          <button type="button" class="btn-close" @click="showSuccess = false"></button>
        </div>
        
        <div
          v-if="showError"
          class="alert alert-danger mt-3 alert-dismissible"
        >
          <i class="fas fa-exclamation-triangle me-2"></i>
          {{ errorMessage }}
          <button type="button" class="btn-close" @click="showError = false"></button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
// Utilise Bootstrap CSS avec Vue classique

export default {
  name: 'ProfileInfo',
  // Pas de composants Bootstrap Vue nécessaires
  props: {
    user: {
      type: Object,
      required: true
    }
  },
  emits: ['user-updated'],
  data() {
    return {
      localUser: { ...this.user },
      originalUser: { ...this.user },
      saving: false,
      showSuccess: false,
      showError: false,
      errorMessage: ''
    }
  },
  computed: {
    bioLength() {
      return this.localUser.bio?.length || 0
    },
    
    hasChanged() {
      return JSON.stringify(this.localUser) !== JSON.stringify(this.originalUser)
    }
  },
  watch: {
    user: {
      handler(newUser) {
        this.localUser = { ...newUser }
        this.originalUser = { ...newUser }
      },
      deep: true
    }
  },
  methods: {
    async saveProfile() {
      if (this.bioLength > 500) {
        this.showError = true
        this.errorMessage = 'La description ne peut pas dépasser 500 caractères'
        return
      }
      
      this.saving = true
      this.showError = false
      this.showSuccess = false
      
      try {
        // Emit update to parent
        this.$emit('user-updated', this.localUser)
        
        this.originalUser = { ...this.localUser }
        this.showSuccess = true
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          this.showSuccess = false
        }, 3000)
        
      } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error)
        this.showError = true
        this.errorMessage = 'Erreur lors de la sauvegarde du profil'
      } finally {
        this.saving = false
      }
    },
    
    resetForm() {
      this.localUser = { ...this.originalUser }
      this.showError = false
      this.showSuccess = false
    }
  }
}
</script>

<style scoped>
/* Styles spécifiques au composant */
</style>