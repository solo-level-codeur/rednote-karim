# 📋 Frontend Architecture Documentation

## 🎯 Vue d'ensemble

Cette application Vue.js 3 est une application de prise de notes avec éditeur riche. Elle a été **refactorisée massivement** d'un code monolithique vers une architecture modulaire.

### 📊 Statistiques de refactoring
- **Code initial** : ~4800+ lignes
- **Code actuel** : ~3500 lignes  
- **Réduction** : **-27% du code original**
- **Composants extraits** : 12 nouveaux composants créés

---

## 🏗️ Architecture actuelle

### 📁 Structure des dossiers

```
src/
├── components/
│   ├── auth/                    # Authentification
│   │   ├── LoginForm.vue
│   │   ├── LoginTitle.vue
│   │   └── RegisterForm.vue
│   ├── dashboard/               # Tableau de bord
│   │   ├── DashboardHeader.vue  # En-tête avec salutation
│   │   └── DashboardStats.vue   # Cartes statistiques
│   ├── notes/                   # Gestion des notes
│   │   ├── forms/
│   │   │   └── NoteCreateForm.vue  # Formulaire création
│   │   ├── items/
│   │   │   └── NoteCard.vue        # Carte individuelle
│   │   ├── layout/
│   │   │   ├── NotesGrid.vue       # Grille d'affichage
│   │   │   └── NotesHeader.vue     # En-tête avec bouton
│   │   └── NotesList.vue           # Orchestrateur principal
│   ├── workspace/               # Espace d'édition
│   │   ├── editor/
│   │   │   └── NotesEditor.vue     # Interface d'édition
│   │   └── layout/
│   │       ├── NotesSidebar.vue    # Liste latérale
│   │       └── WorkspaceHeader.vue # Header workspace
│   ├── toolbar/                 # Outils TiptapEditor
│   │   └── EditorToolbar.vue
│   ├── AppHeader.vue           # Header global
│   ├── Side.vue                # Sidebar navigation
│   └── TiptapEditor.vue        # Éditeur riche
├── views/
│   ├── DashboardView.vue       # Page tableau de bord
│   ├── NotesView.vue           # Page espace de travail
│   ├── LoginView.vue           # Page connexion
│   └── RegisterView.vue        # Page inscription
├── services/
│   └── api.js                  # Services API
├── stores/
│   └── auth.js                 # Store authentification
├── utils/
│   └── textUtils.js            # Utilitaires texte
└── router/
    └── index.js                # Configuration routes
```

---

## 🎨 Composants principaux

### 1. **DashboardView.vue** - Orchestrateur principal
```vue
<template>
  <Sidebar />
  <main>
    <DashboardHeader :userName="userName" @logout="logout" />
    <DashboardStats :totalNotes="totalNotes" :todayNotes="todayNotes" :weekNotes="weekNotes" />
    <NotesList />
  </main>
</template>
```
**Responsabilités :**
- Coordonner header, stats et liste
- Calculer statistiques des notes
- Gérer déconnexion

### 2. **NotesList.vue** - Orchestrateur notes
```vue
<template>
  <NotesHeader @create-note="showCreateForm = true" />
  <NoteCreateForm :show="showCreateForm" @create="createNote" @cancel="cancelCreate" />
  <NotesGrid :notes="notes" @edit-note="editNote" @delete-note="deleteNote" />
</template>
```
**Responsabilités :**
- Gérer état global des notes
- Coordonner création/édition/suppression
- API calls vers backend

### 3. **NotesView.vue** - Espace de travail
```vue
<template>
  <Sidebar />
  <main>
    <WorkspaceHeader @create-note="createNote" />
    <div class="workspace-layout">
      <NotesSidebar :notes="notes" @select-note="selectNote" />
      <NotesEditor :note="currentNote" @save="saveNote" />
    </div>
  </main>
</template>
```
**Responsabilités :**
- Interface d'édition avancée
- Gestion notes sélectionnées
- Sauvegarde automatique

---

## 🔄 Flux de données

### Création d'une note
```
DashboardView → NotesList → NotesHeader → (click) → NoteCreateForm → TiptapEditor
                    ↓
                API Call → Backend → Response → Update local state
```

### Édition d'une note
```
NoteCard → (click edit) → Router → NotesView → NotesEditor → TiptapEditor
    ↓
Auto-save → API Call → Backend
```

---

## 🎨 Simplification CSS réalisée

### Avant refactoring :
- Gradients complexes (`linear-gradient`)
- Animations hover (`transform`, `box-shadow`)
- Border-radius fantaisistes (`20px`, `12px`)
- Couleurs multiples et thèmes
- Media queries élaborées

### Après simplification :
```css
/* Style uniforme et épuré */
.component {
  background: white;
  border: 1px solid #ddd;
  padding: 1rem;
}

.btn-primary {
  background: #007bff;
  border: none;
  color: white;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
}
```

**Réductions CSS :**
- **TiptapEditor** : 268 → 145 lignes (-46%)
- **NoteCreateForm** : 253 → 173 lignes (-32%)
- **NoteCard** : Suppression overlay hover complexe

---

## 🛠️ Services et utilitaires

### textUtils.js
```javascript
export function stripHtmlAndTruncate(content, maxLength = 150) {
  if (!content) return ''
  const text = content.replace(/<[^>]*>/g, '').trim()
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}
```

