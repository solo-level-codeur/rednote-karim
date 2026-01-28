<template>
  <div class="tag-manager">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2><i class="fas fa-tags"></i> Mes Tags</h2>
      <button 
        class="btn btn-primary btn-sm" 
        @click="showCreateModal = true"
      >
        <i class="fas fa-plus"></i> Nouveau Tag
      </button>
    </div>

    <!-- Liste des tags -->
    <div class="row">
      <div class="col-md-6 col-lg-4 mb-3" v-for="tag in tags" :key="tag.id">
        <div class="card tag-card">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div class="d-flex align-items-center">
                <h6 class="card-title mb-0">{{ tag.name }}</h6>
              </div>
              
              <div class="dropdown">
                <button 
                  class="btn btn-sm btn-outline-secondary dropdown-toggle" 
                  type="button" 
                  data-bs-toggle="dropdown"
                >
                  <i class="fas fa-ellipsis-v"></i>
                </button>
                <ul class="dropdown-menu">
                  <li>
                    <a class="dropdown-item" href="#" @click="editTag(tag)">
                      <i class="fas fa-edit"></i> Modifier
                    </a>
                  </li>
                  <li><hr class="dropdown-divider"></li>
                  <li>
                    <a class="dropdown-item text-danger" href="#" @click="deleteTag(tag.id)">
                      <i class="fas fa-trash"></i> Supprimer
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Message si pas de tags -->
    <div v-if="tags.length === 0 && !loading" class="text-center py-5">
      <i class="fas fa-tags fa-3x text-muted mb-3"></i>
      <h4 class="text-muted">Aucun tag trouvé</h4>
      <p class="text-muted">Créez vos premiers tags pour organiser vos notes</p>
    </div>

    <!-- Modal de création/édition -->
    <TagModal 
      v-if="showCreateModal || editingTag"
      :tag="editingTag"
      @save="handleSaveTag"
      @cancel="handleCancelTag"
    />


    <!-- Loading -->
    <div v-if="loading" class="text-center py-4">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Chargement...</span>
      </div>
    </div>
  </div>
</template>

<script>
import { tagsAPI } from '@/services/api'
import TagModal from './TagModal.vue'

export default {
  name: 'TagManager',
  components: {
    TagModal
  },
  data() {
    return {
      tags: [],
      loading: false,
      showCreateModal: false,
      editingTag: null
    }
  },
  mounted() {
    this.loadTags()
  },
  methods: {
    async loadTags() {
      this.loading = true
      try {
        const response = await tagsAPI.getAllTags()
        this.tags = response.data
      } catch (error) {
        console.error('Erreur lors du chargement des tags:', error)
        console.error('Erreur lors du chargement des tags:', error)
      } finally {
        this.loading = false
      }
    },

    editTag(tag) {
      this.editingTag = { ...tag }
    },

    async deleteTag(tagId) {
      if (confirm('Êtes-vous sûr de vouloir supprimer ce tag ?')) {
        try {
          await tagsAPI.deleteTag(tagId)
          this.tags = this.tags.filter(t => t.id !== tagId)
          console.log('Tag supprimé avec succès')
        } catch (error) {
          console.error('Erreur lors de la suppression:', error)
          console.error('Erreur lors de la suppression du tag:', error)
        }
      }
    },

    async handleSaveTag(tagData) {
      try {
        if (this.editingTag) {
          // Modification
          await tagsAPI.updateTag(this.editingTag.id, tagData)
          const index = this.tags.findIndex(t => t.id === this.editingTag.id)
          if (index !== -1) {
            this.tags[index] = { ...this.tags[index], ...tagData }
          }
          console.log('Tag modifié avec succès')
        } else {
          // Création
          const response = await tagsAPI.createTag(tagData)
          this.tags.unshift({
            ...tagData,
            id: response.data.id,
            created_at: new Date().toISOString()
          })
          console.log('Tag créé avec succès')
        }
      } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error)
        console.error('Erreur lors de la sauvegarde du tag:', error)
      }
      this.handleCancelTag()
    },

    handleCancelTag() {
      this.showCreateModal = false
      this.editingTag = null
    },

    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString('fr-FR')
    }
  }
}
</script>

<style scoped>
.dropdown-toggle::after {
  display: none;
}
</style>