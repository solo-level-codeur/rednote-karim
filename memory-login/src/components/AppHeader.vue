<template>
  <header class="bg-white border-bottom px-4 py-3 shadow-sm">
    <div class="d-flex justify-content-between align-items-center">
      <div class="d-flex align-items-center">
        <h1 class="h4 mb-0 fw-bold text-primary">
          <span class="me-2">👋</span>
          {{ greeting }}
        </h1>
        <small v-if="subtitle" class="text-muted ms-3">{{ subtitle }}</small>
      </div>
      <button 
        v-if="showLogout" 
        @click="$emit('logout')" 
        class="btn btn-outline-danger btn-sm"
      >
        <i class="fas fa-sign-out-alt me-2"></i>
        Déconnexion
      </button>
    </div>
  </header>
</template>

<script>
export default {
  name: 'AppHeader',
  props: {
    greeting: {
      type: String,
      default: 'Memory'
    },
    subtitle: {
      type: String,
      default: null
    },
    showLogout: {
      type: Boolean,
      default: false
    }
  },
  emits: ['logout']
}
</script>