### api.js
```javascript
export const notesAPI = {
  getAllNotes: () => api.get('/notes'),
  createNote: (note) => api.post('/notes', note),
  updateNote: (id, note) => api.put(`/notes/${id}`, note),
  deleteNote: (id) => api.delete(`/notes/${id}`)
}
```

---

## ⚠️ Points d'attention actuels

### 🔴 Problèmes identifiés
1. **Duplication d'état** : Notes gérées dans multiple composants
2. **API calls répétés** : getAllNotes() appelé 3 fois
3. **Gestion d'erreur** : Patterns try-catch répétés
4. **Nommage** : `Side.vue` devrait être `Sidebar.vue`

### 🟡 Améliorations CSS
1. **TiptapEditor** : Peut être encore simplifié
2. **Boutons** : Styles dupliqués entre composants
3. **Loading states** : Patterns similaires non unifiés

---

## 🚀 Prochaines sessions de code

### Phase 1 : Architecture centralisée (PRIORITÉ HAUTE)

#### 1.1 Créer store centralisé
```javascript
// src/stores/notes.js
import { reactive } from 'vue'
import { notesAPI } from '../services/api'

const state = reactive({
  notes: [],
  currentNote: null,
  loading: false,
  stats: { total: 0, today: 0, week: 0 }
})

export const notesStore = {
  state,
  async fetchNotes() { /* centralized logic */ },
  async createNote(note) { /* centralized logic */ },
  calculateStats() { /* centralized logic */ }
}
```

#### 1.2 Créer composables
```javascript
// src/composables/useNotes.js
export function useNotes() {
  const { notes, loading, error } = notesStore
  
  const createNote = async (noteData) => {
    // Centralized creation logic
  }
  
  return { notes, loading, error, createNote }
}
```

#### 1.3 Extraire utilitaires
```javascript
// src/utils/dateUtils.js
export function formatRelativeDate(dateString) { /* unified logic */ }
export function formatDate(dateString) { /* unified logic */ }

// src/utils/noteUtils.js  
export function validateNote(note) { /* validation logic */ }
export function calculateNoteStats(notes) { /* stats logic */ }
```

### Phase 2 : Réorganisation (PRIORITÉ MOYENNE)

#### 2.1 Renommer et déplacer
```bash
# Actions à faire
mv src/components/Side.vue src/components/common/Sidebar.vue
mv src/components/TiptapEditor.vue src/components/editor/TiptapEditor.vue
mv src/components/AppHeader.vue src/components/common/AppHeader.vue
```

#### 2.2 Créer structure finale
```
src/components/
├── common/              # Composants partagés
│   ├── Sidebar.vue
│   ├── AppHeader.vue
│   └── LoadingSpinner.vue
├── auth/                # Authentification
├── dashboard/           # Tableau de bord  
├── notes/               # Gestion notes
└── editor/              # Éditeur riche
    ├── TiptapEditor.vue
    └── workspace/
```

### Phase 3 : Optimisations (PRIORITÉ BASSE)

#### 3.1 Performance
- Lazy loading des composants lourds
- Memoization des calculs
- Virtual scrolling pour grandes listes

#### 3.2 UX améliorée
- Loading skeletons
- Transitions fluides
- Gestion offline

---

## 📝 Checklist pour prochaine session

### ✅ Fait
- [x] Refactoring monolithe → composants modulaires
- [x] Simplification CSS drastique
- [x] Extraction utilitaires textUtils.js
- [x] Suppression code dupliqué
- [x] Nettoyage console.error et lignes vides

### 🔲 À faire IMMÉDIATEMENT
- [ ] Créer `stores/notes.js` pour centraliser l'état
- [ ] Créer `composables/useNotes.js`
- [ ] Renommer `Side.vue` → `Sidebar.vue`
- [ ] Extraire `utils/dateUtils.js`
- [ ] Créer `composables/useApi.js` pour gestion erreurs

### 🔲 À faire ENSUITE  
- [ ] Réorganiser structure folders finale
- [ ] Unifier styles boutons dans design system
- [ ] Implémenter lazy loading
- [ ] Ajouter loading skeletons
- [ ] Tests unitaires composants

---

## 🔍 Commandes utiles

### Développement
```bash
npm run dev              # Serveur développement
npm run build           # Build production
npm run lint            # Vérification code
```

### Analyse
```bash
# Compter lignes de code
find src -name "*.vue" -exec wc -l {} + | tail -1

# Rechercher patterns
grep -r "console\." src/
grep -r "TODO" src/
```

---

## 📚 Technologies utilisées

- **Vue.js 3** : Framework principal
- **Vue Router** : Navigation
- **TiptapEditor** : Éditeur riche
- **Composition API** : Logique réactive
- **CSS vanilla** : Styles simplifiés

---

## 🎯 Objectifs atteints

1. **✅ Code modulaire** : Monolithe → 12+ composants
2. **✅ CSS épuré** : Suppression 500+ lignes styles complexes
3. **✅ DRY principle** : Extraction logique commune
4. **✅ Performances** : -27% de code total
5. **✅ Maintenabilité** : Architecture claire et documentée

---

*📅 Document généré le : $(date)*
*🔄 Dernière mise à jour : Session de refactoring majeur*