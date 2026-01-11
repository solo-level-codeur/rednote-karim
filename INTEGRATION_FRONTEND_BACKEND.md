# 🔌 Guide d'Intégration Frontend-Backend

## 📋 Vue d'ensemble

Ce document détaille toutes les modifications nécessaires pour connecter votre frontend Vue.js (memory-login) à votre backend API Node.js (poc 3).

## 🔧 Modifications effectuées

### 1. Installation des dépendances

**Commande à exécuter :**
```bash
cd memory-login
npm install axios
```

### 2. Création du service API (`src/services/api.js`)

**Nouveau fichier créé :**
```javascript
import axios from 'axios'

const API_BASE_URL = 'http://localhost:3000/api/notes'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Intercepteur pour ajouter automatiquement le token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Intercepteur pour gérer les erreurs d'authentification
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Services d'authentification
export const authAPI = {
  register: (userData) => api.post('/register', userData),
  login: (credentials) => api.post('/login', credentials),
  getProfile: () => api.get('/profile')
}

// Services pour les notes
export const notesAPI = {
  getAllNotes: () => api.get('/'),
  getNoteById: (id) => api.get(`/note/${id}`),
  createNote: (noteData) => api.post('/note', noteData),
  updateNote: (id, noteData) => api.put(`/note/${id}`, noteData),
  deleteNote: (id) => api.delete(`/note/${id}`)
}

export default api
```

### 3. Création du store d'authentification (`src/stores/auth.js`)

**Nouveau fichier créé :**
```javascript
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
```

### 4. Modification du composant LoginForm (`src/components/LoginForm.vue`)

**Remplacer entièrement le contenu par :**
```vue
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
```

### 5. Modification de RegisterView (`src/views/RegisterView.vue`)

**Modifications dans la section template :**

**Remplacer :**
```vue
<div class="field">
  <input 
    class="input" 
    v-model="fullName" 
    type="text" 
    placeholder="Full Name">
</div>
```

**Par :**
```vue
<div class="field">
  <input 
    class="input" 
    v-model="username" 
    type="text" 
    placeholder="Username"
    :disabled="loading">
</div>
```

**Ajouter les attributs disabled aux autres champs :**
```vue
<input :disabled="loading">
```

**Remplacer le bouton :**
```vue
<button 
  class="button is-danger is-medium custom-button"
  @click="handleRegister"
  :disabled="loading || !isFormValid"
  :class="{ 'is-loading': loading }">
  Sign Up
</button>
```

**Ajouter avant le bouton :**
```vue
<div v-if="error" class="notification is-danger is-light mb-4">
  {{ error }}
</div>
```

**Remplacer le lien :**
```vue
<router-link to="/login">Log In</router-link>
```

**Modifications dans la section script :**

**Remplacer entièrement la section script par :**
```vue
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
```

### 6. Modification du main.js (`src/main.js`)

**Ajouter les imports :**
```javascript
import { authStore } from './stores/auth'
```

**Ajouter avant la création de l'app :**
```javascript
// Initialiser l'authentification
authStore.initializeAuth()
```

**Le fichier complet devient :**
```javascript
import { createApp } from "vue";
import App from "./App.vue";
import router from './router'
import Oruga from "@oruga-ui/oruga-next";
import { bulmaConfig } from "@oruga-ui/theme-bulma";
import "@oruga-ui/theme-bulma/dist/bulma.css";
import { authStore } from './stores/auth'

// Initialiser l'authentification
authStore.initializeAuth()

// CORRECT : Créer l'app d'abord
const app = createApp(App)
app.use(router)                    // ← Ajouter le router AVANT mount
app.use(Oruga, bulmaConfig)        // ← Ajouter Oruga AVANT mount  
app.mount("#app")                  // ← Mount en dernier
```

### 7. Modification du router (`src/router/index.js`)

**Ajouter l'import :**
```javascript
import { authStore } from '../stores/auth'
```

**Ajouter meta à la route dashboard :**
```javascript
{
  path: '/dashboard',
  name: 'dashboard',
  component: DashboardView,
  meta: { requiresAuth: true }
},
```

**Ajouter les guards de navigation avant export :**
```javascript
// Navigation guards
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  
  if (requiresAuth && !authStore.state.isAuthenticated) {
    next('/login')
  } else if ((to.name === 'login' || to.name === 'register') && authStore.state.isAuthenticated) {
    next('/dashboard')
  } else {
    next()
  }
})
```

**Le fichier complet devient :**
```javascript
import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'
import RegisterView from '../views/RegisterView.vue'
import { authStore } from '../stores/auth'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardView,
    meta: { requiresAuth: true }
  },
  {
    path:'/register',
    name:'register',
    component: RegisterView
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guards
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  
  if (requiresAuth && !authStore.state.isAuthenticated) {
    next('/login')
  } else if ((to.name === 'login' || to.name === 'register') && authStore.state.isAuthenticated) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
```

## 🗄️ Structure de la base de données requise

Assurez-vous que votre base de données MySQL contient les tables suivantes :

### Table `users`
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Table `notes`
```sql
CREATE TABLE notes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## 🚀 Étapes pour tester l'intégration

### 1. Démarrer le backend
```bash
cd "poc 3"
npm run dev  # ou npm start
```
Le backend sera accessible sur http://localhost:3000

### 2. Démarrer le frontend
```bash
cd memory-login
npm run dev
```
Le frontend sera accessible sur http://localhost:5173 (ou autre port Vite)

### 3. Tester les fonctionnalités

1. **Inscription** : Aller sur http://localhost:5173/register
   - Remplir le formulaire avec username, email, password
   - Vérifier la redirection vers le dashboard après inscription

2. **Connexion** : Aller sur http://localhost:5173/login
   - Se connecter avec les identifiants créés
   - Vérifier la redirection vers le dashboard

3. **Protection des routes** :
   - Essayer d'accéder à /dashboard sans être connecté
   - Vérifier la redirection vers /login

## 📁 Fichiers modifiés/créés

### Nouveaux fichiers :
- `memory-login/src/services/api.js`
- `memory-login/src/stores/auth.js`

### Fichiers modifiés :
- `memory-login/package.json` (ajout d'axios)
- `memory-login/src/components/LoginForm.vue`
- `memory-login/src/views/RegisterView.vue`
- `memory-login/src/main.js`
- `memory-login/src/router/index.js`

## 🔐 Fonctionnalités implémentées

✅ **Authentification complète**
- Inscription avec validation
- Connexion avec JWT
- Déconnexion automatique
- Persistance de session

✅ **Sécurité**
- Protection des routes
- Gestion automatique des tokens
- Redirection en cas d'expiration

✅ **Gestion d'erreurs**
- Messages d'erreur utilisateur
- Gestion des erreurs réseau
- Validation des formulaires

✅ **Interface utilisateur**
- États de chargement
- Feedback visuel
- Navigation intuitive

## 🎯 Prochaines étapes possibles

1. **Ajout de la gestion des notes dans le dashboard**
2. **Amélioration de l'interface utilisateur**
3. **Ajout de fonctionnalités avancées** (recherche, catégories, etc.)
4. **Tests unitaires et d'intégration**
5. **Déploiement en production**