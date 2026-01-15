# 🚀 PLAN DE MIGRATION RBAC - ÉTAPE PAR ÉTAPE

**Objectif** : Migrer complètement vers un système RBAC cohérent et fonctionnel  
**Durée estimée** : 4-6 heures  
**Priorité** : 🔴 CRITIQUE

---

## 📋 PRÉREQUIS

### Étape 0 : Vérifier et remplir la base de données

**Action** : Exécuter `EXECUTE_IN_MAMP.sql` dans votre base de données

**Vérification** :
```sql
-- Vérifier que role_permissions est rempli
SELECT COUNT(*) FROM role_permissions;
-- Doit retourner > 0

-- Vérifier les permissions disponibles
SELECT permission_name FROM permissions;
-- Doit contenir : view_projects, create_notes, edit_notes, comment_notes, manage_tags, manage_projects, manage_project_members, manage_users
```

**Si les permissions manquent** : Exécuter `EXECUTE_IN_MAMP.sql` qui les ajoute.

---

## 🔧 PHASE 1 : CORRIGER LES MIDDLEWARES (PRIORITÉ CRITIQUE)

### Étape 1.1 : Remplacer `authorizeNoteOwner`

**Fichier** : `middlewares/authMiddleware.js`

**AVANT** :
```javascript
const authorizeNoteOwner = async (req, res, next) => {
  // ...
  if (userRole === ROLES.ADMIN) {
    return next();
  }
  // ...
};
```

**APRÈS** :
```javascript
const authorizeNoteOwner = async (req, res, next) => {
  const noteId = req.params.id;
  const userId = req.user.id;
  const { hasPermission } = require('../models/rbac');

  try {
    const [rows] = await db.query(
      'SELECT user_id, project_id FROM notes WHERE note_id = ?', 
      [noteId]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Note non trouvée' });
    }

    const note = rows[0];

    // 1. Admin peut toujours voir (via RBAC)
    if (await hasPermission(userId, 'manage_users')) {
      return next();
    }

    // 2. Propriétaire de la note peut toujours voir
    if (note.user_id === userId) {
      return next();
    }

    // 3. Vérifier si l'utilisateur est membre du projet de la note
    if (note.project_id) {
      const [projectAccess] = await db.query(`
        SELECT 1 FROM projects p
        LEFT JOIN project_members pm ON p.project_id = pm.project_id
        WHERE p.project_id = ? AND (p.user_id = ? OR pm.user_id = ?)
        LIMIT 1
      `, [note.project_id, userId, userId]);

      if (projectAccess.length > 0) {
        return next();
      }
    }

    return res.status(403).json({ message: 'Accès refusé' });
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'autorisation :', error);
    res.status(500).json({ message: 'Erreur du serveur' });
  }
};
```

**Changements** :
- ✅ Remplace `if (userRole === ROLES.ADMIN)` par `if (await hasPermission(userId, 'manage_users'))`
- ✅ Utilise RBAC au lieu de hardcodé

---

### Étape 1.2 : Remplacer `authorizeNoteEdit`

**Fichier** : `middlewares/authMiddleware.js`

**AVANT** :
```javascript
const authorizeNoteEdit = async (req, res, next) => {
  // ...
  if (userRole === ROLES.VIEWER) {
    return res.status(403).json({ ... });
  }
  if (userRole === ROLES.ADMIN) {
    return next();
  }
  if ([ROLES.MANAGER, ROLES.DEVELOPER].includes(userRole)) {
    return next();
  }
  // ...
};
```

