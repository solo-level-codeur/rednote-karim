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
    
    <div class="card-footer bg-light d-flex justify-content-between align-items-center">
      <div class="d-flex gap-2">
        <button 
          class="btn btn-outline-info btn-sm"
          @click="showShareOptions = !showShareOptions"
          type="button"
          :disabled="loading"
        >
          <i class="fas fa-share-alt me-2"></i>
          {{ showShareOptions ? 'Masquer partage' : 'Options de partage' }}
        </button>
      </div>
      
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

    <!-- Section de partage (collapsible) -->
    <div v-if="showShareOptions" class="card-footer border-top">
      <div class="share-section">
        <h6 class="text-muted mb-3">
          <i class="fas fa-share-alt me-2"></i>
          Options de partage
        </h6>
        <div class="form-check mb-2">
          <input 
            class="form-check-input" 
            type="checkbox" 
            id="shareAfterCreation"
            v-model="shareAfterCreation"
          >
          <label class="form-check-label" for="shareAfterCreation">
            Partager la note après création
          </label>
        </div>
        <div v-if="shareAfterCreation" class="mt-2">
          <label class="form-label small">Partager avec :</label>
          <input 
            type="email" 
            class="form-control form-control-sm" 
            placeholder="email@example.com"
            v-model="shareEmail"
          >
          <small class="text-muted">La note sera partagée automatiquement avec cet utilisateur</small>
        </div>
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
      selectedProject: null,
      showShareOptions: false,
      shareAfterCreation: false,
      shareEmail: ''
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
          projectId: this.selectedProject,
          shareSettings: {
            shouldShare: this.shareAfterCreation,
            shareEmail: this.shareEmail
          }
        }
        this.$emit('create', noteData)
      }
    },
    handleCancel() {
      // Reset all form data
      this.selectedTags = []
      this.selectedProject = null
      this.showShareOptions = false
      this.shareAfterCreation = false
      this.shareEmail = ''
      this.$emit('cancel')
    }
  }
}
</script>

<style scoped>
/* Aucun CSS personnalisé - 100% Bootstrap */
</style>