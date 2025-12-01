import { createApp } from "vue";
import App from "./App.vue";
import router from './router'
import { authStore } from './stores/auth'
import toastPlugin from './utils/toast'
import Sidebar from './components/Sidebar.vue'

// Bootstrap Vue
import { createBootstrap } from 'bootstrap-vue-next'

// Bootstrap
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import 'bootstrap-vue-next/dist/bootstrap-vue-next.css'

// FontAwesome
import "@fortawesome/fontawesome-free/css/all.min.css";

// Theme personnalisé
import "./assets/styles/theme.css";

// Initialiser l'authentification
authStore.initializeAuth()

// CORRECT : Créer l'app d'abord
const app = createApp(App)
app.use(router)                    // ← Ajouter le router AVANT mount
app.use(createBootstrap())         // ← Ajouter Bootstrap Vue
app.use(toastPlugin)               // ← Ajouter le plugin toast
app.component('Sidebar', Sidebar)  // ← Enregistrer Sidebar globalement
  
app.mount("#app")                  // ← Mount en dernier