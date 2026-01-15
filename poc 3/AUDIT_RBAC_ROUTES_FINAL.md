# 🔍 AUDIT COMPLET RBAC - TOUTES LES ROUTES

## 📊 **MATRICE PERMISSIONS THÉORIQUE**

| Permission | Admin(1) | Manager(2) | Developer(3) | Viewer(4) |
|------------|----------|------------|--------------|-----------|
| `view_projects` | ✅ | ✅ | ✅ | ✅ |
| `create_notes` | ✅ | ✅ | ✅ | ❌ |
| `edit_notes` | ✅ | ✅ | ✅ | ❌ |
| `comment_notes` | ✅ | ✅ | ✅ | ✅ |
| `manage_tags` | ✅ | ✅ | ✅ | ❌ |
| `manage_projects` | ✅ | ✅ | ❌ | ❌ |
| `manage_project_members` | ✅ | ✅ | ❌ | ❌ |
| `manage_users` | ✅ | ❌ | ❌ | ❌ |
| `view_users` | ✅ | ✅ | ❌ | ❌ |

---

## 🛣️ **AUDIT TOUTES LES ROUTES PROTÉGÉES**

### 👤 **USER ROUTES** (`/api/users/`)

| Route | Méthode | Permission | Admin | Manager | Developer | Viewer |
|-------|---------|------------|-------|---------|-----------|--------|
| `/profile` | GET | `protect` seulement | ✅ | ✅ | ✅ | ✅ |
| `/profile/stats` | GET | `protect` seulement | ✅ | ✅ | ✅ | ✅ |
| `/profile` | PUT | `protect` seulement | ✅ | ✅ | ✅ | ✅ |
| `/admin/users` | GET | `view_users` | ✅ | ✅ | ❌ | ❌ |
| `/admin/users/role` | PUT | `manage_users` | ✅ | ❌ | ❌ | ❌ |
| `/admin/users/:userId` | DELETE | `manage_users` | ✅ | ❌ | ❌ | ❌ |

### 📝 **NOTE ROUTES** (`/api/notes/`)

| Route | Méthode | Permission | Admin | Manager | Developer | Viewer |
|-------|---------|------------|-------|---------|-----------|--------|
| `/` | GET | `protect` seulement | ✅ | ✅ | ✅ | ✅ |
| `/note` | POST | `create_notes` | ✅ | ✅ | ✅ | ❌ |
| `/note/:id` | GET | `authorizeNoteOwner` | ✅ | ✅ | ✅ | ✅* |
| `/note/:id` | PUT | `edit_notes` + `authorizeNoteEdit` | ✅ | ✅ | ✅ | ❌ |
| `/note/:id` | DELETE | `authorizeNoteDelete` | ✅ | ✅* | ✅* | ❌ |

### 🏢 **PROJECT ROUTES** (`/api/projects/`)

| Route | Méthode | Permission | Admin | Manager | Developer | Viewer |
|-------|---------|------------|-------|---------|-----------|--------|
| `/` | GET | `view_projects` | ✅ | ✅ | ✅ | ✅ |
| `/` | POST | `manage_projects` | ✅ | ✅ | ❌ | ❌ |
| `/user/:userId` | GET | `view_projects` | ✅ | ✅ | ✅ | ✅ |
| `/:id` | GET | `view_projects` | ✅ | ✅ | ✅ | ✅ |
| `/:id` | PUT | `manage_projects` | ✅ | ✅ | ❌ | ❌ |
| `/:id` | DELETE | `manage_projects` + `authorizeProjectDelete` | ✅ | ✅* | ❌ | ❌ |
| `/:id/members` | POST | `manage_project_members` | ✅ | ✅ | ❌ | ❌ |
| `/:projectId/members/:userId` | DELETE | `manage_project_members` | ✅ | ✅ | ❌ | ❌ |
| `/:projectId/members` | GET | `view_projects` | ✅ | ✅ | ✅ | ✅ |
| `/:projectId/members/:userId/role` | PUT | `manage_project_members` | ✅ | ✅ | ❌ | ❌ |

### 💬 **COMMENT ROUTES** (`/api/comments/`)

| Route | Méthode | Permission | Admin | Manager | Developer | Viewer |
|-------|---------|------------|-------|---------|-----------|--------|
| `/note/:noteId` | POST | `comment_notes` + `canCommentNote` | ✅ | ✅ | ✅ | ✅* |
| `/note/:noteId` | GET | `protect` seulement | ✅ | ✅ | ✅ | ✅ |
| `/recent` | GET | `protect` seulement | ✅ | ✅ | ✅ | ✅ |
| `/:commentId` | GET | `protect` seulement | ✅ | ✅ | ✅ | ✅ |
| `/:commentId` | PUT | `comment_notes` + contexte | ✅ | ✅ | ✅ | ✅* |
| `/:commentId` | DELETE | `comment_notes` + contexte | ✅ | ✅ | ✅ | ✅* |

### 🏷️ **TAG ROUTES** (`/api/tags/`)

| Route | Méthode | Permission | Admin | Manager | Developer | Viewer |
|-------|---------|------------|-------|---------|-----------|--------|
| `/` | GET | `protect` seulement | ✅ | ✅ | ✅ | ✅ |
| `/` | POST | `manage_tags` | ✅ | ✅ | ✅ | ❌ |
| `/:id` | GET | `protect` seulement | ✅ | ✅ | ✅ | ✅ |
| `/:id` | PUT | `manage_tags` | ✅ | ✅ | ✅ | ❌ |
| `/:id` | DELETE | `manage_tags` | ✅ | ✅ | ✅ | ❌ |

### 🔗 **SHARE ROUTES** (`/api/shares/`)

| Route | Méthode | Permission | Admin | Manager | Developer | Viewer |
|-------|---------|------------|-------|---------|-----------|--------|
| `/note/:noteId` | POST | `create_notes` + contexte | ✅ | ✅ | ✅ | ❌ |
| `/note/:noteId` | GET | `protect` + contexte | ✅ | ✅ | ✅ | ✅* |
| `/share/:shareId` | DELETE | `protect` + contexte | ✅ | ✅ | ✅ | ✅* |

---

## ⚠️ **LÉGENDE**

- ✅ **Accès garanti** par RBAC
- ❌ **Accès refusé** par RBAC  
- ✅* **Accès conditionnel** (dépend du contexte: propriétaire, membre, etc.)

---

## 🚨 **POINTS D'ATTENTION IDENTIFIÉS**

### 1. **Routes avec logique contextuelle complexe**
- Certaines routes combinent RBAC + vérifications contextuelles
- Peut créer confusion sur les permissions réelles

### 2. **Incohérences potentielles**
- Viewer peut commenter mais pas créer de notes
- Developer peut pas gérer projets mais peut être membre

### 3. **Sécurité**
- Suppression notes/projets = propriétaire seulement (bon)
- Admin peut bypass contextuels (normal)

**Veux-tu que j'exécute le script SQL de vérification pour valider la base de données ?**