## API Backend - Documentation

Cette API Express gère un système de **projets / notes collaboratives** avec tags, commentaires et partage.  
La base de données MySQL est décrite dans `SQL/db.sql`.

---

### 1. Architecture générale

- **Serveur**: `app.js`
  - Monte les routes :
    - `/api` → `userRoutes.js` (auth)
    - `/api/notes` → `noteRoutes.js`
    - `/api/projects` → `projectRoutes.js`
    - `/api/tags` → `tagRoutes.js`
    - `/api/share` → `shareRoutes.js`
    - `/api/comments` → `commentRoutes.js`
  - Utilise `cors`, `body-parser.json()` et une connexion MySQL (`config/db`).
- **Sécurité**:
  - JWT dans `Authorization: Bearer <token>`.
  - Middleware `protect` pour vérifier le token.
  - Middleware `authorizeNoteOwner` pour certaines routes notes.

---

### 2. Modèle de données (résumé depuis `SQL/db.sql`)

- **`users`**
  - `id_users`, `firstname`, `lastname`, `email`, `password`, `id_roles`, timestamps.
  - Contrainte: email unique, clé étrangère vers `roles`.

- **`roles`, `permissions`, `role_permissions`**
  - Gestion des rôles (Admin, Manager, Developer, Viewer) et permissions symboliques.

- **`projects`**
  - `id`, `name`, `description`, `creation_date`, `status`, `id_owner`, timestamps.
  - Le propriétaire (`id_owner`) est un `users.id_users`.

- **`notes`**
  - `id`, `title`, `content`, `creation_date`, `updated_date`, `id_users`, `id_projects`.
  - Chaque note appartient à un **utilisateur** et à un **projet**.

- **`tags`**, `note_tags`, `project_tags`
  - Tags colorés (nom unique) liés aux notes et projets.

- **`comments`**
  - Commentaires liés à une note et un utilisateur.

- **`note_shares`**
  - Partage de notes: `id_notes`, `id_users` (destinataire), `permission` (`Read`/`Write`/`Admin`).

Les index et contraintes de `db.sql` optimisent les recherches et sécurisent les relations.

---

### 3. Authentification (`userRoutes.js` / `userController.js`)

Base URL: `/api`

- **POST `/register`**
  - Corps: `{ firstname, lastname, email, password }`
  - Crée un utilisateur (rôle par défaut Developer, id_roles=3).
  - Hash du mot de passe avec `bcrypt`.
  - Retour: `{ id, firstname, lastname, email, token }`.

- **POST `/login`**
  - Corps: `{ email, password }`
  - Vérifie l’email + mot de passe (`matchPassword`).
  - Retour: `{ id, firstname, lastname, email, token }`.

- **GET `/profile`**
  - Protégée (`protect`).
  - Retourne les infos de l’utilisateur courant (id, prénom, nom, email).

Le token JWT est généré avec `JWT_SECRET` et une durée de 30 jours.

---

### 4. Notes (`noteRoutes.js`, `noteController.js`, `noteModel.js`)

Base URL: `/api/notes`

- **GET `/`** (protégé)
  - Retourne toutes les notes appartenant à l’utilisateur connecté (`notes.id_users = userId`).

- **GET `/note/:id`** (protégé + propriétaire)
  - `authorizeNoteOwner` vérifie que l’utilisateur est bien le propriétaire de la note.
  - Retourne une note précise.

- **POST `/note`** (protégé)
  - Corps: `{ title, content, projectId? }`
  - Si `projectId` fourni: la note est créée dans ce projet.
  - Sinon: le modèle crée ou réutilise un **projet par défaut** (`Projet par défaut`) pour cet utilisateur, puis y attache la note.
  - Retour: infos de la note + type (`Note personnelle` ou `Note de projet`).

- **PUT `/note/:id`** (protégé + propriétaire)
  - Corps: `{ title, content }`
  - Met à jour la note (titre + contenu).

- **DELETE `/note/:id`** (protégé + propriétaire)
  - Supprime la note si elle appartient à l’utilisateur.

- **GET `/search?q=...&projectId?=...`**
  - Recherche par mot-clé dans le titre/contenu des notes de l’utilisateur.
  - Optionnellement filtré par projet.

- **GET `/filter?projectId&dateFrom&dateTo&sortBy&sortOrder&limit`**
  - Filtres avancés sur les notes (par projet, par dates, tri, limite).

**Modèle `noteModel.js`**:
- `createNote`:
  - Gère la logique de projet par défaut si `projectId` est vide.
  - Insère dans `notes (title, content, id_users, id_projects)`.
- `getAllNotes`, `getNoteById`, `updateNote`, `deleteNote`:
  - CRUD classique avec vérification de l’owner (`id_users`).
- `searchNotes`, `getNotesWithFilters`:
  - Rejoint `projects` pour remonter `project_name`.

---

### 5. Projets (`projectRoutes.js`, `projectController.js`, `projectModel.js`)

Base URL: `/api/projects` (protégé par défaut)

- **POST `/`**
  - Corps: `{ name, description }`
  - Crée un projet avec `id_owner = userId` et `status = 'New'`.

- **GET `/`**
  - Liste tous les projets dont l’utilisateur est propriétaire.

