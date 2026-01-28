import { createApp } from "vue";
import App from "./App.vue";
import router from './router'
import { authStore } from './stores/auth'
import SimpleSidebar from './components/SimpleSidebar.vue'

// Bootstrap CSS (framework UI)
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

// FontAwesome pour les icônes des boutons
import "@fortawesome/fontawesome-free/css/all.min.css";

// Theme personnalisé
import "./assets/styles/theme.css";

// Initialiser l'authentification
authStore.initializeAuth()

// Créer l'app Vue avec Bootstrap CSS pur
const app = createApp(App)
app.use(router)                    // Router
app.component('Sidebar', SimpleSidebar)  // Composant Sidebar simplifié avec Bootstrap
  
app.mount("#app")