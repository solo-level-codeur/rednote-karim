<template>
  <div class="tag-selector">
    <label class="form-label">
      <i class="fa fa-tags me-2"></i>
      Tags
    </label>
    
    <!-- Tags sélectionnés -->
    <div class="selected-tags mb-2" v-if="selectedTags.length > 0">
      <span 
        v-for="tag in selectedTags" 
        :key="tag.id"
        class="badge tag-badge me-1"
        :style="{ backgroundColor: tag.color }"
      >
        {{ tag.name }}
        <button 
          @click="removeTag(tag.id)"
          class="btn-close-tag ms-1"
          type="button"
        >
          ×
        </button>
      </span>
    </div>

    <!-- Sélecteur de tags -->
    <div class="tag-input-group">
      <select 
        v-model="selectedTagId" 
        @change="addTag"
        class="form-select"
        :disabled="loading"
      >
        <option value="">Ajouter un tag...</option>
        <option 
          v-for="tag in availableTags" 
          :key="tag.id" 
          :value="tag.id"
        >
          {{ tag.name }}
        </option>
      </select>
      
      <button 
        @click="showCreateTag = true"
        class="btn btn-outline-primary btn-sm ms-2"
        type="button"
      >
        <i class="fa fa-plus"></i>
      </button>
    </div>

    <!-- Modal création de tag -->
    <div v-if="showCreateTag" class="create-tag-modal">
      <div class="modal-backdrop" @click="showCreateTag = false"></div>
      <div class="modal-content">
        <h6>Créer un nouveau tag</h6>
        <input 
          v-model="newTagName"
          class="form-control mb-2"
          placeholder="Nom du tag"
          @keyup.enter="createTag"
        >
        <input 
          v-model="newTagColor"
          type="color"
          class="form-control mb-3"
          value="#007bff"
        >
        <div class="modal-actions">
          <button @click="createTag" class="btn btn-primary btn-sm">Créer</button>
          <button @click="showCreateTag = false" class="btn btn-secondary btn-sm ms-2">Annuler</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { tagsAPI } from '../services/api'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  noteId: {
    type: [String, Number],
    default: null
  }
})

const emit = defineEmits(['update:modelValue'])

const allTags = ref([])
const selectedTags = ref([...props.modelValue])
const selectedTagId = ref('')
const loading = ref(false)
const showCreateTag = ref(false)
const newTagName = ref('')
const newTagColor = ref('#007bff')

// Tags disponibles (non encore sélectionnés)
const availableTags = computed(() => {
  const selectedIds = selectedTags.value.map(tag => tag.id)
  return allTags.value.filter(tag => !selectedIds.includes(tag.id))
})

const addTag = async () => {
  if (!selectedTagId.value) return
  
  const tag = allTags.value.find(t => t.id == selectedTagId.value)
  if (tag && !selectedTags.value.find(t => t.id === tag.id)) {
    selectedTags.value.push(tag)
    
    // Si on a un noteId, associer directement le tag à la note
    if (props.noteId) {
      try {
        await tagsAPI.addTagToNote(props.noteId, tag.id)
      } catch (error) {
        console.error('Erreur lors de l\'ajout du tag:', error)
      }
    }
    
    emit('update:modelValue', selectedTags.value)
    selectedTagId.value = ''
  }
}

const removeTag = async (tagId) => {
  selectedTags.value = selectedTags.value.filter(tag => tag.id !== tagId)
  
  // Si on a un noteId, retirer le tag de la note
  if (props.noteId) {
    try {
      await tagsAPI.removeTagFromNote(props.noteId, tagId)
    } catch (error) {
      console.error('Erreur lors de la suppression du tag:', error)
    }
  }
  
  emit('update:modelValue', selectedTags.value)
}

const createTag = async () => {
  if (!newTagName.value.trim()) return
  
  try {
    const response = await tagsAPI.createTag({
      name: newTagName.value.trim(),
      color: newTagColor.value
    })
    
    const newTag = response.data
    allTags.value.push(newTag)
    
    // Ajouter automatiquement le nouveau tag
    selectedTags.value.push(newTag)
    
    if (props.noteId) {
      await tagsAPI.addTagToNote(props.noteId, newTag.id)
    }
    
    emit('update:modelValue', selectedTags.value)
    
    // Reset
    newTagName.value = ''
    newTagColor.value = '#007bff'
    showCreateTag.value = false
    
  } catch (error) {
    console.error('Erreur lors de la création du tag:', error)
  }
}

const loadTags = async () => {
  loading.value = true
  try {
    const response = await tagsAPI.getAllTags()
    allTags.value = response.data || []
  } catch (error) {
    console.error('Erreur lors du chargement des tags:', error)
  } finally {
    loading.value = false
  }
}

const loadNoteTags = async () => {
  if (!props.noteId) return
  
  try {
    const response = await tagsAPI.getNoteTags(props.noteId)
    selectedTags.value = response.data || []
    emit('update:modelValue', selectedTags.value)
  } catch (error) {
    console.error('Erreur lors du chargement des tags de la note:', error)
  }
}

onMounted(() => {
  loadTags()
  if (props.noteId) {
    loadNoteTags()
  }
})
</script>

<style scoped>
.tag-selector {
  margin-bottom: 1rem;
}

.form-label {
  font-weight: 500;
  margin-bottom: 0.5rem;
  display: block;
  color: #495057;
}

.selected-tags {
  min-height: 2rem;
}

.tag-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  border-radius: 0.375rem;
  color: white;
  margin: 0.125rem;
}

.btn-close-tag {
  background: none;
  border: none;
  color: white;
  padding: 0;
  margin-left: 0.25rem;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
}

.btn-close-tag:hover {
  opacity: 0.8;
}

.tag-input-group {
  display: flex;
  align-items: center;
}

.form-select {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 0.375rem;
  background-color: #fff;
  transition: border-color 0.15s ease-in-out;
}

.form-select:focus {
  border-color: #80bdff;
  outline: none;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.create-tag-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1050;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-content {
  position: relative;
  background: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  min-width: 300px;
}

.modal-content h6 {
  margin-bottom: 1rem;
  font-weight: 600;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
}

.btn {
  padding: 0.375rem 0.75rem;
  border: 1px solid transparent;
  border-radius: 0.375rem;
  text-decoration: none;
  cursor: pointer;
  font-size: 0.875rem;
}

.btn-primary {
  background-color: #007bff;
  border-color: #007bff;
  color: white;
}

.btn-secondary {
  background-color: #6c757d;
  border-color: #6c757d;
  color: white;
}

.btn-outline-primary {
  border-color: #007bff;
  color: #007bff;
  background-color: transparent;
}

.btn-outline-primary:hover {
  background-color: #007bff;
  color: white;
}

.form-control {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 0.375rem;
  background-color: #fff;
}

.form-control:focus {
  border-color: #80bdff;
  outline: none;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}
</style>