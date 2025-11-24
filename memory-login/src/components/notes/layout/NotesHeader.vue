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
    
    <button 
      class="btn btn-primary btn-lg"
      @click="$emit('create-note')"
      v-if="!showCreateForm">
      Nouvelle Note
    </button>
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
  emits: ['create-note']
}
</script>

<style scoped>
/* Aucun CSS personnalisé - 100% Bootstrap */
</style>