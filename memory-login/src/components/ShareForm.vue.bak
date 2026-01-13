<template>
  <div class="share-form">
    <!-- Formulaire de partage -->
    <div class="mb-4">
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
    <div v-if="existingShares.length > 0">
      <hr>
      <h6 class="mb-3">Partages actuels</h6>
      <div class="table-responsive">
        <table class="table table-sm">
          <thead>
            <tr>
              <th>Utilisateur</th>
              <th>Permission</th>
              <th>Partagé le</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="share in existingShares" :key="share.id">
              <td>{{ share.shared_with_email }}</td>
              <td>
                <span class="badge" :class="getPermissionBadgeClass(share.permission)">
                  {{ getPermissionLabel(share.permission) }}
                </span>
              </td>
              <td>{{ formatDate(share.shared_date) }}</td>
              <td>
                <button 
                  @click="removeShare(share.id)"
                  class="btn btn-outline-danger btn-sm"
                  title="Révoquer"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="loading" class="text-center py-3">
      <div class="spinner-border spinner-border-sm"></div>
    </div>
  </div>
</template>

<script>
import { shareAPI } from '../services/api'

export default {
  name: 'ShareForm',
  props: {
    noteId: {
      type: [Number, String],
      required: true
    }
  },
  data() {
    return {
      shareForm: {
        userEmail: '',
        permission: 'read'
      },
      existingShares: [],
      loading: false
    }
  },
  async mounted() {
    await this.loadExistingShares()
  },
  methods: {
    async loadExistingShares() {
      this.loading = true
      try {
        const response = await shareAPI.getNoteShares(this.noteId)
        this.existingShares = response.data.shares || []
      } catch (error) {
        console.error('Erreur lors du chargement des partages:', error)
      } finally {
        this.loading = false
      }
    },

    async handleShare() {
      if (!this.shareForm.userEmail) return
      
      try {
        await shareAPI.shareNote({
          note_id: this.noteId,
          user_email: this.shareForm.userEmail,
          permission: this.shareForm.permission
        })
        
        this.shareForm.userEmail = ''
        this.shareForm.permission = 'read'
        await this.loadExistingShares()
        
        this.$emit('shared')
      } catch (error) {
        console.error('Erreur lors du partage:', error)
        alert('Erreur lors du partage de la note')
      }
    },

    async removeShare(shareId) {
      if (!confirm('Révoquer ce partage ?')) return
      
      try {
        await shareAPI.removeShare(shareId)
        await this.loadExistingShares()
        this.$emit('share-removed')
      } catch (error) {
        console.error('Erreur lors de la révocation:', error)
        alert('Erreur lors de la révocation du partage')
      }
    },

    getPermissionBadgeClass(permission) {
      return permission === 'write' ? 'bg-success' : 'bg-info'
    },

    getPermissionLabel(permission) {
      return permission === 'write' ? 'Lecture + Écriture' : 'Lecture seule'
    },

    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString('fr-FR')
    }
  },
  emits: ['shared', 'share-removed']
}
</script>