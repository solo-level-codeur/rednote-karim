# 🚀 Elite Memory - Documentation API Complète

## 📋 Vue d'ensemble

Cette documentation présente l'analyse complète du backend Elite Memory, incluant toutes les requêtes SQL, leurs routes associées, et les écarts avec le schéma de base de données.

### 🔧 Structure Backend
- **Backend**: Node.js + Express + MySQL
- **Authentification**: JWT
- **Architecture**: MVC (Models-Views-Controllers)
- **Base de données**: MySQL avec InnoDB

---

## ⚠️ Problèmes Critiques Identifiés

### 🚨 Incohérence Schéma de Base de Données

**Problème majeur** : Le code utilise des noms de colonnes différents du schéma original :

| **Code Backend** | **Schéma memory.sql** |
|------------------|------------------------|
| `id_users` | `user_id` |
| `id_projects` | `project_id` |
| `id_notes` | `note_id` |
| `id_tags` | `tag_id` |
| `id_roles` | `role_id` |

**Impact** : Les requêtes SQL échoueront avec le schéma actuel.

---

## 🗂️ Documentation des APIs

### 1. 👤 GESTION DES UTILISATEURS (`/api/users/`)

#### **POST** `/api/users/register` - Inscription
**Contrôleur** : `registerUser`  
**Middleware** : Aucun  

**Requêtes SQL** :
```sql
-- Vérifier si l'utilisateur existe
SELECT * FROM users WHERE email = ?

-- Créer un nouvel utilisateur
INSERT INTO users (firstname, lastname, email, password, id_roles) VALUES (?, ?, ?, ?, ?)
```

**Body** :
```json
{
  "firstname": "string",
  "lastname": "string", 
  "email": "string",
  "password": "string"
}
```

---

#### **POST** `/api/users/login` - Connexion
**Contrôleur** : `loginUser`  
**Middleware** : Aucun  

**Requêtes SQL** :
```sql
-- Trouver l'utilisateur par email
SELECT * FROM users WHERE email = ?
```

**Body** :
```json
{
  "email": "string",
  "password": "string"
}
```

**Response** :
```json
{
  "token": "jwt_token",
  "user": {
    "id": 1,
    "firstname": "John",
    "lastname": "Doe",
    "email": "john@example.com"
  }
}
```

---

#### **GET** `/api/users/profile` - Profil utilisateur
**Contrôleur** : `getUserProfile`  
**Middleware** : `protect`  

**Requêtes SQL** :
```sql
-- Profil complet
SELECT id_users, firstname, lastname, email, id_roles, bio, job_title, 
       department, phone, avatar_url, linkedin_url, github_url, created_at 
FROM users WHERE id_users = ?

-- Profil basique (fallback)
SELECT id_users, firstname, lastname, email, id_roles, created_at 
FROM users WHERE id_users = ?
```

---

#### **GET** `/api/users/profile/stats` - Profil avec statistiques
**Contrôleur** : `getUserProfileWithStats`  
**Middleware** : `protect`  

**Requêtes SQL** :
```sql
-- Profil utilisateur avec rôle
SELECT u.id_users, u.firstname, u.lastname, u.email, u.bio, u.job_title, 
       u.department, u.phone, u.avatar_url, u.linkedin_url, u.github_url, 
       u.created_at, r.role_name as role
FROM users u 
LEFT JOIN roles r ON u.id_roles = r.id 
WHERE u.id_users = ?

-- Compter les notes de l'utilisateur
SELECT COUNT(*) as total_notes FROM notes WHERE id_users = ?

-- Compter les projets de l'utilisateur
SELECT COUNT(*) as total_projects FROM project_members WHERE id_users = ?

-- Compter les commentaires de l'utilisateur
SELECT COUNT(*) as total_comments FROM comments WHERE id_users = ?

-- Compter les notes partagées
SELECT COUNT(*) as shared_notes FROM note_shares WHERE id_users = ?
```

---

#### **PUT** `/api/users/profile` - Mettre à jour le profil
**Contrôleur** : `updateUserProfile`  
**Middleware** : `protect`  

