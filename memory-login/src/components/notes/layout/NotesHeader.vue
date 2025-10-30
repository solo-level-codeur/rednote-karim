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
  <div class="notes-header">
    <div class="header-content">
      <h2 class="notes-title">
        <span class="notes-icon">📚</span>
        Mes Notes
      </h2>
      <p class="notes-subtitle">Organisez vos idées et inspirations</p>
    </div>
    <button 
      class="btn-new-note"
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
.notes-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  gap: 2rem;
}

.header-content {
  flex: 1;
}

.notes-title {
  font-size: 2rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.notes-icon {
  font-size: 2.2rem;
}

.notes-subtitle {
  color: #718096;
  margin: 0;
  font-size: 1.1rem;
}

.btn-new-note {
  background: #007bff;
  border: none;
  color: white;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
}

@media (max-width: 768px) {
  .notes-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .notes-title {
    font-size: 1.75rem;
  }
}

@media (max-width: 480px) {
  .notes-title {
    font-size: 1.5rem;
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>