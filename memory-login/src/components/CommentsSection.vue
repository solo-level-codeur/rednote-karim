<template>
  <div class="comments-section">
    <div class="comments-header d-flex justify-content-between align-items-center mb-3">
      <h6 class="mb-0">
        <i class="fas fa-comments"></i> 
        Commentaires ({{ comments.length }})
      </h6>
      <button 
        class="btn btn-sm btn-outline-primary"
        @click="showAddForm = !showAddForm"
      >
        <i class="fas fa-plus"></i> Ajouter
      </button>
    </div>

    <!-- Formulaire d'ajout de commentaire -->
    <div v-if="showAddForm" class="add-comment-form mb-3">
      <form @submit.prevent="handleAddComment">
        <div class="mb-3">
          <textarea 
            class="form-control" 
            v-model="newComment"
            rows="3"
            placeholder="Écrivez votre commentaire..."
            required
          ></textarea>
        </div>
        <div class="d-flex justify-content-end">
          <button type="button" class="btn btn-sm btn-secondary me-2" @click="cancelAdd">
            Annuler
          </button>
          <button type="submit" class="btn btn-sm btn-primary" :disabled="!newComment.trim()">
            <i class="fas fa-paper-plane"></i> Publier
          </button>
        </div>
      </form>
    </div>

    <!-- Liste des commentaires -->
    <div class="comments-list">
      <div v-if="loading" class="text-center py-3">
        <div class="spinner-border spinner-border-sm text-primary" role="status">
          <span class="visually-hidden">Chargement...</span>
        </div>
      </div>

      <div v-else-if="comments.length === 0" class="text-center py-3">
        <i class="fas fa-comment fa-2x text-muted mb-2"></i>
        <p class="text-muted mb-0 small">Aucun commentaire pour le moment</p>
      </div>

      <div v-else>
        <div 
          v-for="comment in comments" 
          :key="comment.comment_id"
          class="comment-item mb-3"
        >
          <div class="d-flex">
            <div class="comment-avatar me-3">
              <div class="avatar-circle">
                {{ getInitials(comment.firstname, comment.lastname) }}
              </div>
            </div>
            
            <div class="comment-content flex-grow-1">
              <div class="comment-header d-flex justify-content-between align-items-start">
                <div>
                  <strong class="comment-author">
                    {{ comment.firstname }} {{ comment.lastname }}
                  </strong>
                  <small class="text-muted ms-2">
                    {{ formatDate(comment.created_at) }}
                  </small>
                  <small v-if="comment.updated_at && comment.updated_at !== comment.created_at" class="text-muted ms-1">
                    (modifié)
                  </small>
                </div>
                
                <div class="comment-actions" v-if="canEditComment(comment)">
                  <div class="dropdown">
                    <button 
                      class="btn btn-sm btn-link text-muted dropdown-toggle" 
                      type="button" 
                      data-bs-toggle="dropdown"
                    >
                      <i class="fas fa-ellipsis-v"></i>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end">
                      <li>
                        <a class="dropdown-item" href="#" @click="editComment(comment)">
                          <i class="fas fa-edit"></i> Modifier
                        </a>
                      </li>
                      <li>
                        <a class="dropdown-item text-danger" href="#" @click="deleteComment(comment.comment_id)">
                          <i class="fas fa-trash"></i> Supprimer
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <!-- Contenu du commentaire -->
              <div v-if="editingComment?.comment_id !== comment.comment_id" class="comment-text mt-2">
                {{ comment.comment_text }}
              </div>
              
              <!-- Formulaire d'édition -->
              <div v-else class="comment-edit-form mt-2">
                <form @submit.prevent="handleUpdateComment">
                  <textarea 
                    class="form-control mb-2" 
                    v-model="editingContent"
                    rows="3"
                    required
                  ></textarea>
                  <div class="d-flex justify-content-end">
                    <button type="button" class="btn btn-sm btn-secondary me-2" @click="cancelEdit">
                      Annuler
                    </button>
                    <button type="submit" class="btn btn-sm btn-primary" :disabled="!editingContent.trim()">
                      <i class="fas fa-save"></i> Sauvegarder
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { commentsAPI } from '@/services/api'

