<!--
  NotesEditor.vue
  
  ✏️ WORKSPACE EDITOR COMPONENT
  Responsabilité: Éditeur principal avec titre et contenu
  
  Props:
  - currentNote: Object - Note actuellement éditée
  - loading: Boolean - État de sauvegarde
  
  Events:
  - @update-note - Note mise à jour
  - @create-note - Création d'une nouvelle note
-->
<template>
  <main class="editor-main">
    <div v-if="currentNote" class="editor-container">
      <!-- En-tête de la note -->
      <div class="note-editor-header">
        <input 
          :value="currentNote.title"
          @input="handleTitleUpdate"
          class="note-title-input" 
          placeholder="Titre de votre note..."
        >
        <div class="editor-meta">
          <span v-if="loading" class="saving-indicator">
            💾 Sauvegarde...
          </span>
          <span v-else class="saved-indicator">
            ✅ Sauvegardé
          </span>
        </div>
      </div>
      
      <!-- Éditeur TipTap -->
      <div class="editor-wrapper">
        <TiptapEditor 
          :modelValue="currentNote.content"
          @update:modelValue="handleContentUpdate"
        />
      </div>
    </div>
    
    <!-- État vide -->
    <div v-else class="empty-editor">
      <div class="empty-content">
        <div class="empty-icon">📝</div>
        <h2 class="empty-title">Sélectionnez une note</h2>
        <p class="empty-subtitle">Choisissez une note dans la liste ou créez-en une nouvelle.</p>
        
        <button class="btn-primary-large" @click="$emit('create-note')">
          <span class="btn-icon">✨</span>
          Créer une note
        </button>
      </div>
    </div>
  </main>
</template>

<script>
import TiptapEditor from '../../TiptapEditor.vue'

export default {
  name: 'NotesEditor',
  components: {
    TiptapEditor
  },
  props: {
    currentNote: {
      type: Object,
      default: null
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update-note', 'create-note'],
  methods: {
    handleTitleUpdate(event) {
      if (this.currentNote) {
        const updatedNote = {
          ...this.currentNote,
          title: event.target.value
        }
        this.$emit('update-note', updatedNote)
      }
    },
    
    handleContentUpdate(content) {
      if (this.currentNote) {
        const updatedNote = {
          ...this.currentNote,
          content: content
        }
        this.$emit('update-note', updatedNote)
      }
    }
  }
}
</script>

<style scoped>
.editor-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
  min-width: 0; /* Important pour éviter l'overflow */
}

.editor-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.note-editor-header {
  padding: 1rem;
  border-bottom: 1px solid #ccc;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.note-title-input {
  flex: 1;
  font-size: 1.5rem;
  font-weight: 600;
  border: none;
  outline: none;
  padding: 0.5rem;
  background: transparent;
}

.editor-meta {
  font-size: 0.8rem;
}

.saving-indicator {
  color: orange;
}

.saved-indicator {
  color: green;
}

.editor-wrapper {
  flex: 1;
  padding: 1rem;
}

.empty-editor {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
}

.empty-content {
  text-align: center;
}

.empty-title {
  font-size: 1.5rem;
  margin: 0 0 1rem 0;
}

.empty-subtitle {
  margin: 0 0 1rem 0;
  color: #666;
}

.btn-primary-large {
  background: #007bff;
  border: none;
  color: white;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
}
</style>