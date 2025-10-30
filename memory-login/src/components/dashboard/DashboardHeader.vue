<!--
  DashboardHeader.vue
  
  🏗️ DASHBOARD HEADER COMPONENT
  Responsabilité: En-tête avec salutation et bouton déconnexion
  
  Props:
  - userName: String - Nom de l'utilisateur
  
  Events:
  - @logout - Déconnexion utilisateur
-->
<template>
  <div class="hero-header">
    <div class="hero-content">
      <div class="hero-text">
        <h1 class="hero-title">
          <span class="wave">👋</span> Bonjour {{ userName }}
        </h1>
        <p class="hero-subtitle">Organisez vos idées, créez vos notes</p>
      </div>
      <div class="hero-actions">
        <button class="btn-logout" @click="$emit('logout')">
          <span class="icon">🚪</span>
          Déconnexion
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DashboardHeader',
  props: {
    userName: {
      type: String,
      default: 'Utilisateur'
    }
  },
  emits: ['logout']
}
</script>

<style scoped>
.hero-header {
  background: white;
  border-bottom: 1px solid #ddd;
  padding: 2rem;
}

.hero-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.hero-title {
  font-size: 2rem;
  margin: 0 0 0.5rem 0;
  color: #333;
}

.wave {
  display: inline-block;
}

.hero-subtitle {
  margin: 0;
  color: #666;
}

.btn-logout {
  background: #dc3545;
  border: none;
  color: white;
  padding: 0.5rem 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

@media (max-width: 768px) {
  .hero-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .hero-title {
    font-size: 1.5rem;
  }
}
</style>