**APRÈS** :
```javascript
const authorizeNoteEdit = async (req, res, next) => {
  const noteId = req.params.id;
  const userId = req.user.id;
  const { hasPermission } = require('../models/rbac');

  try {
    // Vérifier la permission edit_notes via RBAC
    const canEdit = await hasPermission(userId, 'edit_notes');
    if (!canEdit) {
      return res.status(403).json({ 
        message: 'Accès refusé, vous n\'avez pas la permission de modifier les notes' 
      });
    }

    const [rows] = await db.query(
      'SELECT user_id, project_id FROM notes WHERE note_id = ?', 
      [noteId]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Note non trouvée' });
    }

    const note = rows[0];

    // 1. Admin peut toujours modifier
    if (await hasPermission(userId, 'manage_users')) {
      return next();
    }

    // 2. Propriétaire de la note peut toujours modifier
    if (note.user_id === userId) {
      return next();
    }

    // 3. Vérifier si l'utilisateur est membre du projet de la note
    if (note.project_id) {
      const [projectAccess] = await db.query(`
        SELECT 1 FROM projects p
        LEFT JOIN project_members pm ON p.project_id = pm.project_id
        WHERE p.project_id = ? AND (p.user_id = ? OR pm.user_id = ?)
        LIMIT 1
      `, [note.project_id, userId, userId]);

      if (projectAccess.length > 0) {
        return next();
      }
    }

    return res.status(403).json({ 
      message: 'Accès refusé, vous n\'avez pas les permissions pour modifier cette note' 
    });
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'autorisation :', error);
    res.status(500).json({ message: 'Erreur du serveur' });
  }
};
```

**Changements** :
- ✅ Vérifie `hasPermission(userId, 'edit_notes')` au début
- ✅ Remplace les vérifications hardcodées par RBAC

---

### Étape 1.3 : Remplacer `authorizeNoteDelete`

**Fichier** : `middlewares/authMiddleware.js`

**AVANT** :
```javascript
const authorizeNoteDelete = async (req, res, next) => {
  // ...
  if (userRole === ROLES.ADMIN) {
    return next();
  }
  // ...
};
```

**APRÈS** :
```javascript
const authorizeNoteDelete = async (req, res, next) => {
  const noteId = req.params.id;
  const userId = req.user.id;
  const { hasPermission } = require('../models/rbac');

  try {
    const [rows] = await db.query(
      'SELECT user_id, project_id FROM notes WHERE note_id = ?', 
      [noteId]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Note non trouvée' });
    }

    const note = rows[0];

    // 1. Admin peut toujours supprimer (via RBAC)
    if (await hasPermission(userId, 'manage_users')) {
      return next();
    }

    // 2. SEULEMENT le propriétaire de la note peut la supprimer
    if (note.user_id === userId) {
      return next();
    }

    return res.status(403).json({ 
      message: 'Accès refusé, seul le propriétaire de la note peut la supprimer' 
    });
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'autorisation de suppression :', error);
    res.status(500).json({ message: 'Erreur du serveur' });
  }
};
```

**Changements** :
- ✅ Remplace `if (userRole === ROLES.ADMIN)` par `if (await hasPermission(userId, 'manage_users'))`

---

### Étape 1.4 : Remplacer `authorizeProjectDelete`

**Fichier** : `middlewares/authMiddleware.js`

**AVANT** :
```javascript
const authorizeProjectDelete = async (req, res, next) => {
  // ...
  if (userRole === ROLES.ADMIN) {
    return next();
  }
  // ...
};
```

**APRÈS** :
```javascript
const authorizeProjectDelete = async (req, res, next) => {
  const projectId = req.params.id;
  const userId = req.user.id;
  const { hasPermission } = require('../models/rbac');

  try {
    const [rows] = await db.query(
      'SELECT user_id FROM projects WHERE project_id = ?', 
      [projectId]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Projet non trouvé' });
    }

    const project = rows[0];

    // 1. Admin peut toujours supprimer (via RBAC)
    if (await hasPermission(userId, 'manage_users')) {
      return next();
    }

    // 2. Vérifier la permission manage_projects
    const canManage = await hasPermission(userId, 'manage_projects');
    if (!canManage) {
      return res.status(403).json({ 
        message: 'Accès refusé, vous n\'avez pas la permission de gérer les projets' 
      });
    }

    // 3. SEULEMENT le propriétaire du projet peut le supprimer
    if (project.user_id === userId) {
      return next();
    }

    return res.status(403).json({ 
      message: 'Accès refusé, seul le propriétaire du projet peut le supprimer' 
    });
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'autorisation de suppression du projet :', error);
    res.status(500).json({ message: 'Erreur du serveur' });
  }
};
```

