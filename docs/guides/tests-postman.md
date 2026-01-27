# Tests Postman - Guide Complet des APIs

## Configuration Postman

### Variables d'Environnement
Créer un environnement Postman avec ces variables :
```
BASE_URL = http://localhost:3000/api
TOKEN = (sera défini après login)
```

### Headers Communs
Pour toutes les requêtes authentifiées :
```
Content-Type: application/json
```

---

## 🔐 Tests d'Authentification

### 1. Créer un Utilisateur (Admin uniquement)

**Endpoint :** `POST {{BASE_URL}}/users/register`

**Headers :**
```
Content-Type: application/json
Cookie: authToken={{TOKEN}}  // Token admin requis
```

**Body (raw JSON) :**
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123",
  "firstname": "John",
  "lastname": "Doe",
  "roleId": 3
}
```

**Réponse Attendue (201) :**
```json
{
  "success": true,
  "message": "Utilisateur créé avec succès",
  "user": {
    "id": 5,
    "username": "testuser",
    "email": "test@example.com",
    "firstname": "John",
    "lastname": "Doe",
    "role_id": 3
  }
}
```

**Test Cases :**
- ✅ Création avec rôle Developer (3)
- ✅ Création avec rôle Manager (2) 
- ❌ Sans token admin → 401
- ❌ Email déjà utilisé → 400

---

### 2. Connexion Utilisateur

**Endpoint :** `POST {{BASE_URL}}/users/login`

**Headers :**
```
Content-Type: application/json
```

**Body (raw JSON) :**
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

**Réponse Attendue (200) :**
```json
{
  "success": true,
  "message": "Connexion réussie",
  "user": {
    "id": 5,
    "username": "testuser",
    "email": "test@example.com",
    "firstname": "John",
    "lastname": "Doe",
    "role_id": 3
  }
}
```

**Script Post-Request (onglet Tests) :**
```javascript
// Sauvegarder le token depuis les cookies pour les prochaines requêtes
pm.test("Login successful", function () {
    pm.response.to.have.status(200);
    
    // Le token est dans les cookies, Postman le gère automatiquement
    var responseJson = pm.response.json();
    pm.expect(responseJson.success).to.be.true;
    
    console.log("User logged in:", responseJson.user.email);
});
```

**Test Cases :**
- ✅ Login correct → 200 + cookie authToken
- ❌ Email inexistant → 401
- ❌ Mot de passe incorrect → 401
- ❌ Champs manquants → 400

---

## 📝 Tests de Création de Notes

### 3. Créer une Note Personnelle

**Endpoint :** `POST {{BASE_URL}}/notes/note`

**Headers :**
```
Content-Type: application/json
Cookie: authToken=<token-from-login>  // Automatique après login
```

**Body (raw JSON) :**
```json
{
  "title": "Ma note personnelle de test",
  "content": "<p>Ceci est le <strong>contenu</strong> de ma note avec du HTML</p><ul><li>Point 1</li><li>Point 2</li></ul>"
}
```

**Réponse Attendue (201) :**
```json
{
  "id": 123,
  "title": "Ma note personnelle de test",
  "content": "<p>Ceci est le <strong>contenu</strong> de ma note avec du HTML</p><ul><li>Point 1</li><li>Point 2</li></ul>",
  "userId": 5,
  "projectId": null
}
```

**Test Cases :**
- ✅ Note personnelle (projectId null) → 201
- ❌ Titre manquant → 500
- ❌ Contenu manquant → 500
- ❌ Sans authentification → 401

---

### 4. Créer une Note de Projet

**Endpoint :** `POST {{BASE_URL}}/notes/note`

**Headers :**
```
Content-Type: application/json
Cookie: authToken=<token-from-login>
```

**Body (raw JSON) :**
```json
{
  "title": "Note importante du projet",
  "content": "<h2>Réunion équipe</h2><p>Points à retenir :</p><ol><li>Deadline fixée au 15/02</li><li>Budget approuvé</li><li>Ressources allouées</li></ol>",
  "projectId": 1
}
```

**Réponse Attendue (201) :**
```json
{
  "id": 124,
  "title": "Note importante du projet",
  "content": "<h2>Réunion équipe</h2><p>Points à retenir :</p><ol><li>Deadline fixée au 15/02</li><li>Budget approuvé</li><li>Ressources allouées</li></ol>",
  "userId": 5,
  "projectId": 1
}
```

**Test Cases :**
- ✅ Note avec projectId valide → 201
- ❌ ProjectId inexistant → 500
- ❌ Pas d'accès au projet → 403

---

## 🏗️ Tests de Création de Projets

### 5. Créer un Projet (Manager/Admin)

**Endpoint :** `POST {{BASE_URL}}/projects`

**Headers :**
```
Content-Type: application/json
Cookie: authToken=<token-manager-or-admin>
```

**Body (raw JSON) :**
```json
{
  "project_name": "Projet de Test API",
  "description": "Description complète du projet créé via Postman pour tester l'API de création"
}
```

**Réponse Attendue (201) :**
```json
{
  "success": true,
  "message": "Projet créé avec succès",
  "project": {
    "id": 15,
    "project_name": "Projet de Test API",
    "description": "Description complète du projet créé via Postman pour tester l'API de création",
    "created_by": 5,
    "created_at": "2024-01-27T15:30:00.000Z"
  }
}
```

**Test Cases :**
- ✅ Création par Manager (role_id: 2) → 201
- ✅ Création par Admin (role_id: 1) → 201
- ❌ Tentative par Developer (role_id: 3) → 403
- ❌ Tentative par Viewer (role_id: 4) → 403
- ❌ Nom manquant → 400

---

### 6. Créer un Projet Sans Permissions (Test d'Erreur)

**Endpoint :** `POST {{BASE_URL}}/projects`

**Headers :**
```
Content-Type: application/json
Cookie: authToken=<token-developer-or-viewer>
```

**Body (raw JSON) :**
```json
{
  "project_name": "Projet Non Autorisé",
  "description": "Tentative de création sans permissions"
}
```

**Réponse Attendue (403) :**
```json
{
  "message": "Permissions insuffisantes"
}
```

---

## 📊 Tests de Lecture (GET)

### 7. Récupérer Toutes les Notes

**Endpoint :** `GET {{BASE_URL}}/notes`

**Headers :**
```
Cookie: authToken=<token>
```

**Réponse Attendue (200) :**
```json
[
  {
    "note_id": 123,
    "title": "Ma note personnelle de test",
    "content": "<p>Contenu...</p>",
    "user_id": 5,
    "project_id": null,
    "created_at": "2024-01-27T15:30:00.000Z",
    "updated_at": "2024-01-27T15:30:00.000Z",
    "tags": []
  },
  {
    "note_id": 124,
    "title": "Note importante du projet",
    "content": "<h2>Réunion équipe</h2>...",
    "user_id": 5,
    "project_id": 1,
    "created_at": "2024-01-27T15:31:00.000Z",
    "updated_at": "2024-01-27T15:31:00.000Z",
    "tags": []
  }
]
```

---

### 8. Récupérer une Note Spécifique

**Endpoint :** `GET {{BASE_URL}}/notes/note/123`

**Headers :**
```
Cookie: authToken=<token>
```

**Réponse Attendue (200) :**
```json
{
  "note_id": 123,
  "title": "Ma note personnelle de test",
  "content": "<p>Ceci est le <strong>contenu</strong> de ma note avec du HTML</p>",
  "user_id": 5,
  "project_id": null,
  "created_at": "2024-01-27T15:30:00.000Z",
  "updated_at": "2024-01-27T15:30:00.000Z",
  "canEdit": true,
  "canDelete": true,
  "isOwner": true
}
```

---

### 9. Récupérer Tous les Projets

**Endpoint :** `GET {{BASE_URL}}/projects`

**Headers :**
```
Cookie: authToken=<token>
```

**Réponse Attendue (200) :**
```json
[
  {
    "project_id": 15,
    "project_name": "Projet de Test API",
    "description": "Description complète du projet...",
    "created_by": 5,
    "created_at": "2024-01-27T15:30:00.000Z",
    "updated_at": "2024-01-27T15:30:00.000Z"
  }
]
```

---

## 🧪 Collection de Tests Automatisés

### Script de Tests Global (Collection Settings)

```javascript
// Pre-request Script (Collection niveau)
pm.environment.set("timestamp", Date.now());

