<template>
  <div class="min-vh-100 bg-light">
    <!-- En-tête -->
    <div class="bg-white shadow-sm border-bottom">
      <div class="container">
        <div class="row align-items-center py-3">
          <div class="col">
            <h1 class="h3 mb-0 text-primary">
              <i class="fas fa-user-plus me-2"></i>
              Administration Utilisateurs
            </h1>
          </div>
          <div class="col-auto">
            <router-link to="/dashboard" class="btn btn-outline-secondary">
              <i class="fas fa-arrow-left me-2"></i>
              Retour Dashboard
            </router-link>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Contenu principal -->
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-lg-8 col-xl-6">
          
          <!-- Card principal -->
          <div class="card shadow-sm border-0">
            <div class="card-header bg-primary text-white">
              <h4 class="card-title mb-0">
                <i class="fas fa-user-plus me-2"></i>
                Créer un Nouvel Utilisateur
              </h4>
              <small class="opacity-75">Ajoutez un nouvel utilisateur au système avec un rôle personnalisé</small>
            </div>
            
            <div class="card-body p-4">
              
              <!-- Alert admin -->
              <div class="alert alert-info d-flex align-items-center mb-4" role="alert">
                <i class="fas fa-shield-alt me-3 fs-5"></i>
                <div>
                  <strong>Accès Administrateur :</strong> 
                  Vous créez un nouveau compte utilisateur avec rôle et permissions personnalisés.
                </div>
              </div>
              
              <!-- Formulaire Bootstrap -->
              <form @submit.prevent="handleRegister">
                
                <!-- Ligne 1: Prénom + Nom -->
                <div class="row mb-3">
                  <div class="col-md-6">
                    <label for="firstname" class="form-label fw-medium">
                      <i class="fas fa-user text-primary me-2"></i>Prénom *
                    </label>
                    <input 
                      type="text" 
                      class="form-control form-control-lg"
                      id="firstname"
                      v-model="firstname" 
                      placeholder="Prénom de l'utilisateur"
                      :disabled="loading"
                      required>
                  </div>
                  <div class="col-md-6">
                    <label for="lastname" class="form-label fw-medium">
                      <i class="fas fa-user text-primary me-2"></i>Nom *
                    </label>
                    <input 
                      type="text" 
                      class="form-control form-control-lg"
                      id="lastname"
                      v-model="lastname" 
                      placeholder="Nom de famille"
                      :disabled="loading"
                      required>
                  </div>
                </div>

                <!-- Ligne 2: Email -->
                <div class="mb-3">
                  <label for="email" class="form-label fw-medium">
                    <i class="fas fa-envelope text-primary me-2"></i>Adresse Email *
                  </label>
                  <input 
                    type="email" 
                    class="form-control form-control-lg"
                    id="email"
                    v-model="email" 
                    placeholder="email@exemple.com"
                    :disabled="loading"
                    required>
                </div>

                <!-- Ligne 3: Mot de passe + Confirmation -->
                <div class="row mb-3">
                  <div class="col-md-6">
                    <label for="password" class="form-label fw-medium">
                      <i class="fas fa-lock text-primary me-2"></i>Mot de passe *
                    </label>
                    <input 
                      type="password" 
                      class="form-control form-control-lg"
                      id="password"
                      v-model="password" 
                      placeholder="Mot de passe sécurisé"
                      :disabled="loading"
                      required>
                  </div>
                  <div class="col-md-6">
                    <label for="confirmPassword" class="form-label fw-medium">
                      <i class="fas fa-shield-alt text-primary me-2"></i>Confirmation *
                    </label>
                    <input 
                      type="password" 
                      class="form-control form-control-lg"
                      id="confirmPassword"
                      v-model="confirmPassword" 
                      placeholder="Confirmer le mot de passe"
                      :disabled="loading"
                      required>
                  </div>
                </div>

                <!-- Ligne 4: Rôle -->
                <div class="mb-4">
                  <label for="role" class="form-label fw-medium">
                    <i class="fas fa-user-tag text-primary me-2"></i>Rôle et Permissions *
                  </label>
                  <select 
                    class="form-select form-select-lg" 
                    id="role"
                    v-model="selectedRole" 
                    :disabled="loading" 
                    required>
                    <option value="">Sélectionner un rôle...</option>
                    <option value="4">👁️ Viewer - Consultation uniquement</option>
                    <option value="3">👨‍💻 Developer - Création et modification</option>
                    <option value="2">👨‍💼 Manager - Gestion de projets</option>
                    <option value="1">👑 Admin - Accès complet</option>
                  </select>
                  
                  <!-- Description des rôles -->
                  <div class="mt-2 p-3 bg-light rounded">
                    <small class="text-muted">
                      <div class="row">
                        <div class="col-sm-6">
                          <strong>👁️ Viewer :</strong> Consultation des contenus partagés<br>
                          <strong>👨‍💻 Developer :</strong> Création et modification de contenu
                        </div>
                        <div class="col-sm-6">
                          <strong>👨‍💼 Manager :</strong> Gestion de projets et équipes<br>
                          <strong>👑 Admin :</strong> Accès complet au système
                        </div>
                      </div>
                    </small>
                  </div>
                </div>

                <!-- Messages d'erreur/succès -->
                <div v-if="error" class="alert alert-danger d-flex align-items-center mb-4" role="alert">
                  <i class="fas fa-exclamation-triangle me-3"></i>
                  <div>{{ error }}</div>
                </div>

                <div v-if="showSuccess" class="alert alert-success d-flex align-items-center mb-4" role="alert">
                  <i class="fas fa-check-circle me-3"></i>
                  <div>
                    <strong>Utilisateur créé avec succès !</strong><br>
                    <small>Le compte a été créé et l'utilisateur peut maintenant se connecter avec ses identifiants.</small>
                  </div>
                </div>

                <!-- Boutons d'action -->
                <div class="d-grid gap-2">
                  <button 
                    type="submit"
                    class="btn btn-primary btn-lg"
                    :disabled="loading || !isFormValid">
                    <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
                    <i v-else class="fas fa-user-plus me-2"></i>
                    <span v-if="loading">Création en cours...</span>
                    <span v-else>Créer l'Utilisateur</span>
                  </button>
                </div>
                
              </form>
              
            </div>
            
            <!-- Card footer -->
            <div class="card-footer bg-light text-center">
              <small class="text-muted">
                <i class="fas fa-info-circle me-1"></i>
                L'utilisateur recevra ses identifiants et pourra se connecter immédiatement
              </small>
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

        // Ne pas connecter automatiquement - l'admin crée pour quelqu'un d'autre
        this.error = null
        
        // Message de succès et reset du form
        this.showSuccess = true
        this.resetForm()
        
        // Redirection après 2 secondes
        setTimeout(() => {
          this.$router.push('/dashboard')
        }, 2000)
      } catch (error) {
        console.error('Erreur d\'inscription:', error)
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
/* Style simplifié */
.card {
  border-radius: 0.5rem;
}

.form-control-lg,
.form-select-lg {
  padding: 0.75rem 1rem;
}

.btn-lg {
  padding: 0.75rem 1.5rem;
}

/* Responsive */
@media (max-width: 768px) {
  .card-body {
    padding: 1.5rem;
  }
  
  .container {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  
  .row .col-md-6:first-child {
    margin-bottom: 1rem;
  }
}
</style>