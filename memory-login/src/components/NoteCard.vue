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
      
      <div class="card-text text-muted mb-3" v-html="getPreview(note.content)"></div>
      
      <!-- Affichage des tags -->
      <div v-if="note.tags && note.tags.length > 0" class="mb-2">
        <span 
          v-for="tag in note.tags" 
          :key="tag.id"
          class="badge bg-secondary me-1"
        >
          {{ tag.name }}
        </span>
      </div>
    </div>
    
    <div class="card-footer bg-transparent border-0">
      <small class="text-muted">
        <i class="fas fa-calendar-alt me-2"></i>{{ formatDate(note.created_at) }}
      </small>
    </div>
    
    <!-- Modals -->
    
    <SimpleModal 
      v-if="showTagModal"
      :show="showTagModal"
      :title="`Gérer les tags : ${note.title}`"
      icon="fas fa-tags"
      size="lg"
      @close="showTagModal = false"
    >
      <TagSelector 
        :noteId="note.note_id"
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
        :noteId="note.note_id"
        :currentProjectId="note.project_id"
        @update:modelValue="handleProjectUpdate"
      />
    </SimpleModal>
  </div>
</template>

<script>
import { stripHtmlAndTruncate } from '../utils/textUtils'
import SimpleModal from './SimpleModal.vue'
import TagSelector from './TagSelector.vue'
import ProjectSelector from './ProjectSelector.vue'

export default {
  name: 'NoteCard',
  components: {
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
      this.$emit('tags-updated', this.note.note_id, tags)
    },

    handleProjectUpdate(projectId) {
      // Émettre un événement pour notifier le parent des changements de projet
      this.$emit('project-updated', this.note.note_id, projectId)
    },

  }
}
</script>

<style scoped>
/* Aucun CSS personnalisé - 100% Bootstrap */
</style>