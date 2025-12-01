<!--
  NotesHeader.vue
  
  🏗️ LAYOUT COMPONENT
  Responsabilité: Afficher l'en-tête avec titre et bouton de création
  
  Props:
  - showCreateForm: Boolean - Masquer le bouton si formulaire ouvert
  
  Events:
  - @create-note - Déclenché au clic sur "Nouvelle Note"
-->
<template>
  <div class="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-3">
    <div class="flex-grow-1">
      <h2 class="h2 fw-bold text-dark mb-2 d-flex align-items-center">
        <span class="me-3 fs-1">📚</span>
        Mes Notes
      </h2>
      <p class="text-muted mb-0 fs-5">Organisez vos idées et inspirations</p>
    </div>
    
    <div class="d-flex gap-2">
      <button 
        class="btn btn-outline-primary btn-lg"
        @click="$emit('search')"
        title="Rechercher des notes">
        <i class="fas fa-search"></i>
      </button>
      <button 
        class="btn btn-primary btn-lg"
        @click="$emit('create-note')"
        v-if="!showCreateForm">
        Nouvelle Note
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotesHeader',
  props: {
    showCreateForm: {
      type: Boolean,
      default: false
    }
  },
  emits: ['create-note', 'search']
}
</script>

<style scoped>
/* Aucun CSS personnalisé - 100% Bootstrap */
</style>