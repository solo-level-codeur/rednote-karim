# 📝 Documentation Frontend - Application de Notes

**Développeur :** Karim  
**Technologie :** Vue.js 3 + Vite  
**Date :** Décembre 2024

---

## 🎯 Vue d'ensemble

Cette application de notes moderne utilise Vue.js 3 avec la Composition API, TipTap pour l'édition riche, et Bulma pour le styling. L'architecture est organisée de manière modulaire avec une séparation claire des responsabilités.

## 📁 Structure du Projet

```
src/
├── components/           # Composants réutilisables
│   ├── AppHeader.vue    # En-tête principal (non utilisé)
│   ├── LoginForm.vue    # Formulaire de connexion
│   ├── LoginTitle.vue   # Titre de connexion
│   ├── NotesList.vue    # Liste des notes pour dashboard
│   ├── Side.vue         # Sidebar de navigation
│   └── TiptapEditor.vue # Éditeur de texte riche
├── views/               # Pages principales
│   ├── LoginView.vue    # Page de connexion
│   ├── RegisterView.vue # Page d'inscription
│   ├── DashboardView.vue # Dashboard principal
│   └── NotesView.vue    # Page d'édition des notes
├── services/            # Services API
│   └── api.js          # Configuration Axios et endpoints
├── stores/              # État global
│   └── auth.js         # Store d'authentification
└── router/              # Configuration des routes
    └── index.js        # Routes et guards
```

---

## 🔐 Système d'Authentification

### Store d'authentification (`stores/auth.js`)
```javascript
// État global de l'authentification
const state = reactive({
  user: null,
  isAuthenticated: false
})

// Méthodes principales
- login(userData)    # Connexion utilisateur
- logout()          # Déconnexion
- checkAuth()       # Vérification du token
```

### Pages d'authentification

#### `LoginView.vue`
- **Composants :** `LoginTitle` + `LoginForm`
- **Fonctionnalités :** Connexion avec email/mot de passe
- **Redirection :** Vers `/dashboard` après connexion

#### `RegisterView.vue`
- **Fonctionnalités :** Inscription nouvel utilisateur
- **Validation :** Email, mot de passe, confirmation
- **Redirection :** Vers `/login` après inscription

### Guards de navigation (`router/index.js`)
```javascript
// Protection des routes
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  
  if (requiresAuth && !authStore.state.isAuthenticated) {
    next('/login')  # Redirection si non connecté
  } else {
    next()
  }
})
```

---

## 🎨 Interface Utilisateur

### Dashboard (`DashboardView.vue`)

**Design moderne avec gradient et statistiques :**

```vue
<!-- En-tête avec gradient -->
<div class="hero-header">
  <h1 class="hero-title">👋 Bonjour {{ userName }}</h1>
  
  <!-- Cartes statistiques -->
  <div class="stats-cards">
    <div class="stat-card">📝 {{ totalNotes }} Notes totales</div>
    <div class="stat-card">✨ {{ todayNotes }} Aujourd'hui</div>
    <div class="stat-card">🎯 {{ weekNotes }} Cette semaine</div>
  </div>
</div>
```

**Fonctionnalités :**
- Calcul automatique des statistiques
- Design glassmorphism pour les cartes
- Animation de la main qui fait coucou
- Affichage du composant `NotesList`

### Page Notes (`NotesView.vue`)

**Architecture 3 colonnes épurée :**

1. **En-tête simplifié**
   - Titre "Notes"
   - Barre de recherche instantanée
   - Bouton "Nouvelle Note"

2. **Sidebar des notes (300px)**
   - Liste des notes avec preview
   - Recherche en temps réel
   - Tri par date de modification

3. **Zone d'édition principale**
   - Input titre sans bordure
   - Éditeur TipTap intégré
   - Sauvegarde automatique

```vue
<!-- Structure principale -->
<div class="notes-workspace">
  <Sidebar />
  
  <main class="workspace-main">
    <header class="workspace-header">
      <!-- En-tête avec recherche -->
    </header>
    
    <div class="workspace-body">
      <aside class="notes-sidebar">
        <!-- Liste des notes -->
      </aside>
      
      <main class="editor-main">
        <!-- Éditeur TipTap -->
      </main>
    </div>
  </main>
</div>
```

