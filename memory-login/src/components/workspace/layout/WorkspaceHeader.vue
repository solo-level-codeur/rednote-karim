<!--
  WorkspaceHeader.vue
  
  🏗️ WORKSPACE LAYOUT COMPONENT
  Responsabilité: En-tête avec titre, recherche et bouton création
  
  Props:
  - searchQuery: String - Valeur de recherche
  
  Events:
  - @update:searchQuery - Mise à jour de la recherche
  - @create-note - Création d'une nouvelle note
-->
<template>
  <header class="workspace-header">
    <div class="header-content">
      <h1 class="workspace-title">Notes</h1>
      
      <div class="header-actions">
        <input 
          :value="searchQuery"
          @input="$emit('update:searchQuery', $event.target.value)"
          type="text" 
          placeholder="Rechercher..."
          class="search-input"
        >
        
        <button class="btn-create-note" @click="$emit('create-note')">
          + Nouvelle Note
        </button>
      </div>
    </div>
  </header>
</template>

<script>
export default {
  name: 'WorkspaceHeader',
  props: {
    searchQuery: {
      type: String,
      default: ''
    }
  },
  emits: ['update:searchQuery', 'create-note']
}
</script>

<style scoped>
.workspace-header {
  background: white;
  border-bottom: 1px solid #ccc;
  padding: 1rem 2rem;
  height: 80px;
  display: flex;
  align-items: center;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.workspace-title {
  font-size: 1.5rem;
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.search-input {
  padding: 0.5rem;
  border: 1px solid #ccc;
  width: 200px;
}

.btn-create-note {
  background: #007bff;
  border: none;
  color: white;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
}
</style>