# 👥 TRAÇAGE PROCESSUS POUR TOUS LES RÔLES

## 🎯 **MATRICE PERMISSIONS PAR RÔLE**

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

---

## 👑 **ADMIN (role_id = 1) - ACCÈS TOTAL**

### ✅ **Peut Faire**
```
✅ Tout voir/faire sur tous les projets (bypass contextuel)
✅ Créer/modifier/supprimer notes de n'importe qui
✅ Gérer tous les projets et leurs membres  
✅ Gérer tous les utilisateurs et leurs rôles
✅ Accéder à toutes les fonctionnalités admin
```

### 🔄 **Processus Type: Admin supprime note d'un autre utilisateur**
```
Frontend → DELETE /api/notes/note/123
↓
authMiddleware.protect ✅
↓
authMiddleware.authorizeNoteDelete 
  → hasPermission(userId, 'manage_users') ✅ Admin bypass
↓
noteController.deleteNoteController ✅ Suppression réussie
```

---

## 🏢 **MANAGER (role_id = 2) - GESTION ÉQUIPE**

### ✅ **Peut Faire**
```
✅ Créer/gérer projets et ajouter/retirer membres
✅ Créer/modifier notes + gérer tags
✅ Voir tous les projets où il est membre/propriétaire
✅ Commenter toutes les notes accessibles
```

### ❌ **Ne Peut PAS Faire**
```
❌ Gérer utilisateurs (créer/supprimer comptes)
❌ Accéder aux notes/projets dont il n'est pas membre
❌ Modifier paramètres système globaux
```

### 🔄 **Processus Type: Manager invite Developer à son projet**
```
POST /api/projects/456/members { userId: 789, role: 'member' }
↓
can('manage_project_members') ✅ Manager a cette permission
↓ 
Vérifie: Manager est propriétaire du projet 456 ✅
↓
Ajoute Developer comme membre ✅
```

---

## 💻 **DEVELOPER (role_id = 3) - CRÉATION CONTENU**

### ✅ **Peut Faire**
```
✅ Créer/modifier ses propres notes + tags
✅ Modifier notes des projets dont il est membre
✅ Commenter notes accessibles
✅ Voir projets où il est invité
```

### ❌ **Ne Peut PAS Faire**
```
❌ Créer/gérer projets ou leurs membres
❌ Gérer utilisateurs ou rôles
❌ Accéder aux notes privées d'autres utilisateurs
❌ Supprimer notes d'autres utilisateurs (même dans projets)
```

### 🔄 **Processus Type: Developer crée note dans projet partagé**
```
POST /api/notes/note { title, content, projectId: 456 }
↓
can('create_notes') ✅ Developer a cette permission
↓
Vérifie: Developer est membre du projet 456 ✅
↓
Crée note liée au projet ✅
```

### ❌ **Processus Type: Developer tente créer projet**
```
POST /api/projects
↓
can('manage_projects') ❌ 403 Forbidden
→ "Permission manage_projects requise"
```

---

## 👀 **VIEWER (role_id = 4) - LECTURE SEULE+**

### ✅ **Peut Faire**
```
✅ Voir projets où il est explicitement invité
✅ Commenter notes des projets accessibles
✅ Lire notes partagées avec lui
```

### ❌ **Ne Peut PAS Faire**
```
❌ Créer/modifier/supprimer notes
❌ Gérer tags, projets ou utilisateurs  
❌ Ajouter membres aux projets
❌ Voir projets privés où il n'est pas invité
```

### 🔄 **Processus Type: Viewer commente note partagée**
```
POST /api/comments/note/123 { content: "Super article!" }
↓
can('comment_notes') ✅ Viewer a cette permission
↓
canCommentNote(123, userId) vérifie contextuellement:
  - Viewer est membre projet de la note ✅ OU
  - Note partagée directement avec Viewer ✅
↓
Commentaire créé ✅
```

### ❌ **Processus Type: Viewer tente créer note**
```
POST /api/notes/note
↓
can('create_notes') ❌ 403 Forbidden  
→ "Permission create_notes requise"
```

---

## 🧠 **ANALYSE LOGIQUE RBAC + CONTEXTUEL**

### ✅ **Cohérence Système**
1. **RBAC Middleware** filtre d'abord par permissions de rôle
2. **Logique Contextuelle** affine selon propriété/membership
3. **Double sécurité** : jamais de bypass accidentel

### 🔄 **Flux Type d'Autorisation**
```
Request → Auth JWT → RBAC Permission → Context Check → Action
         ✅        ✅               ✅              ✅
```

### ⚡ **Optimisations Possibles**
- Caching permissions utilisateur (éviter requête DB à chaque call)
- Permissions plus fines (`share_notes`, `delete_own_notes`)

---

**📊 Conclusion**: Système RBAC + contexte fournit contrôle granulaire approprié pour chaque rôle.