# Notes Module Documentation

## 📁 Structure des Composants

```
notes/
├── NotesList.vue           # 🎯 Composant principal (Orchestrateur)
├── layout/                 # 🏗️ Composants de mise en page
│   ├── NotesHeader.vue    # En-tête avec titre et bouton d'action
│   └── NotesGrid.vue      # Grille d'affichage avec états loading/empty
├── forms/                  # 📝 Composants de formulaires
│   └── NoteCreateForm.vue # Formulaire de création de notes
└── items/                  # 📄 Composants d'affichage d'éléments
    └── NoteCard.vue       # Carte d'affichage d'une note individuelle
```

---

## 🎯 NotesList.vue (Orchestrateur Principal)

**Responsabilité :** Coordonner tous les sous-composants et gérer l'état global des notes.

### Props
Aucune (composant de niveau supérieur)

### État interne
- `notes: Array` - Liste des notes
- `loading: Boolean` - État de chargement
- `error: String` - Messages d'erreur
- `showCreateForm: Boolean` - Affichage du formulaire
- `newNote: Object` - Données de la nouvelle note

### Méthodes principales
- `fetchNotes()` - Récupérer les notes depuis l'API
- `createNote()` - Créer une nouvelle note
- `editNote()` - Rediriger vers l'édition
- `deleteNote()` - Supprimer une note

---

## 🏗️ Layout Components

### NotesHeader.vue
**Responsabilité :** Afficher l'en-tête avec titre et bouton de création.

| Props | Type | Description |
|-------|------|-------------|
| `showCreateForm` | Boolean | Masquer le bouton si le formulaire est ouvert |

| Events | Payload | Description |
|--------|---------|-------------|
| `@create-note` | - | Déclenché au clic sur "Nouvelle Note" |

### NotesGrid.vue
**Responsabilité :** Afficher la grille des notes avec gestion des états.

| Props | Type | Description |
|-------|------|-------------|
| `notes` | Array | Liste des notes à afficher |
| `loading` | Boolean | État de chargement |

| Events | Payload | Description |
|--------|---------|-------------|
| `@edit-note` | note | Note à éditer |
| `@delete-note` | note | Note à supprimer |

---

## 📝 Form Components

### NoteCreateForm.vue
**Responsabilité :** Formulaire complet de création de notes avec éditeur riche.

| Props | Type | Description |
|-------|------|-------------|
| `show` | Boolean | Afficher/masquer le formulaire |
| `loading` | Boolean | État de chargement |
| `newNote` | Object | Données de la note (`{title, content}`) |

| Events | Payload | Description |
|--------|---------|-------------|
| `@create` | note | Données de la note à créer |
| `@cancel` | - | Annulation du formulaire |

---

## 📄 Item Components

### NoteCard.vue
**Responsabilité :** Affichage d'une carte de note individuelle avec actions.

| Props | Type | Description |
|-------|------|-------------|
| `note` | Object | Objet note (`{id, title, content, created_at}`) |

| Events | Payload | Description |
|--------|---------|-------------|
| `@edit` | note | Note à éditer |
| `@delete` | note | Note à supprimer |

### Méthodes utilitaires internes
- `formatDate()` - Formatage de date en français
- `getPreview()` - Aperçu du contenu (150 caractères)
- `getWordCount()` - Comptage de mots

---

## 🔄 Flux de données

```
NotesList (état global)
    ↓ props
NotesHeader ← → NoteCreateForm ← → NotesGrid
                                      ↓ props
                                  NoteCard[]
```

1. **Création :** NotesHeader → NoteCreateForm → NotesList (API) → NotesGrid
2. **Affichage :** NotesList → NotesGrid → NoteCard[]
3. **Actions :** NoteCard → NotesGrid → NotesList

---

## 🎨 Avantages de cette architecture

- ✅ **Séparation des responsabilités** claire
- ✅ **Réutilisabilité** des composants
- ✅ **Maintenabilité** facilitée
- ✅ **Testabilité** unitaire possible
- ✅ **Lisibilité** du code améliorée
- ✅ **Évolutivité** pour nouvelles fonctionnalités