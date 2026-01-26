<template>
  <div class="col-md-6 mx-auto">
    <div class="mb-3">
      <input 
        class="form-control form-control-lg" 
        v-model="email" 
        type="email" 
        placeholder="Email"
        :disabled="loading">
    </div>

    <div class="mb-3">
      <input 
        class="form-control form-control-lg" 
        v-model="password" 
        type="password" 
        placeholder="Password"
        :disabled="loading"
        @keyup.enter="handleLogin">
    </div>

    <div v-if="error" class="alert alert-danger" role="alert">
      <i class="fas fa-exclamation-triangle me-2"></i>
      {{ error }}
    </div>

    <div class="text-end mb-4">
      <a href="#" class="text-decoration-none">Forgot Password?</a>
    </div>

    <div class="text-center mb-4">
      <button 
        class="btn btn-danger btn-lg w-75"
        @click="handleLogin"
        :disabled="loading || !email || !password">
        <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
        <i v-else class="fas fa-sign-in-alt me-2"></i>
        Log In
      </button>
    </div>

    <p class="text-center mt-4">
      Don't have an account? 
      <router-link to="/register" class="text-decoration-none fw-semibold">Sign Up</router-link>
    </p>
  </div>
</template>

<script>
import { authAPI } from '../services/api'
import { authStore } from '../stores/auth'

export default {
  name: 'LoginForm',
  data() {
    return {
      email: '',
      password: '',
      loading: false,
      error: null
    }
  },
  methods: {
    async handleLogin() {
      if (!this.email || !this.password) {
        this.error = 'Veuillez remplir tous les champs'
        return
      }

      this.loading = true
      this.error = null

      try {
        const response = await authAPI.login({
          email: this.email,
          password: this.password
        })

        authStore.login(response.data)
        
        this.$router.push('/home')
      } catch (error) {
        console.error('Erreur de connexion:', error)
        this.error = error.response?.data?.message || 'Erreur de connexion'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
/* Aucun CSS personnalisé - 100% Bootstrap */
</style>