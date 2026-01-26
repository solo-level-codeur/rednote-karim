<template>
  <div class="mb-3">
    <label class="form-label fw-medium text-secondary">
      <i class="fa fa-tags me-2"></i>
      Tags
    </label>
    
    <!-- Tags sélectionnés -->
    <div class="mb-2" style="min-height: 2rem;" v-if="selectedTags.length > 0">
      <span 
        v-for="tag in selectedTags" 
        :key="tag.id"
        class="badge d-inline-flex align-items-center text-white me-1" style="padding: 0.25rem 0.5rem; font-size: 0.75rem; border-radius: 0.375rem; margin: 0.125rem;"
        :style="{ backgroundColor: tag.color }"
      >
        {{ tag.name }}
        <button 
          @click="removeTag(tag.id)"
          class="btn-close btn-close-white ms-1" style="font-size: 1rem; padding: 0;"
          type="button"
        >
          ×
        </button>
      </span>
    </div>

    <!-- Sélecteur de tags -->
    <div class="d-flex align-items-center">
      <select 
        v-model="selectedTagId" 
        @change="addTag"
        class="form-select flex-fill"
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
    <div v-if="showCreateTag" class="position-fixed top-0 start-0 end-0 bottom-0 d-flex align-items-center justify-content-center" style="z-index: 1050;">
      <div class="position-absolute top-0 start-0 end-0 bottom-0 bg-dark bg-opacity-50" @click="showCreateTag = false"></div>
      <div class="position-relative bg-white p-4 rounded shadow" style="min-width: 300px;">
        <h6 class="mb-3 fw-semibold">Créer un nouveau tag</h6>
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
        <div class="d-flex justify-content-end">
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
/* Tout est maintenant géré par Bootstrap */
</style>