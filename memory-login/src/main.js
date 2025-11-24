import { createApp } from "vue";
import App from "./App.vue";
import router from './router'
import { authStore } from './stores/auth'

// Bootstrap
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

// FontAwesome
import "@fortawesome/fontawesome-free/css/all.min.css";

// Theme personnalisé
import "./assets/styles/theme.css";

// Initialiser l'authentification
authStore.initializeAuth()

// CORRECT : Créer l'app d'abord
const app = createApp(App)
app.use(router)                    // ← Ajouter le router AVANT mount
  
app.mount("#app")                  // ← Mount en dernier