export default {
  name: 'CommentsSection',
  props: {
    noteId: {
      type: [String, Number],
      required: true
    },
    currentUserId: {
      type: [String, Number],
      required: true
    }
  },
  data() {
    return {
      comments: [],
      loading: false,
      showAddForm: false,
      newComment: '',
      editingComment: null,
      editingContent: ''
    }
  },
  mounted() {
    this.loadComments()
  },
  watch: {
    noteId() {
      this.loadComments()
    }
  },
  methods: {
    async loadComments() {
      this.loading = true
      try {
        const response = await commentsAPI.getComments(this.noteId)
        this.comments = response.data.comments || []
      } catch (error) {
        console.error('Erreur lors du chargement des commentaires:', error)
        
        // Si l'erreur est 403, c'est que l'utilisateur n'a pas accès
        if (error.response?.status !== 403) {
          this.$toast.error('Erreur lors du chargement des commentaires')
        }
      } finally {
        this.loading = false
      }
    },

    async handleAddComment() {
      try {
        const response = await commentsAPI.createComment(this.noteId, {
          content: this.newComment.trim()
        })
        
        this.comments.push(response.data.comment)
        this.$toast.success('Commentaire ajouté avec succès')
        this.cancelAdd()
      } catch (error) {
        console.error('Erreur lors de la création du commentaire:', error)
        
        if (error.response?.status === 403) {
          this.$toast.error('Vous n\'êtes pas autorisé à commenter cette note')
        } else {
          this.$toast.error('Erreur lors de la création du commentaire')
        }
      }
    },

    editComment(comment) {
      this.editingComment = comment
      this.editingContent = comment.comment_text
    },

    async handleUpdateComment() {
      try {
        const response = await commentsAPI.updateComment(this.editingComment.comment_id, {
          content: this.editingContent.trim()
        })
        
        // Mettre à jour le commentaire localement
        const index = this.comments.findIndex(c => c.comment_id === this.editingComment.comment_id)
        if (index !== -1) {
          this.comments[index] = response.data.comment
        }
        
        this.$toast.success('Commentaire modifié avec succès')
        this.cancelEdit()
      } catch (error) {
        console.error('Erreur lors de la modification du commentaire:', error)
        this.$toast.error('Erreur lors de la modification du commentaire')
      }
    },

    async deleteComment(commentId) {
      if (confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) {
        try {
          await commentsAPI.deleteComment(commentId)
          this.comments = this.comments.filter(c => c.comment_id !== commentId)
          this.$toast.success('Commentaire supprimé avec succès')
        } catch (error) {
          console.error('Erreur lors de la suppression du commentaire:', error)
          this.$toast.error('Erreur lors de la suppression du commentaire')
        }
      }
    },

    cancelAdd() {
      this.showAddForm = false
      this.newComment = ''
    },

    cancelEdit() {
      this.editingComment = null
      this.editingContent = ''
    },

    canEditComment(comment) {
      // L'utilisateur peut modifier/supprimer ses propres commentaires
      return comment.user_id === this.currentUserId
    },

    getInitials(firstname, lastname) {
      return `${firstname?.charAt(0) || ''}${lastname?.charAt(0) || ''}`.toUpperCase()
    },

    formatDate(dateString) {
      const date = new Date(dateString)
      const now = new Date()
      const diffInMinutes = Math.floor((now - date) / 60000)

      if (diffInMinutes < 1) return 'À l\'instant'
      if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`
      if (diffInMinutes < 1440) return `Il y a ${Math.floor(diffInMinutes / 60)} h`
      
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }
}
</script>

<style scoped>
.comments-section {
  border-top: 1px solid #dee2e6;
  padding-top: 1rem;
  margin-top: 1rem;
}

.add-comment-form {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 0.375rem;
  border: 1px solid #dee2e6;
}

.comment-item {
  padding: 0.75rem;
  border-radius: 0.375rem;
  background-color: #f8f9fa;
  transition: all 0.2s;
}

.comment-item:hover {
  background-color: #e9ecef;
}

.avatar-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #007bff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.875rem;
}

.comment-author {
  font-size: 0.875rem;
}

.comment-text {
  font-size: 0.875rem;
  line-height: 1.4;
  white-space: pre-wrap;
}

.comment-actions .dropdown-toggle::after {
  display: none;
}

.comment-edit-form textarea {
  font-size: 0.875rem;
}
</style>