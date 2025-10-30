<template>
  <div class="form-width">
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
        class="input is-half" 
        v-model="password" 
        type="password" 
        placeholder="Password"
        :disabled="loading"
        @keyup.enter="handleLogin">
    </div>

    <div v-if="error" class="notification is-danger is-light mb-4">
      {{ error }}
    </div>

    <div class="has-text-right mb-4">
      <a href="#">Forgot Password?</a>
    </div>

    <div class="has-text-centered">
      <button 
        class="button is-danger is-medium custom-button"
        @click="handleLogin"
        :disabled="loading || !email || !password"
        :class="{ 'is-loading': loading }">
        Log In
      </button>
    </div>

    <p class="has-text-centered mt-5">
      Don't have an account? <router-link to="/register">Sign Up</router-link>
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
        
        this.$router.push('/dashboard')
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
.form-width {
  width: 50%;
}

.custom-button {
  width: 80%;
}
</style>