**Requêtes SQL** :
```sql
-- Mettre à jour le profil utilisateur
UPDATE users SET firstname = ?, lastname = ?, email = ?, bio = ?, 
                 job_title = ?, department = ?, phone = ?, avatar_url = ?, 
                 linkedin_url = ?, github_url = ? 
WHERE id_users = ?
```

---

#### **GET** `/api/users/admin/users` - Liste des utilisateurs (Admin)
**Contrôleur** : `getAllUsers`  
**Middleware** : `protect` + `requireAdmin`  

**Requêtes SQL** :
```sql
-- Obtenir tous les utilisateurs avec leurs rôles
SELECT u.id_users, u.firstname, u.lastname, u.email, u.created_at, r.role_name 
FROM users u LEFT JOIN roles r ON u.id_roles = r.id 
ORDER BY u.created_at DESC
```

---

#### **PUT** `/api/users/admin/users/role` - Mettre à jour un rôle (Admin)
**Contrôleur** : `updateUserRole`  
**Middleware** : `protect` + `requireAdmin`  

**Requêtes SQL** :
```sql
-- Mettre à jour le rôle utilisateur
UPDATE users SET id_roles = ? WHERE id_users = ?
```

---

#### **DELETE** `/api/users/admin/users/:userId` - Supprimer un utilisateur (Admin)
**Contrôleur** : `deleteUser`  
**Middleware** : `protect` + `requireAdmin`  

**Requêtes SQL** :
```sql
-- Supprimer l'utilisateur
DELETE FROM users WHERE id_users = ?
```

---

### 2. 📝 GESTION DES NOTES (`/api/notes/`)

#### **GET** `/api/notes/` - Toutes les notes de l'utilisateur
**Contrôleur** : `getAllNotes`  
**Middleware** : `protect`  

**Requêtes SQL** :
```sql
-- Obtenir toutes les notes de l'utilisateur
SELECT * FROM notes WHERE id_users = ?
```

---

#### **GET** `/api/notes/project/:projectId` - Notes d'un projet
**Contrôleur** : `getAllNotesFromProject`  
**Middleware** : `protect`  

**Requêtes SQL** :
```sql
-- Vérifier l'accès au projet
SELECT 1 FROM projects p
LEFT JOIN project_members pm ON p.id = pm.id_projects
WHERE p.id = ? AND (p.id_owner = ? OR pm.id_users = ?)
LIMIT 1

-- Obtenir les notes du projet avec infos auteur
SELECT n.*, 
       u.firstname as author_firstname,
       u.lastname as author_lastname,
       p.name as project_name,
       CASE WHEN n.id_users = ? THEN 'owner' ELSE 'member' END as note_role
FROM notes n
INNER JOIN users u ON n.id_users = u.id_users
INNER JOIN projects p ON n.id_projects = p.id
WHERE n.id_projects = ?
ORDER BY n.updated_date DESC
```

---

#### **GET** `/api/notes/note/:id` - Note spécifique
**Contrôleur** : `getNoteById`  
**Middleware** : `protect` + `authorizeNoteOwner`  

**Requêtes SQL** :
```sql
-- Obtenir une note spécifique
SELECT * FROM notes WHERE id = ? AND id_users = ?
```

---

#### **POST** `/api/notes/note` - Créer une note
**Contrôleur** : `createNote`  
**Middleware** : `protect`  

**Requêtes SQL** :
```sql
-- Vérifier le projet par défaut
SELECT id FROM projects WHERE name = "Projet par défaut" AND id_owner = ? LIMIT 1

-- Créer un projet par défaut si nécessaire
INSERT INTO projects (name, description, creation_date, id_owner) VALUES (?, ?, CURDATE(), ?)

-- Créer la note
INSERT INTO notes (title, content, id_users, id_projects) VALUES (?, ?, ?, ?)
```

**Body** :
```json
{
  "title": "string",
  "content": "string",
  "projectId": "number (optional)"
}
```

---

