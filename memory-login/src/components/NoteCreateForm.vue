<!--
  NoteCreateForm.vue
  
  📝 FORM COMPONENT  
  Responsabilité: Formulaire complet de création avec éditeur riche
  
  Props:
  - show: Boolean - Afficher/masquer le formulaire
  - loading: Boolean - État de chargement
  - projectId: String/Number - ID du projet (automatique selon l'URL)
  
  Events:
  - @create - Données de la note à créer
  - @cancel - Annulation du formulaire
  
  SIMPLIFIÉ:
  - Pas de choix de projet à la création
  - /notes → Note personnelle (projectId = null)
  - /projects/X/notes → Note dans le projet X (automatique)
-->
<template>
  <div v-if="show" class="card mb-4 shadow-sm">
    <div class="card-header bg-white border-bottom">
      <h3 class="h5 mb-0 d-flex align-items-center">
        <span class="me-2 fs-4">✍️</span>
        Créer une nouvelle note
        <span v-if="projectId" class="badge bg-secondary ms-2">
          <i class="fas fa-folder me-1"></i>
          Dans ce projet
        </span>
      </h3>
    </div>
    
    <div class="card-body">
      <div class="mb-3">
        <input 
          class="form-control form-control-lg" 
          v-model="title" 
          type="text" 
          placeholder="Donnez un titre à votre note..."
          :disabled="loading">
      </div>
      
      <div class="mb-3">
        <TiptapEditor 
          v-model="content" 
          :disabled="loading" />
      </div>

      <!-- Section tags uniquement -->
      <div class="mb-3">
        <TagSelector
          v-model="selectedTags"
          :disabled="loading"
        />
      </div>
    </div>
    
    <div class="card-footer bg-light d-flex justify-content-end align-items-center">
      <div class="d-flex gap-2">
        <button 
          class="btn btn-primary btn-lg d-flex align-items-center"
          @click="handleCreate"
          :disabled="loading || !title || !content">
          <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
          <span class="me-2">🚀</span>
          Créer la note
        </button>
        
        <button 
          class="btn btn-secondary btn-lg d-flex align-items-center"
          @click="handleCancel">
          <span class="me-2">❌</span>
          Annuler
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import TiptapEditor from './TiptapEditor.vue'
import TagSelector from './TagSelector.vue'

export default {
  name: 'NoteCreateForm',
  components: {
    TiptapEditor,
    TagSelector
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
    projectId: {
      type: [String, Number],
      default: null
    }
  },
  emits: ['create', 'cancel'],
  data() {
    return {
      title: '',
      content: '',
      selectedTags: []
    }
  },
  methods: {
    handleCreate() {
      if (this.title && this.content) {
        const noteData = {
          title: this.title,
          content: this.content,
          tags: this.selectedTags,
          projectId: this.projectId || null  // Automatique selon l'URL
        }
        this.$emit('create', noteData)
      }
    },
    handleCancel() {
      this.resetForm()
      this.$emit('cancel')
    },
    resetForm() {
      this.title = ''
      this.content = ''
      this.selectedTags = []
    }
  },
  watch: {
    show(newValue) {
      if (!newValue) {
        this.resetForm()
      }
    }
  }
}
</script>

<style scoped>
/* Aucun CSS personnalisé - 100% Bootstrap */
</style>