---

## ✍️ Éditeur TipTap

### Configuration (`TiptapEditor.vue`)

**Extensions utilisées :**
```javascript
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import { TextStyle } from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import YouTube from '@tiptap/extension-youtube'
```

**Barre d'outils organisée :**
- **Formatage :** Gras, Italique, Souligné, Barré
- **Couleurs :** Texte et surlignage
- **Titres :** H1, H2, H3
- **Listes :** Puces, numérotées, tâches
- **Alignement :** Gauche, centre, droite
- **Média :** Liens, images, vidéos YouTube
- **Autres :** Citations, code, lignes horizontales
- **Actions :** Annuler, refaire, nettoyer

### Fonctionnalités avancées

**Gestion des images :**
```javascript
// Ouverture du dialogue fichier
openImageDialog() {
  this.$refs.imageInput.click()
}

// Traitement de l'image
addImage(event) {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      this.editor.chain().focus().setImage({ src: e.target.result }).run()
    }
    reader.readAsDataURL(file)
  }
}
```

---

## 🔄 Gestion des Données

### Service API (`services/api.js`)

**Configuration Axios :**
```javascript
const api = axios.create({
  baseURL: 'http://localhost:3000/api/notes',
  headers: { 'Content-Type': 'application/json' }
})

// Intercepteur pour l'authentification
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

**Endpoints disponibles :**
```javascript
export const notesAPI = {
  getAllNotes: () => api.get('/'),
  getNoteById: (id) => api.get(`/note/${id}`),
  createNote: (noteData) => api.post('/note', noteData),
  updateNote: (id, noteData) => api.put(`/note/${id}`, noteData),
  deleteNote: (id) => api.delete(`/note/${id}`)
}
```

### Gestion d'état dans les composants

**Notes View - Composition API :**
```javascript
// État réactif
const notes = ref([])
const currentNote = ref(null)
const loading = ref(false)
const searchQuery = ref('')

// Computed pour le filtrage
const filteredNotes = computed(() => {
  let filtered = notes.value
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(note => 
      note.title?.toLowerCase().includes(query) ||
      note.content?.toLowerCase().includes(query)
    )
  }
  
  return filtered.sort((a, b) => 
    new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at)
  )
})
```

---

## 💾 Sauvegarde et Synchronisation

### Sauvegarde automatique

**Debounced save (1 seconde) :**
```javascript
const debouncedSave = () => {
  clearTimeout(saveTimeout)
  saveTimeout = setTimeout(saveNote, 1000)
}

const saveNote = async () => {
  if (!currentNote.value || !currentNote.value.id) return
  
  try {
    await notesAPI.updateNote(currentNote.value.id, {
      title: currentNote.value.title,
      content: currentNote.value.content
    })
    
    // Mise à jour locale
    const index = notes.value.findIndex(n => n.id === currentNote.value.id)
    if (index !== -1) {
      notes.value[index] = { 
        ...currentNote.value, 
        updated_at: new Date().toISOString() 
      }
    }
  } catch (error) {
    console.error('Erreur sauvegarde:', error)
  }
}
```

### Création de notes

**Processus optimisé :**
```javascript
const createNote = async () => {
  try {
    const noteData = {
      title: 'Nouvelle note',
      content: '<p>Commencez à écrire votre note...</p>'
    }
    
    const response = await notesAPI.createNote(noteData)
    await fetchNotes()
    
    const createdNote = notes.value.find(n => n.id === response.data.id)
    if (createdNote) {
      selectNote(createdNote)
      
      // Focus automatique sur le titre
      setTimeout(() => {
        const titleInput = document.querySelector('.note-title-input')
        if (titleInput) {
          titleInput.focus()
          titleInput.select()
        }
      }, 100)
    }
  } catch (error) {
    console.error('Erreur:', error)
  }
}
```

---

## 🎨 Système de Design

### Couleurs principales
```css
:root {
  --primary: #3182ce;      /* Bleu principal */
  --primary-hover: #2c5282; /* Bleu hover */
  --gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --bg-light: #f8fafc;     /* Arrière-plan */
  --border: #e2e8f0;       /* Bordures */
  --text: #2d3748;         /* Texte principal */
  --text-muted: #718096;   /* Texte secondaire */
}
```

### Composants UI

**Boutons :**
```css
.btn-primary {
  background: var(--primary);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: background 0.2s ease;
}