#### **PUT** `/api/notes/note/:id` - Mettre à jour une note
**Contrôleur** : `updateNote`  
**Middleware** : `protect` + `authorizeNoteOwner`  

**Requêtes SQL** :
```sql
-- ⚠️ PROBLÈME IDENTIFIÉ : Ne supporte pas id_projects
-- Requête actuelle (incomplète)
UPDATE notes SET title = ?, content = ? WHERE id = ? AND id_users = ?

-- 🔧 CORRECTION NÉCESSAIRE :
-- UPDATE notes SET title = ?, content = ?, id_projects = ? WHERE id = ? AND id_users = ?
```

**Body** :
```json
{
  "title": "string",
  "content": "string",
  "id_projects": "number (optional - NON SUPPORTÉ ACTUELLEMENT)"
}
```

---

#### **DELETE** `/api/notes/note/:id` - Supprimer une note
**Contrôleur** : `deleteNote`  
**Middleware** : `protect` + `authorizeNoteOwner`  

**Requêtes SQL** :
```sql
-- Supprimer les données liées d'abord
DELETE FROM note_tags WHERE id_notes = ?
DELETE FROM note_shares WHERE id_notes = ?
DELETE FROM comments WHERE id_notes = ?
DELETE FROM note_documents WHERE id_notes = ?

-- Supprimer la note
DELETE FROM notes WHERE id = ? AND id_users = ?
```

---

#### **GET** `/api/notes/search` - Rechercher des notes
**Contrôleur** : `searchNotes`  
**Middleware** : `protect`  

**Query Parameters** :
- `q` (required) : terme de recherche
- `projectId` (optional) : filtrer par projet

**Requêtes SQL** :
```sql
-- Rechercher des notes
SELECT n.*, p.name as project_name 
FROM notes n 
LEFT JOIN projects p ON n.id_projects = p.id 
WHERE n.id_users = ? 
AND (n.title LIKE ? OR n.content LIKE ?)
-- Condition optionnelle :
AND n.id_projects = ?  -- si projectId fourni
ORDER BY n.updated_date DESC
```

---

#### **GET** `/api/notes/filter` - Filtrer des notes
**Contrôleur** : `getNotesWithFilters`  
**Middleware** : `protect`  

**Query Parameters** :
- `projectId` (optional) : ID du projet
- `dateFrom` (optional) : date début (YYYY-MM-DD)
- `dateTo` (optional) : date fin (YYYY-MM-DD)
- `sortBy` (optional) : tri (title, creation_date, updated_date)
- `sortOrder` (optional) : ordre (ASC, DESC)
- `limit` (optional) : limite résultats

**Requêtes SQL** :
```sql
-- Filtrer les notes
SELECT n.*, p.name as project_name 
FROM notes n 
LEFT JOIN projects p ON n.id_projects = p.id 
WHERE n.id_users = ?
-- Conditions optionnelles :
AND n.id_projects = ?      -- si projectId fourni
AND n.creation_date >= ?   -- si dateFrom fourni
AND n.creation_date <= ?   -- si dateTo fourni
ORDER BY n.{sortBy} {sortOrder}
LIMIT ?                    -- si limit fourni
```

---

### 3. 📁 GESTION DES PROJETS (`/api/projects/`)

#### **POST** `/api/projects` - Créer un projet
**Contrôleur** : `createProject`  
**Middleware** : `protect`  

**Requêtes SQL** :
```sql
-- Créer un projet
INSERT INTO projects (name, description, creation_date, id_owner) VALUES (?, ?, CURDATE(), ?)
```

**Body** :
```json
{
  "name": "string",
  "description": "string"
}
```

---

#### **GET** `/api/projects` - Tous les projets de l'utilisateur
**Contrôleur** : `getAllProjects`  
**Middleware** : `protect`  

**Requêtes SQL** :
```sql
-- Obtenir les projets de l'utilisateur (propriétaire + membre)
SELECT DISTINCT p.*, 
       CASE WHEN p.id_owner = ? THEN 'owner' ELSE 'member' END as user_role
FROM projects p
LEFT JOIN project_members pm ON p.id = pm.id_projects
WHERE p.id_owner = ? OR pm.id_users = ?
ORDER BY p.name ASC
```

