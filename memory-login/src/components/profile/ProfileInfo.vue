<!--
  ProfileInfo.vue
  
  🎯 DESCRIPTION UTILISATEUR ÉDITABLE
  Responsabilité: Permettre à l'utilisateur de modifier sa description/bio uniquement
  
  Features:
  - Modification de la description personnelle
  - Sauvegarde automatique
-->
<template>
  <div>
      <form @submit.prevent="saveProfile">
        <!-- Bio Section -->
        <div class="mb-3">
          <label class="form-label">Description personnelle</label>
          <textarea 
            v-model="localUser.bio"
            class="form-control"
            rows="6"
            placeholder="Parlez-nous de vous, votre expérience, vos intérêts..."
            maxlength="500"
          ></textarea>
          <div class="form-text text-end">
            {{ bioLength }}/500 caractères
          </div>
        </div>
        
        <!-- Save Button -->
        <div class="d-flex justify-content-end">
          <button 
            type="submit"
            class="btn btn-primary"
            :disabled="saving || !hasChanged"
          >
            <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
            {{ saving ? 'Sauvegarde...' : 'Sauvegarder' }}
          </button>
        </div>
        
        <!-- Success message -->
        <div v-if="showSuccess" class="alert alert-success mt-3">
          <i class="fas fa-check-circle me-2"></i>
          Description mise à jour avec succès !
        </div>
      </form>
  </div>
</template>

<script>
export default {
  name: 'ProfileInfo',
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
      saving: false,
      showSuccess: false,
      originalBio: this.user.bio || ''
    }
  },
  computed: {
    bioLength() {
      return this.localUser.bio?.length || 0
    },
    
    hasChanged() {
      return this.localUser.bio !== this.originalBio
    }
  },
  watch: {
    user: {
      handler(newUser) {
        this.localUser = { ...newUser }
        this.originalBio = newUser.bio || ''
      },
      deep: true
    }
  },
  methods: {
    async saveProfile() {
      if (this.bioLength > 500) {
        alert('La description ne peut pas dépasser 500 caractères')
        return
      }
      
      this.saving = true
      try {
        // Emit update
        this.$emit('user-updated', this.localUser)
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        this.originalBio = this.localUser.bio
        this.showSuccess = true
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          this.showSuccess = false
        }, 3000)
        
      } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error)
        alert('Erreur lors de la sauvegarde')
      } finally {
        this.saving = false
      }
    }
  }
}
</script>

<style scoped>
/* Styles gérés par le thème global */
</style>