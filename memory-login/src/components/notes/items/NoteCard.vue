<!--
  NoteCard.vue
  
  📄 ITEM COMPONENT
  Responsabilité: Affichage d'une carte de note avec actions
  
  Props:
  - note: Object - {id, title, content, created_at}
  
  Events:
  - @edit - Note à éditer
  - @delete - Note à supprimer
  
  Méthodes utilitaires:
  - formatDate() - Format français
  - getPreview() - Aperçu 150 caractères  
-->
<template>
  <div class="note-card">
    <div class="note-content">
      <div class="note-header">
        <h4 class="note-title">{{ note.title }}</h4>
        <div class="note-actions">
          <button class="action-btn edit" @click="$emit('edit', note)" title="Modifier">
            <span>✏️</span>
          </button>
          <button class="action-btn delete" @click="$emit('delete', note)" title="Supprimer">
            <span>🗑️</span>
          </button>
        </div>
      </div>
      <div class="note-text" v-html="getPreview(note.content)"></div>
      <div class="note-footer">
        <span class="note-date">
          <span class="date-icon">📅</span>
          {{ formatDate(note.created_at) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import { stripHtmlAndTruncate } from '../../../utils/textUtils'

export default {
  name: 'NoteCard',
  props: {
    note: {
      type: Object,
      required: true
    }
  },
  emits: ['edit', 'delete'],
  methods: {
    formatDate(dateString) {
      if (!dateString) return ''
      return new Date(dateString).toLocaleDateString('fr-FR')
    },

    getPreview(content) {
      return stripHtmlAndTruncate(content, 150)
    },

  }
}
</script>

<style scoped>
.note-card {
  background: white;
  border: 1px solid #ddd;
  padding: 1rem;
  position: relative;
}

.note-content {
  padding: 1.5rem;
}

.note-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.note-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
  flex: 1;
  line-height: 1.3;
}

.note-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.note-text {
  color: #4a5568;
  line-height: 1.6;
  margin-bottom: 1rem;
  font-size: 0.95rem;
}

.note-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
  font-size: 0.85rem;
  color: #718096;
}

.note-date {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.date-icon {
  font-size: 0.9rem;
}

@media (max-width: 480px) {
  .note-content {
    padding: 1rem;
  }
}
</style>