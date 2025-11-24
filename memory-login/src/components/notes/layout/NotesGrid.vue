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
  <div class="w-100">
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Chargement...</span>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="notes.length === 0" class="text-center py-5">
      <div class="mb-3 text-muted">
        <i class="fas fa-sticky-note" style="font-size: 3rem;"></i>
      </div>
      <h5 class="text-muted">Aucune note trouvée</h5>
      <p class="text-muted">Créez votre première note pour commencer</p>
    </div>

    <!-- Notes Grid -->
    <div v-else class="row g-4">
      <div 
        v-for="note in notes" 
        :key="note.id"
        class="col-12 col-md-6 col-xl-4">
        <NoteCard 
          :note="note"
          @edit="$emit('edit-note', $event)"
          @delete="$emit('delete-note', $event)" />
      </div>
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
/* Aucun CSS personnalisé - 100% Bootstrap */
</style>