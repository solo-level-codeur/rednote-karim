<!--
  TagsView.vue
  
  🎯 VUE DE GESTION DES TAGS
  Responsabilité: Interface principale pour gérer tous les tags
  
  Composants utilisés:
  - Sidebar (global) - Navigation latérale
  - TagManager - Gestionnaire principal des tags
-->
<template>
  <div class="d-flex min-vh-100 bg-light">
    <Sidebar />
    
    <main class="flex-grow-1" style="margin-left: 250px;">
      <div class="container-fluid p-4">
        <TagManager />
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
/* CSS minimal - utilisation maximale de Bootstrap */
</style>