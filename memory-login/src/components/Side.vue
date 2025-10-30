<template>
  <aside class="sidebar">
    <!-- Logo Header -->
    <div class="sidebar-header">
      <div class="logo">
        <span class="logo-icon">📦</span>
        <span class="logo-text">Memory</span>
      </div>
    </div>
    
    <!-- Menu Navigation -->
    <nav class="sidebar-menu">
      <ul>
        <li class="menu-item" :class="{ active: $route.name === 'dashboard' }">
          <router-link to="/dashboard" class="menu-link">
            <span class="menu-icon">🏠</span>
            <span class="menu-text">Dashboard</span>
          </router-link>
        </li>
        <li class="menu-item" :class="{ active: $route.name === 'notes' }">
          <router-link to="/notes" class="menu-link">
            <span class="menu-icon">📝</span>
            <span class="menu-text">Éditeur de Notes</span>
          </router-link>
        </li>
        <li class="menu-item">
          <span class="menu-icon">✅</span>
          <span class="menu-text">Tasks</span>
        </li>
        <li class="menu-item" :class="{ active: $route.name === 'projects' }">
        <router-link to="/projects" class="menu-link">
          <span class="menu-icon">📁</span>
          <span class="menu-text">Projects</span>
          </router-link>

        </li>
        <li class="menu-item">
          <span class="menu-icon">👥</span>
          <span class="menu-text">Contributors</span>
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
.sidebar {
  width: 250px;
  height: 100vh;
  background-color: #f8f9fa;
  border-right: 1px solid #e9ecef;
  position: fixed;
  left: 0;
  top: 0;
}

.sidebar-header {
  padding: 1.5rem 1rem;
  border-bottom: 1px solid #e9ecef;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.logo-icon {
  font-size: 1.5rem;
  background: #48c78e;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-text {
  font-weight: bold;
  font-size: 1.2rem;
  color: #363636;
}

.sidebar-menu {
  padding: 1rem 0;
}

.sidebar-menu ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.menu-item {
  transition: all 0.2s;
}

.menu-link {
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  text-decoration: none;
  color: inherit;
  width: 100%;
}

.menu-item:hover {
  background-color: #f1f3f4;
}

.menu-item.active {
  background-color: #ffe8e6;
  border-right: 3px solid #ff3860;
  color: #ff3860;
}

.menu-icon {
  width: 20px;
  text-align: center;
}

.menu-text {
  font-weight: 500;
}
</style>