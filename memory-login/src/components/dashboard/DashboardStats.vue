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
  <div class="stats-cards">
    <div class="stat-card">
      <div class="stat-icon">📝</div>
      <div class="stat-info">
        <div class="stat-number">{{ totalNotes }}</div>
        <div class="stat-label">Notes totales</div>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon">✨</div>
      <div class="stat-info">
        <div class="stat-number">{{ todayNotes }}</div>
        <div class="stat-label">Aujourd'hui</div>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon">🎯</div>
      <div class="stat-info">
        <div class="stat-number">{{ weekNotes }}</div>
        <div class="stat-label">Cette semaine</div>
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
.stats-cards {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.stat-card {
  background: white;
  border: 1px solid #ddd;
  padding: 1rem;
  flex: 1;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  font-size: 2rem;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.9rem;
  color: #666;
}

@media (max-width: 768px) {
  .stats-cards {
    flex-direction: column;
  }
  
  .stat-card {
    justify-content: center;
  }
}
</style>