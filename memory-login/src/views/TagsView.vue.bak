<!--
  TagsView.vue
  
  🎯 VUE DE GESTION DES TAGS
  Responsabilité: Interface principale pour gérer tous les tags
  
  Composants utilisés:
  - Sidebar (global) - Navigation latérale
  - TagManager - Gestionnaire principal des tags
-->
<template>
  <div class="tags-layout">
    <Sidebar />
    
    <main class="main-content">
      <div class="hero-section">
        <div class="container-fluid py-4">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 class="display-6 fw-bold text-primary mb-2">
                <i class="fas fa-tags me-3"></i>
                Gestion des Tags
              </h1>
              <p class="text-muted mb-0">Organisez et gérez vos étiquettes pour classifier vos notes</p>
            </div>
          </div>
        </div>
      </div>
      
      <div class="tags-content">
        <div class="container-fluid">
          <TagManager />
        </div>
      </div>
    </main>
  </div>
</template>

<script>
// Sidebar est maintenant un composant global (voir main.js)
import TagManager from '../components/TagManager.vue'

export default {
  name: 'TagsView',
  components: {
    
    TagManager
  }
}
</script>

<style scoped>
.tags-layout {
  display: flex;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  margin-left: 250px;
  background: #f8f9fa;
}

.hero-section {
  background: #343a40;
  color: white;
}

.hero-section .text-primary {
  color: white !important;
}

.hero-section .text-muted {
  color: rgba(255, 255, 255, 0.8) !important;
}

.tags-content {
  padding: 2rem 0;
  background: white;
  margin: 0 2rem 2rem;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
  }
  
  .hero-section {
    padding: 1rem;
  }
  
  .tags-content {
    margin: 0 1rem 1rem;
    padding: 1rem;
  }
}
</style>