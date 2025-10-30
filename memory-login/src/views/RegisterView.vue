<template>
  <div class="container">
    <AppHeader />
    
    <div class="center-wrapper">
      <!-- Titre -->
      <h1 class="title is-2 mb-6">Create Account</h1>
      
      <!-- Formulaire complet -->
      <div class="form-width">
        <div class="field">
          <input 
            class="input" 
            v-model="username" 
            type="text" 
            placeholder="Username"
            :disabled="loading">
        </div>

        <div class="field">
          <input 
            class="input" 
            v-model="email" 
            type="email" 
            placeholder="Email"
            :disabled="loading">
        </div>

        <div class="field">
          <input 
            class="input" 
            v-model="password" 
            type="password" 
            placeholder="Password"
            :disabled="loading">
        </div>

        <div class="field">
          <input 
            class="input" 
            v-model="confirmPassword" 
            type="password" 
            placeholder="Confirm Password"
            :disabled="loading">
        </div>

        <div v-if="error" class="notification is-danger is-light mb-4">
          {{ error }}
        </div>

        <div class="has-text-centered">
          <button 
            class="button is-danger is-medium custom-button"
            @click="handleRegister"
            :disabled="loading || !isFormValid"
            :class="{ 'is-loading': loading }">
            Sign Up
          </button>
        </div>

        <p class="has-text-centered mt-5">
          Already have an account? <router-link to="/login">Log In</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import AppHeader from '../components/AppHeader.vue'

import { authAPI } from '../services/api'
import { authStore } from '../stores/auth'

export default {
  name: 'RegisterView',
  components: {
    AppHeader
  },
  data() {
    return {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      loading: false,
      error: null
    }
  },
  computed: {
    isFormValid() {
      return this.username && 
             this.email && 
             this.password && 
             this.confirmPassword && 
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
        const response = await authAPI.register({
          username: this.username,
          email: this.email,
          password: this.password
        })

        authStore.login(response.data)
        
        this.$router.push('/dashboard')
      } catch (error) {
        console.error('Erreur d\'inscription:', error)
        this.error = error.response?.data?.message || 'Erreur lors de l\'inscription'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.center-wrapper {
  min-height: calc(100vh - 80px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.form-width {
  width: 50%;
}

.custom-button {
  width: 80%;
}
</style>