---

#### **GET** `/api/projects/:id` - Projet spécifique
**Contrôleur** : `getProjectById`  
**Middleware** : `protect`  

**Requêtes SQL** :
```sql
-- Obtenir un projet spécifique
SELECT * FROM projects WHERE id = ? AND id_owner = ?
```

---

#### **PUT** `/api/projects/:id` - Mettre à jour un projet
**Contrôleur** : `updateProject`  
**Middleware** : `protect`  

**Requêtes SQL** :
```sql
-- Mettre à jour un projet
UPDATE projects SET name = ?, description = ?, status = ? WHERE id = ? AND id_owner = ?
```

---

#### **DELETE** `/api/projects/:id` - Supprimer un projet
**Contrôleur** : `deleteProject`  
**Middleware** : `protect`  

**Requêtes SQL** :
```sql
-- Supprimer un projet
DELETE FROM projects WHERE id = ? AND id_owner = ?
```

---

#### **POST** `/api/projects/:projectId/members` - Ajouter un membre
**Contrôleur** : `addProjectMember`  
**Middleware** : `protect`  

**Requêtes SQL** :
```sql
-- Ajouter un membre
INSERT INTO project_members (id_projects, id_users, role, joined_date) VALUES (?, ?, ?, CURDATE())

-- Si doublon, mettre à jour le rôle
UPDATE project_members SET role = ? WHERE id_projects = ? AND id_users = ?
```

**Body** :
```json
{
  "userId": "number",
  "role": "string"
}
```

---

#### **DELETE** `/api/projects/:projectId/members/:userId` - Supprimer un membre
**Contrôleur** : `removeProjectMember`  
**Middleware** : `protect`  

**Requêtes SQL** :
```sql
-- Vérifier la propriété
SELECT 1 FROM projects WHERE id = ? AND id_owner = ?

-- Supprimer le membre
DELETE FROM project_members WHERE id_projects = ? AND id_users = ?
```

---

#### **GET** `/api/projects/:projectId/members` - Liste des membres
**Contrôleur** : `getProjectMembers`  
**Middleware** : `protect`  

**Requêtes SQL** :
```sql
-- Vérifier l'accès
SELECT 1 FROM projects p
LEFT JOIN project_members pm ON p.id = pm.id_projects
WHERE p.id = ? AND (p.id_owner = ? OR pm.id_users = ?)
LIMIT 1

-- Obtenir les membres
SELECT 
  u.id_users as id,
  u.firstname,
  u.lastname, 
  u.email,
  pm.role,
  pm.joined_date,
  CASE WHEN p.id_owner = u.id_users THEN 'owner' ELSE 'member' END as user_type
FROM users u
LEFT JOIN project_members pm ON u.id_users = pm.id_users AND pm.id_projects = ?
INNER JOIN projects p ON p.id = ?
WHERE (p.id_owner = u.id_users OR pm.id_users IS NOT NULL)
ORDER BY 
  CASE WHEN p.id_owner = u.id_users THEN 0 ELSE 1 END,
  pm.joined_date ASC
```

---

#### **PUT** `/api/projects/:projectId/members/:userId` - Mettre à jour rôle membre
**Contrôleur** : `updateMemberRole`  
**Middleware** : `protect`  

**Requêtes SQL** :
```sql
-- Vérifier la propriété
SELECT 1 FROM projects WHERE id = ? AND id_owner = ?

-- Mettre à jour le rôle
UPDATE project_members SET role = ? WHERE id_projects = ? AND id_users = ?
```

---

### 4. 🏷️ GESTION DES TAGS (`/api/tags/`)

#### **POST** `/api/tags` - Créer un tag
**Contrôleur** : `createTag`  
**Middleware** : `protect`  

**Requêtes SQL** :
```sql
-- Créer un tag
INSERT INTO tags (name, color) VALUES (?, ?)
```

**Body** :
```json
{
  "name": "string",
  "color": "string (hex color)"
}
```

