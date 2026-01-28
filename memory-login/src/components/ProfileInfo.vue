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
          
          <!-- Description Section -->
          <div class="col-12">
            <div class="mb-3">
              <label class="form-label">Description personnelle</label>
              <textarea
                v-model="localUser.description"
                class="form-control"
                rows="4"
                placeholder="Parlez-nous de vous, votre expérience, vos intérêts..."
                maxlength="500"
              ></textarea>
              <div class="form-text text-end">
                {{ descriptionLength }}/500 caractères
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
    descriptionLength() {
      return this.localUser.description?.length || 0
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
      if (this.descriptionLength > 500) {
        this.showError = true
        this.errorMessage = 'La description ne peut pas dépasser 500 caractères'
        return
      }
      
      this.saving = true
      this.showError = false
      this.showSuccess = false
      
      try {
        // Import API
        const { authAPI } = await import('@/services/api')
        
        // Call API to update profile
        await authAPI.updateProfile({
          description: this.localUser.description
        })
        
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
      this.localUser.description = this.originalUser.description
      this.showError = false
      this.showSuccess = false
    }
  }
}
</script>

<style scoped>
/* Styles spécifiques au composant */
</style>