# 📊 INVENTAIRE BACKEND CRITIQUE - Elite Project

## 🎯 Objectif: Identifier Code Utile vs Code Mort

**Date**: 15 Janvier 2026  
**Backend**: `/poc 3/` (24 fichiers JS)

---

## 📁 STRUCTURE COMPLÈTE

### 🔧 **CONFIG** (1 fichier)
- `config/db.js` - Configuration MySQL + pool connexions

### 🎮 **CONTROLLERS** (6 fichiers)
- `controllers/commentController.js` - CRUD commentaires
- `controllers/noteController.js` - CRUD notes  
- `controllers/projectController.js` - CRUD projets
- `controllers/shareController.js` - Partage de notes
- `controllers/tagController.js` - Gestion tags
- `controllers/userController.js` - Auth + profils

### 🛡️ **MIDDLEWARES** (2 fichiers)
- `middlewares/authMiddleware.js` - JWT + autorisations contextuelles
- `middlewares/rbacMiddleware.js` - Système RBAC pur

### 📊 **MODELS** (8 fichiers)
- `models/advancedModel.js` - ❓ **À ANALYSER**
- `models/commentModel.js` - Fonctions commentaires
- `models/noteModel.js` - Fonctions notes
- `models/projectModel.js` - Fonctions projets  
- `models/rbac.js` - ✅ **RBAC SIMPLE ET PROPRE**
- `models/shareModel.js` - Fonctions partage
- `models/tagModel.js` - Fonctions tags
- `models/userModel.js` - Fonctions utilisateurs

### 🛣️ **ROUTES** (6 fichiers) 
- `routes/commentRoutes.js` - Endpoints commentaires
- `routes/noteRoutes.js` - Endpoints notes
- `routes/projectRoutes.js` - Endpoints projets
- `routes/shareRoutes.js` - Endpoints partage
- `routes/tagRoutes.js` - Endpoints tags  
- `routes/userRoutes.js` - Endpoints auth/users

### ⚙️ **ENTRY POINT** (1 fichier)
- `app.js` - Serveur Express principal

---

## 🚨 CODE MORT IDENTIFIÉ

### ❌ **Variables Inutilisées**
- `noteController.js:52` - `const userRole = req.user.role_id;` (jamais utilisée)
- `projectController.js:85,131,155,181` - 4x `const userRole = req.user.role_id;` (jamais utilisées)

### ❓ **Fichiers Suspects**
- `advancedModel.js` - Nom vague, contenu à analyser
- Possibles fonctions redondantes dans models vs RBAC

---

## ✅ PRIORITÉS D'ANALYSE

### 🔥 **URGENT** 
1. Analyser `advancedModel.js` - Qu'est-ce que c'est ?
2. Supprimer variables `userRole` inutilisées  
3. Vérifier redondance authMiddleware vs RBAC

### 🎯 **IMPORTANT**
4. Tracer processus Manager: créer projet + partager
5. Vérifier cohérence RBAC sur toutes les routes
6. Identifier fonctions models redondantes avec RBAC

### 📋 **MOYEN**
7. Documenter processus pour chaque rôle  
8. Optimiser performances si nécessaire

---

## 🎭 RÔLES ET PERMISSIONS RAPPEL

| Rôle | ID | Permissions |
|------|----| ------------|
| **Admin** | 1 | Toutes (manage_users) |
| **Manager** | 2 | Projets + membres + notes/tags |  
| **Developer** | 3 | Notes + tags (pas projets) |
| **Viewer** | 4 | Voir projets + commenter uniquement |

---

**📝 Notes**: Garder RBAC simple et professionnel. Supprimer tout ce qui complexifie inutilement.