**Changements** :
- ✅ Remplace `if (userRole === ROLES.ADMIN)` par `if (await hasPermission(userId, 'manage_users'))`
- ✅ Ajoute vérification `hasPermission(userId, 'manage_projects')`

---

## 🔧 PHASE 2 : CORRIGER LES CONTRÔLEURS (PRIORITÉ CRITIQUE)

### Étape 2.1 : Corriger `noteController.js`

**Fichier** : `controllers/noteController.js`

**Changements à faire** :

1. **`getNoteByIdController()`** (ligne 55)
   ```javascript
   // AVANT
   const isAdminAccess = await hasPermission(userId, 'manage_users');
   
   // APRÈS
   const isAdminAccess = await hasPermission(userId, 'manage_users'); // OK pour admin
   // OU mieux : vérifier propriétaire/membre projet directement
   ```

2. **`updateNoteController()`** (ligne 89)
   ```javascript
   // AVANT
   const isAdminAccess = await hasPermission(userId, 'manage_users');
   
   // APRÈS
   // Le middleware authorizeNoteEdit gère déjà la sécurité
   // On peut supprimer cette vérification ou la garder pour double sécurité
   const isAdminAccess = await hasPermission(userId, 'manage_users');
   ```

3. **`getAllNotesFromProjectController()`** (ligne 178)
   ```javascript
   // AVANT
   const isAdminAccess = await hasPermission(userId, 'manage_users');
   
   // APRÈS
   // Vérifier view_projects OU être membre du projet
   const canViewProjects = await hasPermission(userId, 'view_projects');
   const isAdminAccess = await hasPermission(userId, 'manage_users');
   ```

**Note** : Ces vérifications peuvent rester car elles sont utilisées pour le filtrage des données dans le model, pas pour la sécurité (qui est gérée par les middlewares).

---

### Étape 2.2 : Corriger `projectController.js`

**Fichier** : `controllers/projectController.js`

**Changements à faire** :

1. **`getAllProjectsController()`** (ligne 29)
   ```javascript
   // AVANT
   if (await hasPermission(userId, 'manage_users')) {
   
   // APRÈS
   // Vérifier view_projects OU être admin
   const canViewAll = await hasPermission(userId, 'view_projects') || 
                      await hasPermission(userId, 'manage_users');
   if (canViewAll) {
   ```

2. **`getProjectByIdController()`** (ligne 50)
   ```javascript
   // AVANT
   const isAdminAccess = await hasPermission(userId, 'manage_users');
   
   // APRÈS
   const canViewProjects = await hasPermission(userId, 'view_projects');
   const isAdminAccess = await hasPermission(userId, 'manage_users');
   const isAdminAccess = canViewProjects || isAdminAccess;
   ```

3. **`deleteProjectController()`** (ligne 89)
   ```javascript
   // AVANT
   const isAdminRequest = await hasPermission(userId, 'manage_users');
   
   // APRÈS
   // Le middleware authorizeProjectDelete gère déjà la sécurité
   // On peut garder pour double sécurité
   const isAdminRequest = await hasPermission(userId, 'manage_users');
   ```

4. **`removeProjectMemberController()`** (ligne 135)
   ```javascript
   // AVANT
   const isAdminRequest = await hasPermission(userId, 'manage_users');
   
   // APRÈS
   const isAdminRequest = await hasPermission(userId, 'manage_users');
   // OU mieux : vérifier manage_project_members
   const canManageMembers = await hasPermission(userId, 'manage_project_members');
   const isAdminRequest = await hasPermission(userId, 'manage_users') || canManageMembers;
   ```