---

#### **GET** `/api/tags` - Tous les tags
**Contrôleur** : `getAllTags`  
**Middleware** : `protect`  

**Requêtes SQL** :
```sql
-- Obtenir tous les tags
SELECT * FROM tags ORDER BY name
```

---

#### **GET** `/api/tags/:id` - Tag spécifique
**Contrôleur** : `getTagById`  
**Middleware** : `protect`  

**Requêtes SQL** :
```sql
-- Obtenir un tag spécifique
SELECT * FROM tags WHERE id = ?
```

---

#### **PUT** `/api/tags/:id` - Mettre à jour un tag
**Contrôleur** : `updateTag`  
**Middleware** : `protect`  

**Requêtes SQL** :
```sql
-- Mettre à jour un tag
UPDATE tags SET name = ?, color = ? WHERE id = ?
```

---

#### **DELETE** `/api/tags/:id` - Supprimer un tag
**Contrôleur** : `deleteTag`  
**Middleware** : `protect`  

**Requêtes SQL** :
```sql
-- Supprimer les associations d'abord
DELETE FROM note_tags WHERE id_tags = ?

-- Supprimer le tag
DELETE FROM tags WHERE id = ?
```

---

#### **POST** `/api/tags/note/:noteId/tag/:tagId` - Ajouter tag à une note
**Contrôleur** : `addTagToNote`  
**Middleware** : `protect`  

**Requêtes SQL** :
```sql
-- Ajouter un tag à une note
INSERT IGNORE INTO note_tags (id_notes, id_tags) VALUES (?, ?)
```

---

#### **DELETE** `/api/tags/note/:noteId/tag/:tagId` - Supprimer tag d'une note
**Contrôleur** : `removeTagFromNote`  
**Middleware** : `protect`  

**Requêtes SQL** :
```sql
-- Supprimer un tag d'une note
DELETE FROM note_tags WHERE id_notes = ? AND id_tags = ?
```

---

#### **GET** `/api/tags/note/:noteId` - Tags d'une note
**Contrôleur** : `getNoteTags`  
**Middleware** : `protect`  

**Requêtes SQL** :
```sql
-- Obtenir les tags d'une note
SELECT t.* FROM tags t 
INNER JOIN note_tags nt ON t.id = nt.id_tags 
WHERE nt.id_notes = ?
```

---

#### **GET** `/api/tags/:tagId/notes` - Notes avec un tag spécifique
**Contrôleur** : `getNotesByTag`  
**Middleware** : `protect`  

**Requêtes SQL** :
```sql
-- Obtenir les notes avec un tag spécifique
SELECT n.*, p.name as project_name 
FROM notes n 
LEFT JOIN projects p ON n.id_projects = p.id
INNER JOIN note_tags nt ON n.id = nt.id_notes 
WHERE nt.id_tags = ? AND n.id_users = ?
ORDER BY n.updated_date DESC
```

---

### 5. 🤝 GESTION DU PARTAGE (`/api/share/`)

#### **POST** `/api/share/note/:noteId` - Partager une note
**Contrôleur** : `shareNote`  
**Middleware** : `protect`  

**Requêtes SQL** :
```sql
-- Partager une note
INSERT INTO note_shares (id_notes, id_users, shared_by, permission, shared_date) VALUES (?, ?, ?, ?, NOW())
```

**Body** :
```json
{
  "email": "string",
  "permission": "read|write"
}
```

---

#### **DELETE** `/api/share/note/:noteId/user/:userId` - Arrêter le partage
**Contrôleur** : `unshareNote`  
**Middleware** : `protect`  

**Requêtes SQL** :
```sql
-- Arrêter le partage d'une note
DELETE FROM note_shares WHERE id_notes = ? AND id_users = ? AND shared_by = ?
```

---

#### **GET** `/api/share/notes` - Notes partagées avec moi
**Contrôleur** : `getSharedNotes`  
**Middleware** : `protect`  

