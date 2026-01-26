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
  <div v-if="show" class="card mb-4 shadow-sm">
    <div class="card-header bg-white border-bottom">
      <h3 class="h5 mb-0 d-flex align-items-center">
        <span class="me-2 fs-4">✍️</span>
        Créer une nouvelle note
      </h3>
    </div>
    
    <div class="card-body">
      <div class="mb-3">
        <input 
          class="form-control form-control-lg" 
          v-model="localNote.title" 
          type="text" 
          placeholder="Donnez un titre à votre note..."
          :disabled="loading">
      </div>
      
      <div class="mb-3">
        <TiptapEditor 
          v-model="localNote.content" 
          :disabled="loading" />
      </div>

      <!-- Section avancée avec tags et projet -->
      <div class="advanced-options mb-3">
        <div class="row">
          <div class="col-md-6">
            <TagSelector
              v-model="selectedTags"
              :disabled="loading"
            />
          </div>
          <div class="col-md-6">
            <ProjectSelector
              v-model="selectedProject"
              :disabled="loading"
            />
          </div>
        </div>
      </div>
    </div>
    
    <div class="card-footer bg-light d-flex justify-content-end align-items-center">
      <div class="d-flex gap-2">
      <button 
        class="btn btn-primary btn-lg d-flex align-items-center"
        @click="handleCreate"
        :disabled="loading || !localNote.title || !localNote.content">
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
import ProjectSelector from './ProjectSelector.vue'

export default {
  name: 'NoteCreateForm',
  components: {
    TiptapEditor,
    TagSelector,
    ProjectSelector
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
  data() {
    return {
      selectedTags: [],
      selectedProject: null
    }
  },
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
        const noteData = {
          ...this.localNote,
          tags: this.selectedTags,
          projectId: this.selectedProject
        }
        this.$emit('create', noteData)
      }
    },
    handleCancel() {
      // Reset all form data
      this.selectedTags = []
      this.selectedProject = null
      this.$emit('cancel')
    }
  }
}
</script>

<style scoped>
/* Aucun CSS personnalisé - 100% Bootstrap */
</style>