5. **`getProjectMembersController()`** (ligne 159)
   ```javascript
   // AVANT
   const isAdminAccess = await hasPermission(userId, 'manage_users');
   
   // APRÈS
   const canViewProjects = await hasPermission(userId, 'view_projects');
   const isAdminAccess = await hasPermission(userId, 'manage_users');
   const isAdminAccess = canViewProjects || isAdminAccess;
   ```

6. **`updateMemberRoleController()`** (ligne 185)
   ```javascript
   // AVANT
   const isAdminRequest = await hasPermission(userId, 'manage_users');
   
   // APRÈS
   const canManageMembers = await hasPermission(userId, 'manage_project_members');
   const isAdminRequest = await hasPermission(userId, 'manage_users') || canManageMembers;
   ```

---

### Étape 2.3 : Corriger `commentModel.js`

**Fichier** : `models/commentModel.js`

**Changement à faire** :

1. **`canCommentNote()`** (ligne 83)
   ```javascript
   // AVANT
   if (await hasPermission(userId, 'manage_users')) {
     return { canComment: true, isOwner: false, isAdmin: true };
   }
   
   // APRÈS
   // Vérifier la permission comment_notes
   if (await hasPermission(userId, 'comment_notes')) {
     return { canComment: true, isOwner: false, hasPermission: true };
   }
   
   // Admin peut toujours commenter
   if (await hasPermission(userId, 'manage_users')) {
     return { canComment: true, isOwner: false, isAdmin: true };
   }
   ```

---

## 🔧 PHASE 3 : NETTOYER LES MODELS (PRIORITÉ MOYENNE)

### Étape 3.1 : Nettoyer `noteModel.js`

**Fichier** : `models/noteModel.js`

**Option A : Garder les conditions (recommandé si `isAdminAccess` vient du contrôleur)**

Si `isAdminAccess` vient d'un check RBAC dans le contrôleur, on peut garder les conditions dans le model car elles servent uniquement au filtrage des données, pas à la sécurité.

**Option B : Supprimer les conditions**

Si on veut vraiment nettoyer, on peut créer deux fonctions séparées :
- `getAllNotesFromProjectForAdmin()`
- `getAllNotesFromProjectForUser()`

**Recommandation** : **Option A** - Garder les conditions car elles servent au filtrage des données, pas à la sécurité (qui est gérée par les middlewares).

---

### Étape 3.2 : Nettoyer `projectModel.js`

**Fichier** : `models/projectModel.js`

**Même logique que pour `noteModel.js`** :

**Recommandation** : **Garder les conditions** car elles servent au filtrage des données, pas à la sécurité (qui est gérée par les middlewares/contrôleurs).

---

## 🔧 PHASE 4 : VÉRIFIER LES PERMISSIONS (PRIORITÉ MOYENNE)

### Étape 4.1 : Vérifier que toutes les permissions existent

**Action** : Exécuter dans la base de données :
```sql
SELECT permission_name FROM permissions;
```

**Permissions requises** :
- ✅ `view_projects`
- ✅ `create_notes`
- ✅ `edit_notes`
- ✅ `delete_notes`
- ✅ `comment_notes`
- ✅ `manage_tags`
- ✅ `manage_projects`
- ✅ `manage_project_members`
- ✅ `manage_users`

**Si une permission manque** : L'ajouter dans `EXECUTE_IN_MAMP.sql` et ré-exécuter.

---

### Étape 4.2 : Vérifier que `role_permissions` est rempli

**Action** : Exécuter dans la base de données :
```sql
SELECT 
    r.role_name,
    COUNT(rp.permission_id) as nb_permissions
FROM roles r 
LEFT JOIN role_permissions rp ON r.role_id = rp.role_id
GROUP BY r.role_id, r.role_name
ORDER BY r.role_id;
```

