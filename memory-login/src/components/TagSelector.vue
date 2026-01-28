<template>
  <div class="mb-3">
    <label class="form-label fw-medium text-secondary">Tags</label>
    
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
        <option value="">Sélectionner...</option>
        <option 
          v-for="tag in availableTags" 
          :key="tag.id" 
          :value="tag.id"
        >
          {{ tag.name }}
        </option>
      </select>
      
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