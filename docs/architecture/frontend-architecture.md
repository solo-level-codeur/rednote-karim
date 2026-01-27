# Architecture Frontend - Projet Memory Login

## Vue d'ensemble

Ce document décrit l'architecture complète du frontend de l'application Memory Login, construite avec Vue.js 3 et une approche moderne de développement web.

## Stack Technologique

### Framework Principal
- **Vue.js 3.5.18** - Framework JavaScript progressif
- **Vue Router 4.5.1** - Routage côté client avec navigation guards
- **Composition API & Options API** - Approche hybride selon les besoins

### Build & Development Tools
- **Vite 7.0.6** - Build tool moderne et rapide
- **@vitejs/plugin-vue 6.0.1** - Plugin Vue pour Vite
- **vite-plugin-vue-devtools 8.0.0** - Outils de développement

### UI & Styling
- **Bootstrap 5.3.8** - Framework CSS responsive
- **FontAwesome 7.1.0** - Bibliothèque d'icônes
- **CSS personnalisé** - Thème spécifique dans `assets/styles/theme.css`

### Éditeur de Texte Riche
- **@tiptap/vue-3 3.4.1** - Éditeur moderne et extensible
- **@tiptap/starter-kit 3.4.1** - Extensions de base
- **Extensions spécialisées** :
  - Color, Highlight, Underline, TextAlign
  - Image, Link, YouTube
  - TaskList, TaskItem

### HTTP Client
- **Axios 1.11.0** - Client HTTP avec intercepteurs

## Architecture des Dossiers

```
memory-login/
├── public/                     # Fichiers statiques
├── src/
│   ├── main.js                # Point d'entrée de l'application
│   ├── App.vue                # Composant racine
│   ├── router/
│   │   └── index.js          # Configuration des routes et guards
│   ├── views/                 # Pages principales de l'application
│   │   ├── LoginView.vue     # Page de connexion
│   │   ├── HomeView.vue      # Page d'accueil
│   │   ├── NotesView.vue     # Vue des notes (personnelles/projet)
│   │   ├── ProjectsView.vue  # Gestion des projets
│   │   ├── ProfileView.vue   # Profil utilisateur
│   │   ├── AdminUsersView.vue # Administration des utilisateurs
│   │   ├── TagsView.vue      # Gestion des tags
│   │   └── NoteDetailView.vue # Détail d'une note
│   ├── components/           # Composants réutilisables
│   │   ├── layout/           # Composants de mise en page
│   │   │   ├── SimpleSidebar.vue    # Navigation latérale
│   │   │   ├── NotesHeader.vue      # En-tête des notes
│   │   │   └── NotesGrid.vue        # Grille d'affichage des notes
│   │   ├── forms/            # Composants de formulaires
│   │   │   ├── NoteCreateForm.vue   # Formulaire de création de notes
│   │   │   ├── LoginForm.vue        # Formulaire de connexion
│   │   │   ├── ProjectModal.vue     # Modal de création/édition de projet
│   │   │   └── TagModal.vue         # Modal de gestion des tags
│   │   ├── editors/          # Composants d'édition
│   │   │   ├── TiptapEditor.vue     # Éditeur de texte riche
│   │   │   └── SimpleEditorToolbar.vue # Barre d'outils d'édition
│   │   ├── selectors/        # Composants de sélection
│   │   │   ├── TagSelector.vue      # Sélecteur de tags
│   │   │   └── ProjectSelector.vue  # Sélecteur de projets
│   │   ├── lists/            # Composants de listes
│   │   │   ├── NotesList.vue        # Liste principale des notes
│   │   │   └── NoteCard.vue         # Carte d'affichage d'une note
│   │   └── modals/           # Composants modaux
│   │       ├── SimpleModal.vue      # Modal générique
│   │       └── ProjectMembersModal.vue # Gestion des membres de projet
│   ├── services/
│   │   └── api.js            # Configuration Axios et définition des APIs
│   ├── stores/
│   │   └── auth.js           # Store d'authentification (pattern store)
│   ├── utils/
│   │   └── toast.js          # Plugin de notifications
│   └── assets/
│       └── styles/
│           └── theme.css     # Thème personnalisé de l'application
├── package.json              # Dépendances et scripts
└── vite.config.js           # Configuration Vite
```

## Système de Routage

### Configuration des Routes (`router/index.js`)

```javascript
const routes = [
  // Authentification
  { path: '/login', component: LoginView },
  { path: '/register', component: RegisterView, meta: { requiresAdmin: true } },
  
  // Application principale
  { path: '/home', component: HomeView, meta: { requiresAuth: true } },
  { path: '/profile', component: ProfileView, meta: { requiresAuth: true } },
  
  // Gestion des notes
  { path: '/notes', component: NotesView, meta: { requiresAuth: true } },
  { path: '/projects/:projectId/notes', component: NotesView, meta: { requiresAuth: true } },
  { path: '/notes/:id', component: NoteDetailView, meta: { requiresAuth: true } },
  
  // Gestion des projets et tags
  { path: '/projects', component: ProjectsView, meta: { requiresAuth: true } },
  { path: '/tags', component: TagsView, meta: { requiresAuth: true } },
  
  // Administration
  { path: '/admin/users', component: AdminUsersView, meta: { requiresAuth: true, requiresAdmin: true } }
]
```