.btn-gradient {
  background: var(--gradient);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}
```

**Cartes :**
```css
.card {
  background: white;
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1rem;
  transition: all 0.2s ease;
}

.card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}
```

---

## 📱 Responsive Design

### Breakpoints
```css
/* Mobile */
@media (max-width: 480px) {
  .workspace-main { margin-left: 0; }
  .notes-sidebar { max-height: 300px; }
}

/* Tablette */
@media (max-width: 768px) {
  .workspace-body { flex-direction: column; }
  .search-input { width: 200px; }
}

/* Desktop */
@media (max-width: 1024px) {
  .notes-sidebar { width: 100%; max-height: 400px; }
}
```

### Adaptations mobiles
- **Sidebar :** Se transforme en header horizontal
- **Recherche :** Largeur adaptative
- **Boutons :** Taille réduite
- **Typography :** Échelle responsive

---

## 🚀 Optimisations et Bonnes Pratiques

### Performance
- **Lazy loading :** Composants chargés à la demande
- **Debounced search :** Évite les appels API excessifs
- **Vue transitions :** Animations fluides avec TransitionGroup
- **Computed properties :** Filtrage et tri optimisés

### UX/UI
- **Focus management :** Auto-focus sur création de note
- **Keyboard shortcuts :** Support des raccourcis TipTap
- **Loading states :** Spinners et états de chargement
- **Error handling :** Gestion gracieuse des erreurs

### Code Quality
- **Composition API :** Code modulaire et réutilisable
- **TypeScript ready :** Structure préparée pour TS
- **ESLint :** Configuration de linting
- **Scoped styles :** CSS isolé par composant

---

## 🔧 Configuration et Déploiement

### Scripts disponibles
```json
{
  "scripts": {
    "dev": "vite",           // Serveur de développement
    "build": "vite build",   // Build de production
    "preview": "vite preview" // Aperçu du build
  }
}
```

### Variables d'environnement
```javascript
// Exemple de configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/notes'
```

### Build de production
```bash
npm run build  # Génère le dossier dist/
```

---

## 🐛 Débogage et Maintenance

### Logs utiles
- **API calls :** Console logs dans les services
- **Route guards :** Logs des redirections
- **Store mutations :** Suivi des changements d'état

### Erreurs communes
1. **Token expiré :** Redirection automatique vers `/login`
2. **API indisponible :** Messages d'erreur utilisateur
3. **Validation :** Feedback visuel sur les formulaires

### Monitoring
- **Vue DevTools :** Débogage des composants
- **Network tab :** Surveillance des requêtes API
- **Console :** Logs d'erreurs et warnings

---

## 📈 Évolutions Futures

### Fonctionnalités prévues
- [ ] Mode sombre
- [ ] Raccourcis clavier globaux
- [ ] Export PDF/Markdown
- [ ] Collaboration temps réel
- [ ] Tags et catégories
- [ ] Recherche avancée avec filtres

### Améliorations techniques
- [ ] Migration vers TypeScript
- [ ] Tests unitaires (Vitest)
- [ ] PWA (Progressive Web App)
- [ ] Optimisation bundle size
- [ ] Cache API avec Vue Query

---

## 📚 Ressources et Documentation

### Technologies utilisées
- **Vue.js 3 :** https://vuejs.org/
- **Vite :** https://vitejs.dev/
- **TipTap :** https://tiptap.dev/
- **Bulma :** https://bulma.io/
- **Axios :** https://axios-http.com/

### Architecture inspirée de
- **Notion :** Interface d'édition
- **Linear :** Design system
- **Apple Notes :** Simplicité

---

*Documentation créée pour Karim - Décembre 2024*  
*Application de Notes Moderne - Vue.js 3 + TipTap*