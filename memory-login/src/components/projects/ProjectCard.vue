<template>
  <div class="card h-100" 
       @click="$emit('click', project)"
       style="cursor: pointer;">
    <div class="card-body">
      <div class="d-flex align-items-start mb-3">
        <div class="me-3 text-primary fs-4">
          📁
        </div>
        <div class="flex-grow-1">
          <h5 class="card-title mb-2">{{ project.project_name }}</h5>
          <p class="card-text text-muted mb-3">
            {{ project.description || 'Aucune description' }}
          </p>
        </div>
      </div>
      
    </div>
    
    <div class="card-footer bg-transparent border-0">
      <small class="text-muted">
        <i class="fas fa-user me-2"></i>Propriétaire: {{ project.owner_name || project.owner || 'Inconnu' }}
      </small>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProjectCard',
  props: {
    project: {
      type: Object,
      required: true
    }
  },
  emits: ['click']
}
</script>

<style scoped>
/* Aucun CSS personnalisé - 100% Bootstrap */
</style>