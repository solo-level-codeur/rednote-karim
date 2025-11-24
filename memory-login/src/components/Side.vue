<template>
  <aside class="memory-sidebar d-flex flex-column position-fixed h-100" 
         style="left: 0; top: 0;">
    
    <!-- Logo Header -->
    <div class="p-3 theme-border border-bottom">
      <div class="d-flex align-items-center">
        <div class="bg-success rounded-2 d-flex align-items-center justify-content-center me-2" 
             style="width: 32px; height: 32px; font-size: 1.2rem;">
          📦
        </div>
        <span class="fw-bold theme-text-primary fs-5">Memory</span>
      </div>
    </div>
    
    <!-- Menu Navigation -->
    <nav class="flex-grow-1 py-3">
      <ul class="nav nav-pills flex-column">
        
        <li class="nav-item">
          <router-link 
            to="/dashboard" 
            class="nav-link d-flex align-items-center text-decoration-none"
            :class="{ 'active': $route.name === 'dashboard' }">
            <span class="me-3 fs-5">🏠</span>
            <span class="fw-medium">Dashboard</span>
          </router-link>
        </li>
        
        <li class="nav-item">
          <router-link 
            to="/notes" 
            class="nav-link d-flex align-items-center text-decoration-none"
            :class="{ 'active': $route.name === 'notes' }">
            <span class="me-3 fs-5">📝</span>
            <span class="fw-medium">Éditeur de Notes</span>
          </router-link>
        </li>
        
        <li class="nav-item">
          <span class="nav-link d-flex align-items-center theme-text-secondary">
            <span class="me-3 fs-5">✅</span>
            <span class="fw-medium">Tasks</span>
          </span>
        </li>
        
        <li class="nav-item">
          <router-link 
            to="/projects" 
            class="nav-link d-flex align-items-center text-decoration-none"
            :class="{ 'active': $route.name === 'projects' }">
            <span class="me-3 fs-5">📁</span>
            <span class="fw-medium">Projects</span>
          </router-link>
        </li>
        
        <li class="nav-item">
          <router-link 
            to="/profile" 
            class="nav-link d-flex align-items-center text-decoration-none"
            :class="{ 'active': $route.name === 'profile' }">
            <span class="me-3 fs-5">👤</span>
            <span class="fw-medium">Profil</span>
          </router-link>
        </li>
        
        <li class="nav-item">
          <span class="nav-link d-flex align-items-center theme-text-secondary">
            <span class="me-3 fs-5">👥</span>
            <span class="fw-medium">Contributors</span>
          </span>
        </li>
        
      </ul>
    </nav>
  </aside>
</template>

<script>
export default {
  name: 'Sidebar'
}
</script>

<style scoped>
/* Bootstrap override pour router-link actif */
.nav-link:not(.active):hover {
  background-color: #f8f9fa !important;
  color: #495057 !important;
}

.nav-link {
  border-radius: 0.375rem;
  margin: 0.125rem 0.5rem;
  padding: 0.75rem 1rem;
  color: #6c757d;
  transition: all 0.15s ease-in-out;
}

.nav-link.active {
  background-color: #0d6efd !important;
  color: white !important;
}
</style>