- **GET `/:id`**
  - Retourne un projet précis appartenant à l’utilisateur.

- **PUT `/:id`**
  - Corps: `{ name, description, status }`
  - Met à jour le projet (nom, description, statut).

- **DELETE `/:id`**
  - Supprime le projet si l’utilisateur en est le propriétaire.

**Modèle `projectModel.js`**:
- Accède à la table `projects` (clé étrangère vers `users.id_users`).

---

### 6. Tags (`tagRoutes.js`, `tagController.js`, `tagModel.js`)

Base URL: `/api/tags` (protégé)

- **POST `/`**
  - Corps: `{ name, color? }`
  - Crée un tag lié au créateur (`created_by`).

- **GET `/`**
  - Liste tous les tags créés par l’utilisateur.

- **GET `/:id`**
  - Retourne un tag de l’utilisateur.

- **PUT `/:id`**
  - Corps: `{ name, color }`
  - Met à jour un tag de l’utilisateur.

- **DELETE `/:id`**
  - Supprime le tag + ses associations dans `note_tags`.

- **POST `/note/:noteId/tag/:tagId`**
  - Ajoute un tag à une note (`note_tags`).

- **DELETE `/note/:noteId/tag/:tagId`**
  - Retire le tag d’une note.

- **GET `/note/:noteId`**
  - Liste les tags d’une note.

- **GET `/:tagId/notes`**
  - Liste les notes de l’utilisateur qui possèdent ce tag.

**Modèle `tagModel.js`**:
- Utilise les tables `tags` et `note_tags` (avec des noms de colonnes adaptés au script SQL).

---

### 7. Partage de notes (`shareRoutes.js`, `shareController.js`, `shareModel.js`)

Base URL: `/api/share` (protégé)

- **POST `/note/:noteId`**
  - Corps: `{ userEmail, permission }` où `permission` ∈ `read | write`.
  - Vérifie que l’appelant est **propriétaire** de la note (`canAccessNote` avec `isOwner`).
  - Cherche l’utilisateur par email (`userModel.findUserByEmail`).
  - Insère dans `note_shares`.

- **DELETE `/note/:noteId/user/:userId`**
  - Supprime un partage pour un utilisateur donné (si owner).

- **PUT `/note/:noteId/user/:userId`**
  - Met à jour la permission d’un partage (`read`/`write`) si owner.

- **GET `/notes`**
  - Retourne les notes partagées **avec** l’utilisateur connecté.

- **GET `/note/:noteId`**
  - Liste les utilisateurs avec qui une note est partagée (si owner).

- **GET `/accessible`**
  - Retourne toutes les notes **accessibles** par l’utilisateur (propriétaire + partagées), avec un champ `access_type` (`owner` ou `shared`) et `permission`.

**Modèle `shareModel.js`**:
- `shareNote`, `unshareNote`, `getSharedNotes`, `getNoteShares`.
- `canAccessNote`:
  - Vérifie d’abord si l’utilisateur est propriétaire (`notes.id_users`),
  - Sinon, vérifie la présence dans `note_shares`.
- `getAllAccessibleNotes`:
  - Fait un `UNION` entre les notes de l’utilisateur et celles partagées avec lui.

---

### 8. Commentaires (`commentRoutes.js`, `commentController.js`, `commentModel.js`)

Base URL: `/api/comments` (protégé)

- **POST `/note/:noteId`**
  - Corps: `{ content }`
  - Vérifie via `canCommentNote` que l’utilisateur peut commenter la note (owner ou partage).
  - Crée un commentaire dans `comments`.

- **GET `/note/:noteId`**
  - Retourne tous les commentaires d’une note + un `count`.

- **GET `/recent?limit=10`**
  - Retourne les commentaires récents faits par l’utilisateur connecté.

- **GET `/:commentId`**
  - Récupère un commentaire spécifique (et vérifie l’accès à la note liée).

- **PUT `/:commentId`**
  - Met à jour un commentaire si l’utilisateur en est l’auteur.

- **DELETE `/:commentId`**
  - Supprime un commentaire si l’utilisateur en est l’auteur.

**Modèle `commentModel.js`**:
- Joint `users` et `notes` pour enrichir les commentaires (auteur, titre de la note, etc.).
- `canCommentNote` s’appuie sur `notes` + `note_shares`.

---

### 9. Lien avec le frontend

Le frontend Vue (`memory-login`) consomme cette API via `src/services/api.js` :
- `authAPI` → `/api/register`, `/api/login`, `/api/profile`
- `notesAPI` → `/api/notes/...` et `/api/share/accessible`
- `projectsAPI` → `/api/projects/...`
- `tagsAPI` → `/api/tags/...`
- `shareAPI` → `/api/share/...`
- `commentsAPI` → `/api/comments/...`

Les JWT sont stockés dans `localStorage` (`authToken`) et ajoutés automatiquement via un intercepteur Axios.

---

### 10. Démarrage

1. Créer la base de données MySQL et exécuter le script `SQL/db.sql`.
2. Configurer `.env` avec au minimum :
   - `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
   - `JWT_SECRET`
3. Installer les dépendances dans `poc 3` :
   - `npm install`
4. Lancer l’API :
   - `npm run dev` (nodemon) ou `npm start`.