**Requêtes SQL** :
```sql
-- Obtenir les notes partagées avec l'utilisateur
SELECT 
  n.*,
  ns.permission,
  ns.shared_date,
  u.firstname as shared_by_firstname,
  u.lastname as shared_by_lastname,
  p.name as project_name
FROM notes n
INNER JOIN note_shares ns ON n.id = ns.id_notes
INNER JOIN users u ON ns.shared_by = u.id_users
LEFT JOIN projects p ON n.id_projects = p.id
WHERE ns.id_users = ?
ORDER BY ns.shared_date DESC
```

---

#### **GET** `/api/share/note/:noteId` - Informations de partage d'une note
**Contrôleur** : `getNoteShares`  
**Middleware** : `protect`  

**Requêtes SQL** :
```sql
-- Obtenir les informations de partage d'une note
SELECT 
  u.id_users,
  u.firstname,
  u.lastname,
  u.email,
  ns.permission,
  ns.shared_date
FROM note_shares ns
INNER JOIN users u ON ns.id_users = u.id_users
WHERE ns.id_notes = ? AND ns.shared_by = ?
```

---

#### **PUT** `/api/share/note/:noteId/user/:userId` - Mettre à jour permissions
**Contrôleur** : `updateSharePermission`  
**Middleware** : `protect`  

**Requêtes SQL** :
```sql
-- Mettre à jour les permissions de partage
UPDATE note_shares SET permission = ? WHERE id_notes = ? AND id_users = ? AND shared_by = ?
```

---

#### **GET** `/api/share/accessible` - Toutes les notes accessibles
**Contrôleur** : `getAllAccessibleNotes`  
**Middleware** : `protect`  

**Query Parameters** :
- `projectId` (optional) : filtrer par projet

**Requêtes SQL** :
```sql
-- Obtenir toutes les notes accessibles (possédées + partagées)
SELECT 
  n.*,
  p.name as project_name,
  'owner' as access_type,
  'write' as permission
FROM notes n
LEFT JOIN projects p ON n.id_projects = p.id
WHERE n.id_users = ?
-- Condition optionnelle :
AND n.id_projects = ?  -- si projectId fourni

UNION

SELECT 
  n.*,
  p.name as project_name,
  'shared' as access_type,
  ns.permission
FROM notes n
INNER JOIN note_shares ns ON n.id = ns.id_notes
LEFT JOIN projects p ON n.id_projects = p.id
WHERE ns.id_users = ?
-- Condition optionnelle :
AND n.id_projects = ?  -- si projectId fourni

ORDER BY updated_date DESC
```

---

### 6. 💬 GESTION DES COMMENTAIRES (`/api/comments/`)

#### **POST** `/api/comments/note/:noteId` - Créer un commentaire
**Contrôleur** : `createComment`  
**Middleware** : `protect`  

**Requêtes SQL** :
```sql
-- Créer un commentaire
INSERT INTO comments (content, comment_date, id_notes, id_users) VALUES (?, NOW(), ?, ?)
```

**Body** :
```json
{
  "content": "string"
}
```

---

#### **GET** `/api/comments/note/:noteId` - Commentaires d'une note
**Contrôleur** : `getCommentsByNote`  
**Middleware** : `protect`  

**Requêtes SQL** :
```sql
-- Obtenir les commentaires d'une note
SELECT 
  c.*,
  u.firstname,
  u.lastname,
  u.email
FROM comments c
INNER JOIN users u ON c.id_users = u.id_users
WHERE c.id_notes = ?
ORDER BY c.comment_date ASC
```

---

#### **GET** `/api/comments/:commentId` - Commentaire spécifique
**Contrôleur** : `getCommentById`  
**Middleware** : `protect`  

**Requêtes SQL** :
```sql
-- Obtenir un commentaire spécifique
SELECT 
  c.*,
  u.firstname,
  u.lastname,
  u.email,
  n.title as note_title
FROM comments c
INNER JOIN users u ON c.id_users = u.id_users
INNER JOIN notes n ON c.id_notes = n.id
WHERE c.id = ?
```

---

#### **PUT** `/api/comments/:commentId` - Mettre à jour un commentaire
**Contrôleur** : `updateComment`  
**Middleware** : `protect`  

