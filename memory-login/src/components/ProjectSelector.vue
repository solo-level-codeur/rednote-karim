<template>
  <div class="project-selector">
    <label class="form-label">
      <i class="fa fa-folder me-2"></i>
      Projet
    </label>
    <select 
      v-model="selectedProject" 
      @change="handleProjectChange"
      class="form-select"
      :disabled="loading || !canSelectProject"
    >
      <option value="">Sélectionner un projet...</option>
      <option 
        v-for="project in projects" 
        :key="project.project_id" 
        :value="project.project_id"
      >
        {{ project.project_name }}
      </option>
    </select>
    <small v-if="!canSelectProject" class="text-muted">
      Vous n'avez pas les droits pour assigner cette note à un projet
    </small>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { projectsAPI } from '../services/api'
import { authStore } from '../stores/auth'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: null
  },
  userRole: {
    type: String,
    default: 'Developer'
  }
})

const emit = defineEmits(['update:modelValue'])

const projects = ref([])
const loading = ref(false)
const selectedProject = ref(props.modelValue)

// Permissions basées sur le rôle utilisateur
const canSelectProject = computed(() => {
  const role = props.userRole || authStore.state.user?.role || 'Developer'
  return ['Admin', 'Manager', 'Developer'].includes(role)
})

const handleProjectChange = () => {
  emit('update:modelValue', selectedProject.value)
}

const loadProjects = async () => {
  if (!canSelectProject.value) return
  
  loading.value = true
  try {
    const response = await projectsAPI.getAllProjects()
    projects.value = response.data || []
  } catch (error) {
    console.error('Erreur lors du chargement des projets:', error)
  } finally {
    loading.value = false
  }
}

onMounted(loadProjects)
</script>

<style scoped>
.project-selector {
  margin-bottom: 1rem;
}

.form-label {
  font-weight: 500;
  margin-bottom: 0.5rem;
  display: block;
  color: #495057;
}

.form-select {
  width: 100%;
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

.form-select:disabled {
  background-color: #e9ecef;
  opacity: 1;
}

.text-muted {
  color: #6c757d;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  display: block;
}
</style>