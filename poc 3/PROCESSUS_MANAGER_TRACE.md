# 🎯 TRAÇAGE PROCESSUS: Manager Crée Projet + Partage

## 👤 **CONTEXTE**
- **Utilisateur**: Manager (role_id = 2)
- **Permissions**: `view_projects`, `create_notes`, `edit_notes`, `comment_notes`, `manage_tags`, `manage_projects`, `manage_project_members`

---

## 🚀 **PROCESSUS 1: Manager Crée un Projet**

### 📝 **Étape 1: Création du Projet**
```
Frontend → POST /api/projects
↓
authMiddleware.protect (vérifie JWT) ✅
↓
rbacMiddleware.can('manage_projects') 
  → rbac.hasPermission(userId=X, 'manage_projects')
  → Query: SELECT 1 FROM users u JOIN role_permissions rp ON u.role_id = rp.role_id 
           JOIN permissions p ON rp.permission_id = p.permission_id
           WHERE u.user_id = X AND p.permission_name = 'manage_projects'
  → Result: ✅ Manager a cette permission
↓
projectController.createProjectController
  → projectModel.createProject(nom, description, userId)
  → INSERT INTO projects (project_name, description, user_id)
↓
Response: 201 Created { projectId, message: "Projet créé" }
```

### 📝 **Étape 2: Ajouter Membres au Projet**
```
Frontend → POST /api/projects/:projectId/members
Body: { userId: 456, role: 'member' }
↓
authMiddleware.protect ✅
↓
rbacMiddleware.can('manage_project_members')
  → rbac.hasPermission(userId, 'manage_project_members') ✅ Manager a cette permission
↓
projectController.addProjectMemberController
  → projectModel.addProjectMember(projectId, userId, role, requesterId)
  → Vérifie: requester est propriétaire OU admin
  → INSERT INTO project_members (project_id, user_id, role)
↓
Response: 201 Created { message: "Membre ajouté" }
```

---

## 🔄 **PROCESSUS 2: Manager Partage une Note**

### 📝 **Étape 1: Créer Note dans Projet**
```
Frontend → POST /api/notes/note
Body: { title, content, projectId }
↓
authMiddleware.protect ✅
↓
rbacMiddleware.can('create_notes')
  → rbac.hasPermission(userId, 'create_notes') ✅ Manager a cette permission
↓
noteController.createNoteController
  → noteModel.createNote(title, content, userId, projectId)
  → INSERT INTO notes (title, content, user_id, project_id)
↓
Response: 201 Created { noteId, message: "Note créée" }
```

### 📝 **Étape 2: Partage Direct avec Utilisateur**
```
Frontend → POST /api/shares/note/:noteId
Body: { recipientId, permission: 'read' }
↓
authMiddleware.protect ✅
↓
rbacMiddleware.can('create_notes') (pas de permission spécifique pour partage)
↓
shareController.shareNoteController
  → Vérifie: user est propriétaire de la note OU admin
  → shareModel.shareNote(noteId, userId, recipientId, permission)
  → INSERT INTO note_shares (note_id, shared_by, user_id, permission)
↓
Response: 201 Created { message: "Note partagée" }
```

---

## ✅ **ANALYSE CRITIQUE**

### 🎯 **Points Forts**
- **RBAC cohérent** sur toutes les étapes
- **Permissions granulaires** respectées
- **Logique contextuelle** (propriétaire) préservée

### ⚠️ **Points d'Amélioration**
- **Partage de notes** : Pas de permission RBAC spécifique comme `'share_notes'`
- **Double vérification** : RBAC middleware + logique contextuelle dans models

### 🔧 **Optimisations Possibles**
1. Ajouter permission `'share_notes'` pour plus de granularité
2. Simplifier logique contextuelle puisque RBAC filtre déjà

---

**📊 Conclusion**: Processus Manager fonctionne bien avec RBAC, respect des permissions et logique métier claire.