### Navigation Guards

Le système de navigation inclut des guards pour :
- **Authentification** : Vérification de `authStore.state.isAuthenticated`
- **Permissions admin** : Contrôle via `authStore.isAdmin()`
- **Redirection automatique** : Login si non authentifié, home si déjà connecté

## Système d'Authentification

### Store d'Authentification (`stores/auth.js`)

Pattern de store réactif avec :
- **État global** : `{ isAuthenticated: false, user: null }`
- **Méthodes** : `login()`, `logout()`, `isAdmin()`, `initializeAuth()`
- **Persistance** : Données utilisateur dans `localStorage`
- **Sécurité** : Tokens JWT dans cookies httpOnly

### Flux d'Authentification

1. **Login** → Appel API → Stockage des données utilisateur
2. **Initialisation** → Vérification de la session au démarrage
3. **Guards** → Contrôle d'accès basé sur l'état d'authentification
4. **Logout** → Nettoyage des données + redirection

## Communication avec l'API

### Configuration Axios (`services/api.js`)

```javascript
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  withCredentials: true,  // Envoi automatique des cookies
  headers: { 'Content-Type': 'application/json' }
})
```

### Intercepteurs

- **Request** : Pas d'ajout de token (gestion par cookies)
- **Response** : Gestion des erreurs 401 avec redirection automatique

### APIs Disponibles

- **authAPI** : Authentification et gestion des utilisateurs
- **notesAPI** : CRUD des notes et gestion par projet
- **projectsAPI** : Gestion des projets et membres
- **tagsAPI** : Gestion des tags et associations
- **shareAPI** : Partage de notes entre utilisateurs
- **commentsAPI** : Système de commentaires

## Composants Clés

### Layout Components

#### SimpleSidebar.vue
- Navigation principale de l'application
- Liens contextuels selon les permissions utilisateur
- Responsive avec collapse sur mobile

#### NotesHeader.vue
- En-tête des vues de notes
- Bouton de création de nouvelle note
- Breadcrumbs pour la navigation dans les projets

### Form Components

#### NoteCreateForm.vue
- Formulaire complet de création de notes
- Intégration avec TiptapEditor pour le contenu riche
- Gestion des tags et projets via sélecteurs
- Validation côté client

#### TiptapEditor.vue
- Éditeur WYSIWYG moderne
- Extensions multiples (formatage, médias, tâches)
- Toolbar personnalisée avec SimpleEditorToolbar.vue
- Sauvegarde en HTML

### Data Components

#### NotesList.vue
- Orchestrateur principal de la gestion des notes
- Communication avec les APIs
- Gestion de l'état global (loading, erreurs)
- Coordination des sous-composants

#### TagSelector.vue & ProjectSelector.vue
- Sélection multiple avec interface intuitive
- Création à la volée de nouveaux éléments
- Synchronisation en temps réel avec l'API

## Gestion de l'État

### Approche Hybride

- **Store centralisé** : Authentification uniquement
- **État local** : Données spécifiques aux composants
- **Props/Events** : Communication parent-enfant
- **API calls** : Rafraîchissement des données à la demande

### Pattern de Communication

```javascript
// Parent vers Enfant : Props
<NoteCreateForm :loading="loading" :newNote="newNote" />

// Enfant vers Parent : Events
<TagSelector @update:modelValue="updateTags" />

// Store global : Auth
import { authStore } from '@/stores/auth'
```

## Sécurité Frontend

### Protection des Routes
- Guards d'authentification sur toutes les routes sensibles
- Vérification des permissions admin pour les fonctionnalités avancées

### Gestion des Tokens
- JWT stockés dans cookies httpOnly (protection XSS)
- Pas de stockage de tokens sensibles en localStorage
- Expiration automatique avec redirection

### Validation des Données
- Validation côté client pour l'UX
- Sanitisation des entrées avant envoi à l'API
- Gestion d'erreurs robuste avec messages utilisateur

## Performance et Optimisation

### Build et Bundling
- **Vite** pour un hot reload rapide et builds optimisés
- **Tree shaking** automatique des dépendances
- **Code splitting** par routes avec Vue Router

### Gestion des Assets
- **Bootstrap** via CDN ou bundles locaux
- **FontAwesome** optimisé avec seulement les icônes utilisées
- **Images** gérées via Vite avec optimisation automatique

### Lazy Loading
- Composants chargés à la demande selon les routes
- API calls déclenchés uniquement lors de l'affichage
- Pagination côté serveur pour les grandes listes

## Patterns de Développement

### Composition API vs Options API
- **Composition API** pour la logique complexe (TagSelector.vue)
- **Options API** pour les composants simples et standards
- Transition progressive selon les besoins

### Naming Conventions
- **Composants** : PascalCase (NoteCreateForm.vue)
- **Props/Events** : camelCase (showCreateForm, @create-note)
- **Files** : kebab-case pour les assets, PascalCase pour les composants

### Error Handling
- Try-catch systematique sur les appels API
- Messages d'erreur utilisateur-friendly
- Logging console pour le debugging

Cette architecture offre une base solide, maintenable et évolutive pour l'application Memory Login.