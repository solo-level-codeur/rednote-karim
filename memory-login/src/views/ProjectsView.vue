<template>
  <div class="d-flex min-vh-100">
    <Sidebar />
    
    <main class="flex-grow-1 bg-light" style="margin-left: 250px;">
      <div class="container-fluid p-4">
        <div class="bg-white p-4 rounded shadow-sm">
          <h1 class="text-primary mb-4">Mes Projets</h1>
          <ProjectManager />
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import Sidebar from '@/components/Sidebar.vue'
import ProjectManager from '@/components/ProjectManager.vue'

export default {
  name: 'ProjectsView',
  components: {
    Sidebar,
    ProjectManager
  }
}
</script>

<style scoped>
@media (max-width: 768px) {
  main {
    margin-left: 0 !important;
  }
}
</style>