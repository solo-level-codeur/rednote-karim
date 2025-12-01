<template>
  <div class="share-selector">
    <label class="form-label">
      <i class="fa fa-share me-2"></i>
      Partager avec
    </label>
    
    <!-- Utilisateurs déjà partagés -->
    <div class="shared-users mb-2" v-if="sharedUsers.length > 0">
      <div 
        v-for="share in sharedUsers" 
        :key="share.id_users"
        class="shared-user-item d-flex align-items-center justify-content-between mb-1"
      >
        <div class="user-info">
          <span class="user-name">{{ share.firstname }} {{ share.lastname }}</span>
          <small class="text-muted ms-1">({{ share.email }})</small>
        </div>
        <div class="share-controls d-flex align-items-center">
          <select 
            v-model="share.permission"
            @change="updateSharePermission(share.id_users, share.permission)"
            class="form-select form-select-sm me-2"
          >
            <option value="read">Lecture</option>
            <option value="write">Écriture</option>
          </select>
          <button 
            @click="removeShare(share.id_users)"
            class="btn btn-outline-danger btn-sm"
            title="Retirer l'accès"
          >
            <i class="fa fa-times"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Ajouter un nouvel utilisateur -->
    <div class="add-share-section">
      <div class="input-group">
        <input 
          v-model="searchEmail"
          @input="searchUsers"
          class="form-control"
          placeholder="Email de l'utilisateur..."
        >
        <select v-model="newPermission" class="form-select" style="max-width: 120px;">
          <option value="read">Lecture</option>
          <option value="write">Écriture</option>
        </select>
        <button 
          @click="addShare"
          class="btn btn-outline-primary"
          :disabled="!searchEmail.trim() || loading"
        >
          <i class="fa fa-plus"></i>
        </button>
      </div>
      
      <!-- Suggestions d'utilisateurs -->
      <div v-if="userSuggestions.length > 0" class="user-suggestions mt-2">
        <div 
          v-for="user in userSuggestions" 
          :key="user.id_users"
          @click="selectUser(user)"
          class="user-suggestion-item"
        >
          <strong>{{ user.firstname }} {{ user.lastname }}</strong>
          <small class="text-muted">{{ user.email }}</small>
        </div>
      </div>
    </div>

    <!-- Message d'info -->
    <small class="text-muted d-block mt-2">
      <i class="fa fa-info-circle me-1"></i>
      Les utilisateurs avec accès "Lecture" peuvent voir la note. "Écriture" permet la modification.
    </small>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { shareAPI } from '../services/api'

const props = defineProps({
  noteId: {
    type: [String, Number],
    required: true
  }
})

const sharedUsers = ref([])
const searchEmail = ref('')
const newPermission = ref('read')
const userSuggestions = ref([])
let searchTimeout = null
const loading = ref(false)

const loadNoteShares = async () => {
  if (!props.noteId) return
  
  try {
    const response = await shareAPI.getNoteShares(props.noteId)
    sharedUsers.value = response.data?.shares || []
  } catch (error) {
    console.error('Erreur lors du chargement des partages:', error)
  }
}

const searchUsers = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  
  searchTimeout = setTimeout(async () => {
    if (searchEmail.value.trim().length < 2) {
      userSuggestions.value = []
      return
    }
    
    try {
      // Note: Il faudrait implémenter cette API dans le backend
      // const response = await api.get(`/users/search?email=${searchEmail.value}`)
      // userSuggestions.value = response.data || []
      
      // Pour l'instant, simulation
      userSuggestions.value = []
    } catch (error) {
      console.error('Erreur lors de la recherche d\'utilisateurs:', error)
      userSuggestions.value = []
    }
  }, 300)
}

const selectUser = (user) => {
  searchEmail.value = user.email
  userSuggestions.value = []
}

const addShare = async () => {
  if (!searchEmail.value.trim()) return
  
  // Vérifier si l'utilisateur n'est pas déjà partagé
  const alreadyShared = sharedUsers.value.find(share => 
    share.email.toLowerCase() === searchEmail.value.trim().toLowerCase()
  )
  
  if (alreadyShared) {
    alert('Cette note est déjà partagée avec cet utilisateur')
    return
  }
  
  loading.value = true
  try {
    await shareAPI.shareNote(props.noteId, {
      userEmail: searchEmail.value.trim(),
      permission: newPermission.value
    })
    
    // Recharger la liste des partages
    await loadNoteShares()
    
    // Reset
    searchEmail.value = ''
    newPermission.value = 'read'
    userSuggestions.value = []
    
  } catch (error) {
    console.error('Erreur lors du partage:', error)
    alert('Erreur lors du partage de la note. Vérifiez que l\'email existe.')
  } finally {
    loading.value = false
  }
}

const updateSharePermission = async (userId, permission) => {
  try {
    await shareAPI.updateSharePermission(props.noteId, userId, { permission })
  } catch (error) {
    console.error('Erreur lors de la mise à jour des permissions:', error)
    // Recharger pour annuler le changement visuel
    await loadNoteShares()
  }
}

const removeShare = async (userId) => {
  if (!confirm('Êtes-vous sûr de vouloir retirer l\'accès à cette note ?')) {
    return
  }
  
  try {
    await shareAPI.unshareNote(props.noteId, userId)
    await loadNoteShares()
  } catch (error) {
    console.error('Erreur lors de la suppression du partage:', error)
  }
}

onMounted(() => {
  if (props.noteId) {
    loadNoteShares()
  }
})
</script>

<style scoped>
.share-selector {
  margin-bottom: 1rem;
}

.form-label {
  font-weight: 500;
  margin-bottom: 0.5rem;
  display: block;
  color: #495057;
}

.shared-user-item {
  background-color: #f8f9fa;
  padding: 0.75rem;
  border-radius: 0.375rem;
  border: 1px solid #dee2e6;
}

.user-name {
  font-weight: 500;
}

.share-controls {
  min-width: 150px;
}

.add-share-section {
  position: relative;
}

.input-group {
  display: flex;
}

.form-control {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 0.375rem 0 0 0.375rem;
  background-color: #fff;
}

.form-select {
  padding: 0.5rem;
  border: 1px solid #ced4da;
  background-color: #fff;
}

.form-select-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.user-suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ced4da;
  border-radius: 0.375rem;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  z-index: 1000;
  max-height: 200px;
  overflow-y: auto;
}

.user-suggestion-item {
  padding: 0.75rem;
  cursor: pointer;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  flex-direction: column;
}

.user-suggestion-item:hover {
  background-color: #f8f9fa;
}

.user-suggestion-item:last-child {
  border-bottom: none;
}

.btn {
  padding: 0.5rem 0.75rem;
  border: 1px solid transparent;
  border-radius: 0.375rem;
  text-decoration: none;
  cursor: pointer;
  font-size: 0.875rem;
}

.btn-outline-primary {
  border-color: #007bff;
  color: #007bff;
  background-color: transparent;
  border-radius: 0 0.375rem 0.375rem 0;
}

.btn-outline-primary:hover {
  background-color: #007bff;
  color: white;
}

.btn-outline-danger {
  border-color: #dc3545;
  color: #dc3545;
  background-color: transparent;
}

.btn-outline-danger:hover {
  background-color: #dc3545;
  color: white;
}

.btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}
</style>