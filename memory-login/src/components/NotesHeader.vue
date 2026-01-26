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
  <div class="d-flex justify-content-end mb-4">
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