**Résultat attendu** :
- Viewer : 2 permissions
- Developer : 5 permissions
- Manager : 7 permissions
- Admin : 8 permissions (toutes)

**Si les permissions ne sont pas assignées** : Exécuter `EXECUTE_IN_MAMP.sql`.

---

## 🧪 PHASE 5 : TESTS (PRIORITÉ CRITIQUE)

### Étape 5.1 : Tests manuels

**Tester chaque rôle** :

1. **Viewer** :
   - ✅ Peut voir les notes des projets où il est invité
   - ✅ Peut commenter les notes
   - ❌ Ne peut pas créer/modifier/supprimer des notes
   - ❌ Ne peut pas créer des projets

2. **Developer** :
   - ✅ Peut créer/modifier des notes dans les projets où il est membre
   - ✅ Peut gérer les tags
   - ❌ Ne peut pas créer des projets
   - ❌ Ne peut pas gérer les membres de projet

3. **Manager** :
   - ✅ Peut créer des projets
   - ✅ Peut gérer les membres de projet
   - ✅ Peut créer/modifier/supprimer des notes
   - ❌ Ne peut pas gérer les utilisateurs

4. **Admin** :
   - ✅ Peut tout faire (toutes les permissions)

---

### Étape 5.2 : Tests automatisés (optionnel)

Créer des tests unitaires pour chaque middleware et contrôleur.

---

## 📋 CHECKLIST DE MIGRATION

### Phase 1 : Middlewares
- [ ] Étape 1.1 : Remplacer `authorizeNoteOwner`
- [ ] Étape 1.2 : Remplacer `authorizeNoteEdit`
- [ ] Étape 1.3 : Remplacer `authorizeNoteDelete`
- [ ] Étape 1.4 : Remplacer `authorizeProjectDelete`

### Phase 2 : Contrôleurs
- [ ] Étape 2.1 : Corriger `noteController.js`
- [ ] Étape 2.2 : Corriger `projectController.js`
- [ ] Étape 2.3 : Corriger `commentModel.js`

### Phase 3 : Models
- [ ] Étape 3.1 : Décider pour `noteModel.js` (garder ou nettoyer)
- [ ] Étape 3.2 : Décider pour `projectModel.js` (garder ou nettoyer)

### Phase 4 : Permissions
- [ ] Étape 4.1 : Vérifier que toutes les permissions existent
- [ ] Étape 4.2 : Vérifier que `role_permissions` est rempli

### Phase 5 : Tests
- [ ] Étape 5.1 : Tests manuels pour chaque rôle
- [ ] Étape 5.2 : Tests automatisés (optionnel)

---

## 🎯 RÉSULTAT ATTENDU

Après la migration :

1. ✅ **Tous les middlewares** utilisent RBAC (`hasPermission()`)
2. ✅ **Tous les contrôleurs** utilisent les bonnes permissions
3. ✅ **Toutes les routes** sont protégées par RBAC
4. ✅ **Aucune vérification hardcodée** dans le code
5. ✅ **Système RBAC cohérent** de bout en bout

---

## ⚠️ NOTES IMPORTANTES

1. **Ordre de migration** : Respecter l'ordre des phases (1 → 2 → 3 → 4 → 5)
2. **Tests après chaque phase** : Tester après chaque phase pour éviter les régressions
3. **Backup** : Faire un backup de la base de données avant de commencer
4. **Rollback** : Prévoir un plan de rollback si quelque chose ne fonctionne pas

---

## 🚀 DÉMARRAGE RAPIDE

Pour démarrer rapidement :

1. **Exécuter** `EXECUTE_IN_MAMP.sql` dans la base de données
2. **Commencer par** Phase 1 (Middlewares) - C'est le plus critique
3. **Tester** après chaque étape
4. **Continuer** avec Phase 2 (Contrôleurs)
5. **Finaliser** avec Phase 3, 4, 5

---

**Bonne migration ! 🎉**

