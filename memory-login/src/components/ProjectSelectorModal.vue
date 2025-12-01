<template>
  <div class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="fas fa-folder"></i> Assigner à un projet : {{ noteTitle }}
          </h5>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </div>
        
        <div class="modal-body">
          <ProjectSelector 
            v-model="selectedProject"
            @update:modelValue="handleProjectUpdate"
          />
          <div class="mt-3">
            <small class="text-muted">
              <i class="fas fa-info-circle me-1"></i>
              Cette note sera associée au projet sélectionné et apparaîtra dans la section du projet.
            </small>
          </div>
        </div>
        
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="$emit('close')">
            Annuler
          </button>
          <button 
            type="button" 
            class="btn btn-primary" 
            @click="saveProjectAssignment"
            :disabled="!hasChanged"
          >
            Confirmer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ProjectSelector from './ProjectSelector.vue'
import { projectsAPI } from '@/services/api'

export default {
  name: 'ProjectSelectorModal',
  components: {
    ProjectSelector
  },
  props: {
    noteId: {
      type: [String, Number],
      required: true
    },
    noteTitle: {
      type: String,
      default: 'Note'
    },
    currentProjectId: {
      type: [String, Number],
      default: null
    }
  },
  data() {
    return {
      selectedProject: this.currentProjectId
    }
  },
  computed: {
    hasChanged() {
      return this.selectedProject !== this.currentProjectId
    }
  },
  methods: {
    handleProjectUpdate(projectId) {
      this.selectedProject = projectId
    },

    async saveProjectAssignment() {
      try {
        if (this.selectedProject) {
          await projectsAPI.assignNoteToProject(this.noteId, this.selectedProject)
          this.$toast?.success('Note assignée au projet avec succès')
        } else {
          await projectsAPI.removeNoteFromProject(this.noteId)
          this.$toast?.success('Note retirée du projet avec succès')
        }
        
        this.$emit('project-updated', this.selectedProject)
        this.$emit('close')
      } catch (error) {
        console.error('Erreur lors de l\'assignment du projet:', error)
        this.$toast?.error('Erreur lors de l\'assignment du projet')
      }
    }
  }
}
</script>

<style scoped>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1055;
}
</style>