# 🧪 PLAN DE TEST RBAC - VALIDATION STEP-BY-STEP

## 📋 PRÉREQUIS

### 1. Comptes de test requis
```sql
-- Créer dans MySQL/phpMyAdmin
INSERT INTO users (username, email, password, role_id) VALUES 
('test_admin', 'admin@test.com', '$2a$12$hash_admin', 1),
('test_manager', 'manager@test.com', '$2a$12$hash_manager', 2), 
('test_dev', 'dev@test.com', '$2a$12$hash_dev', 3),
('test_viewer', 'viewer@test.com', '$2a$12$hash_viewer', 4);
```

### 2. Outils de test
- **Postman** ou **curl** 
- **Console logs** activés dans terminal backend
- **Browser DevTools** pour frontend

---

## 🎯 TEST 1: TAGS MANAGEMENT

### ✅ TEST 1A: Admin peut gérer tags
```bash
# 1. Se connecter en admin
POST /api/notes/login 
{"email": "admin@test.com", "password": "test123"}

# 2. Créer tag - DOIT RÉUSSIR ✅
POST /api/tags
{"name": "Test Admin Tag"}

# 3. Vérifier logs console:
# 🔐 RBAC CHECK - User 1 (admin@test.com) checking 'manage_tags'
# 🔐 RBAC RESULT - ✅ AUTORISÉ pour 'manage_tags'
```

### ❌ TEST 1B: Viewer NE PEUT PAS gérer tags  
```bash
# 1. Se connecter en viewer
POST /api/notes/login
{"email": "viewer@test.com", "password": "test123"}

# 2. Créer tag - DOIT ÉCHOUER ❌
POST /api/tags
{"name": "Test Viewer Tag"}

# 3. Vérifier logs console:
# 🔐 RBAC CHECK - User 4 (viewer@test.com) checking 'manage_tags'
# 🔐 RBAC RESULT - ❌ REFUSÉ pour 'manage_tags'
# 🚫 RBAC DENIED - User viewer@test.com n'a pas 'manage_tags'

# 4. Réponse attendue: 403 Forbidden
```

### ✅ TEST 1C: Developer peut gérer tags
```bash
# Se connecter en dev + créer tag = DOIT RÉUSSIR ✅
```

---

## 🎯 TEST 2: PROJECTS MANAGEMENT

### ✅ TEST 2A: Manager peut gérer projets
```bash
# 1. Connexion manager
POST /api/notes/login
{"email": "manager@test.com", "password": "test123"}

# 2. Créer projet - DOIT RÉUSSIR ✅
POST /api/projects
{"name": "Test Manager Project", "description": "Test"}

# 3. Logs attendus:
# 🔐 RBAC CHECK - User 2 (manager@test.com) checking 'manage_projects'
# 🔐 RBAC RESULT - ✅ AUTORISÉ
```

### ❌ TEST 2B: Developer NE PEUT PAS créer projets
```bash
# 1. Connexion dev
POST /api/notes/login
{"email": "dev@test.com", "password": "test123"}

# 2. Créer projet - DOIT ÉCHOUER ❌  
POST /api/projects
{"name": "Test Dev Project", "description": "Test"}

# 3. Logs attendus:
# 🔐 RBAC RESULT - ❌ REFUSÉ pour 'manage_projects'
# Réponse: 403 Forbidden
```

### ✅ TEST 2C: Viewer peut VOIR projets
```bash
# 1. Connexion viewer  
# 2. Lister projets - DOIT RÉUSSIR ✅
GET /api/projects

# 3. Logs attendus:
# 🔐 RBAC CHECK - checking 'view_projects'
# 🔐 RBAC RESULT - ✅ AUTORISÉ (Viewer+ peut voir)
```

---

## 🎯 TEST 3: NOTES MANAGEMENT 

### ✅ TEST 3A: Developer peut créer notes
```bash
# 1. Connexion dev
# 2. Créer note - DOIT RÉUSSIR ✅
POST /api/notes/note
{"title": "Test Dev Note", "content": "Content test"}

# 3. Logs attendus:
# 🔐 RBAC CHECK - checking 'create_notes'
# 🔐 RBAC RESULT - ✅ AUTORISÉ
```

### ❌ TEST 3B: Viewer NE PEUT PAS créer notes
```bash
# Connexion viewer + créer note = DOIT ÉCHOUER ❌
# Logs: ❌ REFUSÉ pour 'create_notes'
```

---

## 🎯 TEST 4: COMMENTS MANAGEMENT

### ✅ TEST 4A: Viewer peut commenter
```bash
# 1. Connexion viewer
# 2. Commenter note - DOIT RÉUSSIR ✅
POST /api/comments/note/1
{"content": "Commentaire viewer"}

# 3. Logs attendus:
# 🔐 RBAC CHECK - checking 'comment_notes'  
# 🔐 RBAC RESULT - ✅ AUTORISÉ
```

---

## 🎯 TEST 5: ADMIN PANEL

### ✅ TEST 5A: Admin accède panel users
```bash
# 1. Connexion admin
# 2. Accès admin panel - DOIT RÉUSSIR ✅
GET /api/notes/admin/users

# 3. Logs attendus:
# 🔐 RBAC CHECK - checking 'manage_users'
# 🔐 RBAC RESULT - ✅ AUTORISÉ
```

### ❌ TEST 5B: Manager NE PEUT PAS accéder admin panel
```bash  
# Connexion manager + admin panel = DOIT ÉCHOUER ❌
# Logs: ❌ REFUSÉ pour 'manage_users'
```

---

## 🎯 TEST 6: EDGE CASES & ERREURS

### TEST 6A: Token invalide
```bash
# Requête sans cookie auth = 401 Unauthorized
```

### TEST 6B: Permission inexistante  
```bash
# Test can('permission_inexistante') = 500 Server Error
```

---

## ✅ CHECKLIST DE VALIDATION

### Phase 1: Tests Positifs (DOIT RÉUSSIR)
- [ ] Admin peut gérer tags
- [ ] Manager peut gérer projets  
- [ ] Developer peut créer notes
- [ ] Viewer peut commenter
- [ ] Admin accède panel admin
- [ ] Tous peuvent voir projets (view_projects)

### Phase 2: Tests Négatifs (DOIT ÉCHOUER)  
- [ ] Viewer ne peut pas gérer tags
- [ ] Developer ne peut pas créer projets
- [ ] Viewer ne peut pas créer notes  
- [ ] Manager ne peut pas accéder admin panel

### Phase 3: Validation Logs
- [ ] Chaque requête protégée montre logs RBAC
- [ ] User email + permission clairement affichés
- [ ] Résultats ✅/❌ correspondent aux attentes
- [ ] Erreurs 403 avec message détaillé

### Phase 4: Performance
- [ ] Pas de lag notable sur requêtes protégées
- [ ] Cache permissions fonctionne côté frontend

---

## 🔍 SIGNAUX D'ALERTE

### ❌ Échecs Critiques
- Route protégée accessible sans permission
- Logs RBAC manquants  
- Erreurs 500 au lieu de 403
- User Admin refusé sur panel admin

### ✅ Succès Validés
- Tous les logs RBAC présents et corrects
- 403 Forbidden pour permissions manquantes
- 200 OK pour permissions accordées
- Messages d'erreur informatifs

---

## 📞 PROCHAINES ÉTAPES

Une fois TOUS les tests validés:
1. Supprimer logs RBAC de debugging
2. Optimiser cache permissions  
3. Documentation finale RBAC
4. Déploiement production