// Tests Script (Collection niveau)
pm.test("Response time is less than 1000ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(1000);
});

pm.test("Response has correct Content-Type", function () {
    pm.expect(pm.response.headers.get("Content-Type")).to.include("application/json");
});
```

### Tests Spécifiques par Endpoint

#### Pour la Création de Notes :
```javascript
pm.test("Note created successfully", function () {
    pm.response.to.have.status(201);
    
    var responseJson = pm.response.json();
    pm.expect(responseJson).to.have.property("id");
    pm.expect(responseJson).to.have.property("title");
    pm.expect(responseJson).to.have.property("content");
    pm.expect(responseJson).to.have.property("userId");
    
    // Sauvegarder l'ID pour les tests suivants
    pm.environment.set("noteId", responseJson.id);
});
```

#### Pour la Création de Projets :
```javascript
pm.test("Project created successfully", function () {
    pm.response.to.have.status(201);
    
    var responseJson = pm.response.json();
    pm.expect(responseJson.success).to.be.true;
    pm.expect(responseJson.project).to.have.property("id");
    pm.expect(responseJson.project).to.have.property("project_name");
    
    // Sauvegarder l'ID du projet
    pm.environment.set("projectId", responseJson.project.id);
});
```

---

## 🚀 Flux de Test Complet

### Ordre d'Exécution Recommandé :

1. **🔐 Login Admin** → Obtenir token admin
2. **👤 Créer Utilisateur** → Créer un user de test
3. **🔑 Login User** → Se connecter avec le nouveau user
4. **📝 Créer Note Personnelle** → Tester création note
5. **🏗️ Créer Projet** (si Manager) → Tester création projet
6. **📝 Créer Note Projet** → Lier note au projet
7. **📖 Lire Notes** → Vérifier les données
8. **📖 Lire Projets** → Vérifier les projets

### Variables à Suivre :
- `{{BASE_URL}}` : URL de base de l'API
- `{{noteId}}` : ID de la note créée
- `{{projectId}}` : ID du projet créé
- Les cookies de session sont gérés automatiquement par Postman

---

## 💡 Conseils d'Utilisation

### Debugging
- Utiliser l'onglet **Console** de Postman pour voir les logs
- Activer **"Capture responses"** dans les settings
- Utiliser **"Save as examples"** pour documenter les réponses

### Organisation
- Créer des **Collections** par fonctionnalité
- Utiliser des **Folders** pour grouper les tests
- Nommer clairement : `"Notes - CREATE - Personal Note"`

### Automatisation
- Runner Postman pour exécuter toute la suite
- Export en format Newman pour CI/CD
- Variables d'environnement pour dev/staging/prod

Ces tests couvrent tous les cas d'usage principaux et vous permettront de valider le bon fonctionnement de votre API ! 🎯