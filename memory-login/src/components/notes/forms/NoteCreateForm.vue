<!--
  NoteCreateForm.vue
  
  📝 FORM COMPONENT  
  Responsabilité: Formulaire complet de création avec éditeur riche
  
  Props:
  - show: Boolean - Afficher/masquer le formulaire
  - loading: Boolean - État de chargement
  - newNote: Object - Données {title, content}
  
  Events:
  - @create - Données de la note à créer
  - @cancel - Annulation du formulaire
-->
<template>
  <div v-if="show" class="create-form">
    <div class="form-header">
      <h3 class="form-title">
        <span class="form-icon">✍️</span>
        Créer une nouvelle note
      </h3>
    </div>
    <div class="form-body">
      <div class="form-field">
        <input 
          class="form-input" 
          v-model="localNote.title" 
          type="text" 
          placeholder="Donnez un titre à votre note..."
          :disabled="loading">
      </div>
      <div class="form-field editor-field">
        <TiptapEditor 
          v-model="localNote.content" 
          :disabled="loading" />
      </div>
    </div>
    <div class="form-actions">
      <button 
        class="btn-create"
        @click="handleCreate"
        :disabled="loading || !localNote.title || !localNote.content"
        :class="{ 'is-loading': loading }">
        <span class="btn-icon">🚀</span>
        Créer la note
      </button>
      <button 
        class="btn-cancel"
        @click="handleCancel">
        <span class="btn-icon">❌</span>
        Annuler
      </button>
    </div>
  </div>
</template>

<script>
import TiptapEditor from '../../TiptapEditor.vue'

export default {
  name: 'NoteCreateForm',
  components: {
    TiptapEditor
  },
  props: {
    show: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    newNote: {
      type: Object,
      default: () => ({ title: '', content: '' })
    }
  },
  emits: ['create', 'cancel'],
  computed: {
    localNote: {
      get() {
        return this.newNote
      },
      set(value) {
        this.$emit('update:newNote', value)
      }
    }
  },
  methods: {
    handleCreate() {
      if (this.localNote.title && this.localNote.content) {
        this.$emit('create', this.localNote)
      }
    },
    handleCancel() {
      this.$emit('cancel')
    }
  }
}
</script>

<style scoped>
.create-form {
  background: white;
  border: 1px solid #ddd;
  margin-bottom: 2rem;
}

.form-header {
  background: white;
  border-bottom: 1px solid #ddd;
  padding: 1rem;
}

.form-title {
  font-size: 1.2rem;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-body {
  padding: 1rem;
}

.form-field {
  margin-bottom: 1rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  font-size: 1rem;
}

.form-input:focus {
  outline: none;
  border-color: #007bff;
}

.form-actions {
  padding: 1rem;
  background: #f5f5f5;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.btn-create {
  background: #007bff;
  border: none;
  color: white;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
}

.btn-create:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-cancel {
  background: #ddd;
  border: none;
  color: #333;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
}
</style>