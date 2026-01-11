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
  <div class="card h-100">
    <div class="card-body">
      <div class="d-flex justify-content-between align-items-start mb-3">
        <h5 class="card-title mb-0 flex-grow-1 pe-2">{{ note.title }}</h5>
        
        <div class="btn-group btn-group-sm">
          <button 
            class="btn btn-outline-primary" 
            @click="$emit('edit', note)" 
            title="Modifier">
            <i class="fas fa-edit"></i>
          </button>
          <button 
            class="btn btn-outline-success" 
            @click="showShareModal = true" 
            title="Partager">
            <i class="fas fa-share-alt"></i>
          </button>
          <button 
            class="btn btn-outline-info" 
            @click="showTagModal = true" 
            title="Gérer les tags">
            <i class="fas fa-tags"></i>
          </button>
          <button 
            class="btn btn-outline-warning" 
            @click="showProjectModal = true" 
            title="Assigner à un projet">
            <i class="fas fa-folder"></i>
          </button>
          <button 
            class="btn btn-outline-danger" 
            @click="$emit('delete', note)" 
            title="Supprimer">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
      
      <div class="card-text text-muted mb-0" v-html="getPreview(note.content)"></div>
    </div>
    
    <div class="card-footer bg-transparent border-0">
      <small class="text-muted">
        <i class="fas fa-calendar-alt me-2"></i>{{ formatDate(note.created_at) }}
      </small>
    </div>
    
    <!-- Modals -->
    <SimpleModal 
      v-if="showShareModal"
      :show="showShareModal"
      :title="`Partager : ${note.title}`"
      icon="fas fa-share-alt"
      size="lg"
      @close="showShareModal = false"
    >
      <ShareForm 
        :noteId="note.id"
        @shared="handleNoteShared"
        @share-removed="handleShareRemoved"
      />
    </SimpleModal>
    
    <SimpleModal 
      v-if="showTagModal"
      :show="showTagModal"
      :title="`Gérer les tags : ${note.title}`"
      icon="fas fa-tags"
      size="lg"
      @close="showTagModal = false"
    >
      <TagSelector 
        :noteId="note.id"
        @update:modelValue="handleTagsUpdate"
      />
    </SimpleModal>
    
    <SimpleModal 
      v-if="showProjectModal"
      :show="showProjectModal"
      :title="`Assigner à un projet : ${note.title}`"
      icon="fas fa-folder"
      @close="showProjectModal = false"
    >
      <ProjectSelector 
        :noteId="note.id"
        :currentProjectId="note.project_id"
        @update:modelValue="handleProjectUpdate"
      />
    </SimpleModal>
  </div>
</template>

<script>
import { stripHtmlAndTruncate } from '../utils/textUtils'
import ShareForm from './ShareForm.vue'
import SimpleModal from './SimpleModal.vue'
import TagSelector from './TagSelector.vue'
import ProjectSelector from './ProjectSelector.vue'

export default {
  name: 'NoteCard',
  components: {
    ShareForm,
    SimpleModal,
    TagSelector,
    ProjectSelector
  },
  props: {
    note: {
      type: Object,
      required: true
    }
  },
  emits: ['edit', 'delete', 'tags-updated', 'project-updated'],
  data() {
    return {
      showShareModal: false,
      showTagModal: false,
      showProjectModal: false
    }
  },
  methods: {
    formatDate(dateString) {
      if (!dateString) return ''
      return new Date(dateString).toLocaleDateString('fr-FR')
    },

    getPreview(content) {
      return stripHtmlAndTruncate(content, 150)
    },

    handleTagsUpdate(tags) {
      // Émettre un événement pour notifier le parent des changements de tags
      this.$emit('tags-updated', this.note.id, tags)
    },

    handleProjectUpdate(projectId) {
      // Émettre un événement pour notifier le parent des changements de projet
      this.$emit('project-updated', this.note.id, projectId)
    },

    handleNoteShared() {
      // La note a été partagée
      this.showShareModal = false
    },

    handleShareRemoved() {
      // Un partage a été révoqué
      this.showShareModal = false
    }
  }
}
</script>

<style scoped>
/* Aucun CSS personnalisé - 100% Bootstrap */
</style>