**Requêtes SQL** :
```sql
-- Mettre à jour un commentaire
UPDATE comments SET content = ?, comment_date = NOW() WHERE id = ? AND id_users = ?
```

---

#### **DELETE** `/api/comments/:commentId` - Supprimer un commentaire
**Contrôleur** : `deleteComment`  
**Middleware** : `protect`  

**Requêtes SQL** :
```sql
-- Supprimer un commentaire
DELETE FROM comments WHERE id = ? AND id_users = ?
```

---

#### **GET** `/api/comments/recent` - Commentaires récents
**Contrôleur** : `getRecentComments`  
**Middleware** : `protect`  

**Query Parameters** :
- `limit` (optional, default: 10) : nombre maximum de commentaires

**Requêtes SQL** :
```sql
-- Obtenir les commentaires récents de l'utilisateur
SELECT 
  c.*,
  n.title as note_title,
  n.id as note_id,
  n.id_users as note_owner_id
FROM comments c
INNER JOIN notes n ON c.id_notes = n.id
WHERE c.id_users = ?
ORDER BY c.comment_date DESC
LIMIT ?
```

---

## 🔒 Middlewares de Sécurité

### `protect` - Authentification JWT
Vérifie la présence et la validité du token JWT dans l'en-tête `Authorization: Bearer <token>`.

### `authorizeNoteOwner` - Propriétaire de note
Vérifie que l'utilisateur authentifié est le propriétaire de la note.

**Requêtes SQL** :
```sql
-- Vérifier la propriété de la note
SELECT id FROM notes WHERE id = ? AND id_users = ?
```

### `requireAdmin` - Accès administrateur
Vérifie que l'utilisateur a le rôle administrateur.

---

## 🔧 Corrections Nécessaires

### 1. ⚠️ Mise à jour de notes avec projets
**Problème** : `PUT /api/notes/note/:id` ne supporte pas la mise à jour de `id_projects`.

**Solution** :
```javascript
// Dans noteController.js
const { title, content, id_projects } = req.body;
// Dans noteModel.js
const updateNote = async (id, title, content, id_projects, userId) => {
  const [result] = await db.query(
    'UPDATE notes SET title = ?, content = ?, id_projects = ? WHERE id = ? AND id_users = ?', 
    [title, content, id_projects, id, userId]
  );
  return result.affectedRows;
};
```

### 2. ⚠️ Incohérence des noms de colonnes
**Solution** : Mettre à jour le schéma SQL pour utiliser les noms de colonnes du code :

```sql
-- Exemple pour la table users
ALTER TABLE users CHANGE user_id id_users INT NOT NULL AUTO_INCREMENT;
-- Répéter pour toutes les tables concernées
```

### 3. ⚠️ Tables manquantes
Ajouter les tables manquantes pour la gestion des rôles et des fonctionnalités avancées.

---

## 📊 Résumé de l'API

### Structure des Routes
- **Utilisateurs** : 7 endpoints
- **Notes** : 8 endpoints  
- **Projets** : 8 endpoints
- **Tags** : 8 endpoints
- **Partage** : 6 endpoints
- **Commentaires** : 6 endpoints

**Total** : **43 endpoints API**

### Sécurité
- **JWT** pour l'authentification
- **Middlewares** de protection par route
- **Contrôle d'accès** basé sur la propriété et les permissions

### Performance
- **Requêtes optimisées** avec jointures appropriées
- **Index** recommandés sur les clés étrangères
- **Pagination** disponible sur certains endpoints

---

## 🚀 Recommandations

### Priorités de correction :
1. **Corriger les noms de colonnes** dans la base de données
2. **Ajouter support id_projects** dans updateNote
3. **Valider toutes les requêtes** avec le nouveau schéma
4. **Ajouter des index** pour optimiser les performances
5. **Implémenter la pagination** sur tous les endpoints de liste

Cette documentation complète permet de comprendre l'intégralité de l'API Elite Memory et d'identifier les corrections nécessaires pour un fonctionnement optimal.