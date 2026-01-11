<!--
  DashboardStats.vue
  
  📊 DASHBOARD STATS COMPONENT
  Responsabilité: Cartes de statistiques des notes
  
  Props:
  - totalNotes: Number - Nombre total de notes
  - todayNotes: Number - Notes créées aujourd'hui
  - weekNotes: Number - Notes de la semaine
-->
<template>
  <div class="container-fluid px-5 mt-4">
    <div class="row g-3">
      <div class="col-md-4">
        <div class="card h-100 border-0 shadow-sm">
          <div class="card-body d-flex align-items-center">
            <div class="me-3 fs-1">📝</div>
            <div>
              <div class="h4 mb-1 fw-bold">{{ totalNotes }}</div>
              <div class="text-muted small">Notes totales</div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="col-md-4">
        <div class="card h-100 border-0 shadow-sm">
          <div class="card-body d-flex align-items-center">
            <div class="me-3 fs-1">✨</div>
            <div>
              <div class="h4 mb-1 fw-bold">{{ todayNotes }}</div>
              <div class="text-muted small">Aujourd'hui</div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="col-md-4">
        <div class="card h-100 border-0 shadow-sm">
          <div class="card-body d-flex align-items-center">
            <div class="me-3 fs-1">🎯</div>
            <div>
              <div class="h4 mb-1 fw-bold">{{ weekNotes }}</div>
              <div class="text-muted small">Cette semaine</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DashboardStats',
  props: {
    totalNotes: {
      type: Number,
      default: 0
    },
    todayNotes: {
      type: Number,
      default: 0
    },
    weekNotes: {
      type: Number,
      default: 0
    }
  }
}
</script>

<style scoped>
/* Aucun CSS personnalisé - 100% Bootstrap */
</style>