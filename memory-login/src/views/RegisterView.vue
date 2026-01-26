<template>
  <div class="min-vh-100 bg-light">
    <!-- En-tête simple -->
    <div class="bg-white shadow-sm border-bottom">
      <div class="container">
        <div class="row align-items-center py-3">
          <div class="col">
            <h1 class="h4 mb-0 text-primary">Administration Utilisateurs</h1>
          </div>
          <div class="col-auto">
            <router-link to="/home" class="btn btn-outline-secondary">
              Retour Home
            </router-link>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Contenu principal -->
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-lg-6">
          <div class="card shadow-sm">
            <div class="card-header bg-primary text-white">
              <h4 class="card-title mb-0">Créer un Nouvel Utilisateur</h4>
            </div>
            
            <div class="card-body p-4">
              <form @submit.prevent="handleRegister">
                
                <!-- Prénom + Nom -->
                <div class="row mb-3">
                  <div class="col-md-6">
                    <label for="firstname" class="form-label">Prénom</label>
                    <input 
                      type="text" 
                      class="form-control"
                      id="firstname"
                      v-model="firstname" 
                      placeholder="Prénom"
                      :disabled="loading"
                      required>
                  </div>
                  <div class="col-md-6">
                    <label for="lastname" class="form-label">Nom</label>
                    <input 
                      type="text" 
                      class="form-control"
                      id="lastname"
                      v-model="lastname" 
                      placeholder="Nom de famille"
                      :disabled="loading"
                      required>
                  </div>
                </div>

                <!-- Email -->
                <div class="mb-3">
                  <label for="email" class="form-label">Adresse Email</label>
                  <input 
                    type="email" 
                    class="form-control"
                    id="email"
                    v-model="email" 
                    placeholder="email@exemple.com"
                    :disabled="loading"
                    required>
                </div>

                <!-- Mot de passe + Confirmation -->
                <div class="row mb-3">
                  <div class="col-md-6">
                    <label for="password" class="form-label">Mot de passe</label>
                    <input 
                      type="password" 
                      class="form-control"
                      id="password"
                      v-model="password" 
                      placeholder="Mot de passe"
                      :disabled="loading"
                      required>
                  </div>
                  <div class="col-md-6">
                    <label for="confirmPassword" class="form-label">Confirmation</label>
                    <input 
                      type="password" 
                      class="form-control"
                      id="confirmPassword"
                      v-model="confirmPassword" 
                      placeholder="Confirmer le mot de passe"
                      :disabled="loading"
                      required>
                  </div>
                </div>

                <!-- Rôle -->
                <div class="mb-4">
                  <label for="role" class="form-label">Rôle</label>
                  <select 
                    class="form-select" 
                    id="role"
                    v-model="selectedRole" 
                    :disabled="loading" 
                    required>
                    <option value="">Sélectionner un rôle...</option>
                    <option value="4">Viewer - Consultation uniquement</option>
                    <option value="3">Developer - Création et modification</option>
                    <option value="2">Manager - Gestion de projets</option>
                    <option value="1">Admin - Accès complet</option>
                  </select>
                </div>

                <!-- Messages -->
                <div v-if="error" class="alert alert-danger" role="alert">
                  {{ error }}
                </div>

                <div v-if="showSuccess" class="alert alert-success" role="alert">
                  <strong>Utilisateur créé avec succès !</strong>
                </div>

                <!-- Bouton -->
                <div class="d-grid">
                  <button 
                    type="submit"
                    class="btn btn-primary"
                    :disabled="loading || !isFormValid">
                    <span v-if="loading">Création en cours...</span>
                    <span v-else>Créer l'Utilisateur</span>
                  </button>
                </div>
                
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { authAPI } from '../services/api'

export default {
  name: 'RegisterView',
  data() {
    return {
      firstname: '',
      lastname: '',
      email: '',
      password: '',
      confirmPassword: '',
      selectedRole: '',
      loading: false,
      error: null,
      showSuccess: false
    }
  },
  computed: {
    isFormValid() {
      return this.firstname && 
             this.lastname &&
             this.email && 
             this.password && 
             this.confirmPassword && 
             this.selectedRole &&
             this.password === this.confirmPassword
    }
  },
  methods: {
    async handleRegister() {
      if (!this.isFormValid) {
        this.error = 'Veuillez remplir tous les champs correctement'
        return
      }

      if (this.password !== this.confirmPassword) {
        this.error = 'Les mots de passe ne correspondent pas'
        return
      }

      this.loading = true
      this.error = null

      try {
        await authAPI.register({
          firstname: this.firstname,
          lastname: this.lastname,
          email: this.email,
          password: this.password,
          roleId: parseInt(this.selectedRole)
        })
        
        this.showSuccess = true
        this.resetForm()
        
        setTimeout(() => {
          this.$router.push('/home')
        }, 2000)
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors de l\'inscription'
      } finally {
        this.loading = false
      }
    },
    
    resetForm() {
      this.firstname = ''
      this.lastname = ''
      this.email = ''
      this.password = ''
      this.confirmPassword = ''
      this.selectedRole = ''
    }
  }
}
</script>

<style scoped>
.card {
  border-radius: 0.5rem;
}
</style>