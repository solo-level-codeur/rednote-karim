import { createApp } from "vue";
import App from "./App.vue";
import router from './router'
import Oruga from "@oruga-ui/oruga-next";
import { bulmaConfig } from "@oruga-ui/theme-bulma";
import "@oruga-ui/theme-bulma/dist/bulma.css";
import { authStore } from './stores/auth'

// Initialiser l'authentification
authStore.initializeAuth()

// CORRECT : Créer l'app d'abord
const app = createApp(App)
app.use(router)                    // ← Ajouter le router AVANT mount
app.use(Oruga, bulmaConfig)        // ← Ajouter Oruga AVANT mount  
app.mount("#app")                  // ← Mount en dernier