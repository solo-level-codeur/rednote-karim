<!--
  NotesGrid.vue
  
  🏗️ LAYOUT COMPONENT
  Responsabilité: Grille d'affichage avec états loading/empty
  
  Props:
  - notes: Array - Liste des notes
  - loading: Boolean - État de chargement
  
  Events:
  - @edit-note - Note à éditer (propagé depuis NoteCard)
  - @delete-note - Note à supprimer (propagé depuis NoteCard)
-->
<template>
  <div class="notes-grid-container">
    <div v-if="loading" class="has-text-centered">
      <div class="button is-loading is-large is-white"></div>
    </div>

    <div v-else-if="notes.length === 0" class="has-text-centered">
      <p class="subtitle">Aucune note trouvée</p>
    </div>

    <div v-else class="notes-grid">
      <NoteCard 
        v-for="note in notes" 
        :key="note.id" 
        :note="note"
        @edit="$emit('edit-note', $event)"
        @delete="$emit('delete-note', $event)" />
    </div>
  </div>
</template>

<script>
import NoteCard from '../items/NoteCard.vue'

export default {
  name: 'NotesGrid',
  components: {
    NoteCard
  },
  props: {
    notes: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  emits: ['edit-note', 'delete-note']
}
</script>

<style scoped>
.notes-grid-container {
  width: 100%;
}

/* Grille des notes */
.notes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

/* États de chargement et vide */
.has-text-centered {
  text-align: center;
  padding: 2rem;
}

.subtitle {
  font-size: 1.25rem;
  color: #718096;
  margin: 0;
}

.button.is-loading.is-large.is-white {
  background: transparent;
  border: none;
  width: 50px;
  height: 50px;
  position: relative;
}

.button.is-loading.is-large.is-white::after {
  content: '';
  position: absolute;
  width: 30px;
  height: 30px;
  margin: auto;
  border: 3px solid transparent;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

@keyframes spin {
  0% { transform: translate(-50%, -50%) rotate(0deg); }
  100% { transform: translate(-50%, -50%) rotate(360deg); }
}

/* Responsive */
@media (max-width: 768px) {
  .notes-grid {
    grid-template-columns: 1fr;
  }
}
</style>