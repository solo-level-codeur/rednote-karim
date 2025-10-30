import { reactive } from 'vue'

const state = reactive({
  user: null,
  token: null,
  isAuthenticated: false
})

export const authStore = {
  state,
  
  login(userData) {
    state.user = userData
    state.token = userData.token
    state.isAuthenticated = true
    
    localStorage.setItem('authToken', userData.token)
    localStorage.setItem('user', JSON.stringify(userData))
  },
  
  logout() {
    state.user = null
    state.token = null
    state.isAuthenticated = false
    
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
  },
  
  initializeAuth() {
    const token = localStorage.getItem('authToken')
    const userData = localStorage.getItem('user')
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData)
        state.user = user
        state.token = token
        state.isAuthenticated = true
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de l\'authentification:', error)
        this.logout()
      }
    }
  }
}