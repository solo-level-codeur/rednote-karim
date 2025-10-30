<template>
  <div class="card" @click="$emit('click', project)">
    <div class="card-content">
      <h3 class="title is-5">{{ project.name }}</h3>
      <p class="content">{{ project.description || 'Aucune description' }}</p>
      <p class="has-text-grey">
        Propriétaire: {{ project.owner }}
      </p>
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
.card {
  cursor: pointer;
  margin-bottom: 1rem;
  background-color: white;
  border: 1px solid #dbdbdb;
  border-radius: 0.375rem;
  box-shadow: 0 0.125em 0.25em rgba(10, 10, 10, 0.1);
}

.card:hover {
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
  transform: translateY(-2px);
  transition: all 0.2s ease;
}

.card-content {
  background-color: white;
  color: #363636;
}
</style>