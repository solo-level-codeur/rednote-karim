<template>
  <div class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="fas fa-share-alt"></i> Partager la note : {{ noteTitle }}
          </h5>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </div>
        
        <div class="modal-body">
          <!-- Formulaire de partage -->
          <div class="share-form mb-4">
            <h6 class="mb-3">Partager avec un nouvel utilisateur</h6>
            <form @submit.prevent="handleShare">
              <div class="row">
                <div class="col-md-8">
                  <input 
                    type="email" 
                    class="form-control" 
                    v-model="shareForm.userEmail"
                    placeholder="Email de l'utilisateur..."
                    required
                  >
                </div>
                <div class="col-md-4">
                  <select class="form-select" v-model="shareForm.permission">
                    <option value="read">Lecture seule</option>
                    <option value="write">Lecture + Écriture</option>
                  </select>
                </div>
              </div>
              <div class="mt-3">
                <button type="submit" class="btn btn-primary" :disabled="!shareForm.userEmail">
                  <i class="fas fa-share"></i> Partager
                </button>
              </div>
            </form>
          </div>

          <!-- Liste des partages existants -->
          <div class="existing-shares">
            <h6 class="mb-3">Utilisateurs ayant accès à cette note</h6>
            
            <div v-if="loading" class="text-center py-3">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Chargement...</span>
              </div>
            </div>

            <div v-else-if="shares.length === 0" class="text-center py-3">
              <i class="fas fa-users fa-2x text-muted mb-2"></i>
              <p class="text-muted mb-0">Cette note n'est partagée avec personne</p>
            </div>

            <div v-else class="shares-list">
              <div 
                v-for="share in shares" 
                :key="share.id_users"
                class="card mb-2"
              >
                <div class="card-body py-2">
                  <div class="d-flex justify-content-between align-items-center">
                    <div>
                      <strong>{{ share.firstname }} {{ share.lastname }}</strong>
                      <small class="text-muted d-block">{{ share.email }}</small>
                      <small class="text-muted">
                        Partagé le {{ formatDate(share.shared_at) }}
                      </small>
                    </div>
                    
                    <div class="d-flex align-items-center">
                      <select 
                        class="form-select form-select-sm me-2" 
                        style="width: auto;"
                        :value="share.permission"
                        @change="updatePermission(share.id_users, $event.target.value)"
                      >
                        <option value="read">Lecture</option>
                        <option value="write">Écriture</option>
                      </select>
                      
                      <button 
                        class="btn btn-sm btn-outline-danger"
                        @click="removeShare(share.id_users)"
                        title="Supprimer le partage"
                      >
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="$emit('close')">
            Fermer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { shareAPI } from '@/services/api'

export default {
  name: 'ShareNoteModal',
  props: {
    noteId: {
      type: [String, Number],
      required: true
    },
    noteTitle: {
      type: String,
      default: 'Note'
    }
  },
  data() {
    return {
      shares: [],
      loading: false,
      shareForm: {
        userEmail: '',
        permission: 'read'
      }
    }
  },
  mounted() {
    this.loadShares()
  },
  methods: {
    async loadShares() {
      this.loading = true
      try {
        const response = await shareAPI.getNoteShares(this.noteId)
        this.shares = response.data.shares || []
      } catch (error) {
        console.error('Erreur lors du chargement des partages:', error)
        this.$toast.error('Erreur lors du chargement des partages')
      } finally {
        this.loading = false
      }
    },

    async handleShare() {
      try {
        await shareAPI.shareNote(this.noteId, {
          userEmail: this.shareForm.userEmail,
          permission: this.shareForm.permission
        })
        
        this.$toast.success('Note partagée avec succès')
        
        // Recharger les partages
        await this.loadShares()
        
        // Reset du formulaire
        this.shareForm = {
          userEmail: '',
          permission: 'read'
        }
      } catch (error) {
        console.error('Erreur lors du partage:', error)
        
        if (error.response?.status === 404) {
          this.$toast.error('Utilisateur non trouvé')
        } else if (error.response?.status === 409) {
          this.$toast.error('Note déjà partagée avec cet utilisateur')
        } else {
          this.$toast.error('Erreur lors du partage de la note')
        }
      }
    },

    async updatePermission(userId, newPermission) {
      try {
        await shareAPI.updateSharePermission(this.noteId, userId, {
          permission: newPermission
        })
        
        this.$toast.success('Permissions mises à jour')
        
        // Mettre à jour localement
        const shareIndex = this.shares.findIndex(s => s.id_users === userId)
        if (shareIndex !== -1) {
          this.shares[shareIndex].permission = newPermission
        }
      } catch (error) {
        console.error('Erreur lors de la mise à jour des permissions:', error)
        this.$toast.error('Erreur lors de la mise à jour des permissions')
        
        // Recharger pour revenir à l'état précédent
        this.loadShares()
      }
    },

    async removeShare(userId) {
      if (confirm('Êtes-vous sûr de vouloir supprimer ce partage ?')) {
        try {
          await shareAPI.unshareNote(this.noteId, userId)
          this.$toast.success('Partage supprimé avec succès')
          
          // Supprimer localement
          this.shares = this.shares.filter(s => s.id_users !== userId)
        } catch (error) {
          console.error('Erreur lors de la suppression du partage:', error)
          this.$toast.error('Erreur lors de la suppression du partage')
        }
      }
    },

    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
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

.share-form {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 0.375rem;
  border: 1px solid #dee2e6;
}

.shares-list {
  max-height: 300px;
  overflow-y: auto;
}

.card:hover {
  background-color: #f8f9fa;
}
</style>