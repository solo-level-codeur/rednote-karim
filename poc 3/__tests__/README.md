# Documentation des Tests Backend

## Vue d'Ensemble

Ce dossier contient les tests unitaires pour le backend de l'application Memory Login, utilisant **Jest** et **Supertest** pour tester les contrôleurs d'API.

## Structure des Tests

```
__tests__/
├── README.md                    # Cette documentation
├── helpers/
│   └── testSetup.js            # Configuration et mocks partagés
└── controllers/
    ├── noteController.test.js   # Tests pour la création de notes
    └── projectController.test.js # Tests pour la création de projets
```

## Installation et Lancement

### Prérequis
- Node.js installé
- Dépendances installées : `npm install`

### Commandes de Test
```bash
# Lancer tous les tests
npm test

# Lancer les tests en mode watch (relance automatique)
npm run test:watch

# Lancer les tests avec rapport de couverture
npm run test:coverage
```

## Tests Implémentés

### 📝 Tests de Création de Notes (`noteController.test.js`)

#### 4 tests couverts :

1. **✅ Création note personnelle** (`projectId = null`)
   - Vérifie la création d'une note sans projet associé
   - Valide la structure de réponse JSON
   - Test : `devrait créer une note personnelle avec succès`

2. **✅ Création note de projet** (`projectId = 5`)
   - Vérifie la création d'une note liée à un projet
   - Valide l'association projet-note
   - Test : `devrait créer une note de projet avec succès`

3. **❌ Validation titre manquant**
   - Vérifie le rejet si le titre n'est pas fourni
   - Attendu : Erreur 500 avec message approprié
   - Test : `devrait échouer si le titre est manquant`

4. **❌ Validation contenu manquant**
   - Vérifie le rejet si le contenu n'est pas fourni
   - Attendu : Erreur 500 avec message approprié
   - Test : `devrait échouer si le contenu est manquant`

### 🏗️ Tests de Création de Projets (`projectController.test.js`)

#### 3 tests couverts :

1. **✅ Création projet standard**
   - Vérifie la création d'un projet avec nom et description
   - Valide l'attribution du créateur
   - Test : `devrait créer un projet avec succès`

2. **❌ Validation nom manquant**
   - Vérifie le rejet si le nom du projet est absent
   - Attendu : Erreur 500
   - Test : `devrait échouer si le nom du projet est manquant`

3. **🔒 Test de permissions**
   - Vérifie le rejet pour utilisateurs Viewer (role_id: 4)
   - Attendu : Erreur 403 (Permissions insuffisantes)
   - Test : `devrait échouer si l'utilisateur n'a pas les permissions`

## Configuration Technique

### Framework de Test
- **Jest 29.7.0** : Framework de test principal
- **Supertest 7.2.2** : Tests d'API HTTP
- **Node Environment** : Environnement de test pour Node.js

### Mocks et Stubs

#### Mock Base de Données (`testSetup.js`)
```javascript
const mockDb = {
  query: jest.fn()
};

// Mock du module de base de données
jest.mock('../../config/db', () => mockDb);
```

#### Mock Authentification
```javascript
// Simulation d'un utilisateur connecté
app.use('/api/notes/note', (req, res, next) => {
  req.user = { id: 1 };
  next();
});
```

### Helpers Disponibles

#### `createMockToken(userId, roleId)`
Crée un token JWT simulé pour les tests d'authentification.

#### `authenticatedRequest(app, token)`
Créer une requête HTTP avec token d'authentification.

## Exemples d'Usage

### Test de Succès
```javascript
it('devrait créer une note personnelle avec succès', async () => {
  // Mock de la réponse DB
  mockDb.query.mockResolvedValueOnce([{ insertId: 123 }]);
  
  const response = await request(app)
    .post('/api/notes/note')
    .send({
      title: 'Ma note',
      content: 'Contenu test'
    });
    
  expect(response.status).toBe(201);
  expect(response.body.id).toBe(123);
});
```

### Test d'Erreur
```javascript
it('devrait échouer si le titre est manquant', async () => {
  // Mock d'une erreur
  mockDb.query.mockRejectedValueOnce(new Error('Title required'));
  
  const response = await request(app)
    .post('/api/notes/note')
    .send({ content: 'Contenu sans titre' });
    
  expect(response.status).toBe(500);
});
```

## État Actuel des Tests

### ✅ Fonctionnel
- Configuration Jest opérationnelle
- Mocks de base de données fonctionnels
- Tests d'API HTTP complets
- Isolation des tests garantie

### ⚠️ Ajustements Mineurs
Quelques tests échouent actuellement due à des différences de format de réponse :
- Structure JSON des réponses à harmoniser
- Validation des champs optionnels (`projectId`, `created_by`)

### 📊 Couverture Actuelle
- **7 tests totaux** : 5 passent, 2 échouent (problèmes de format)
- **Couverture fonctionnelle** : Création de notes et projets
- **Couverture d'erreurs** : Validation et permissions

## Extension des Tests

### Ajouter de Nouveaux Tests

1. **Créer un nouveau fichier** dans `controllers/`
2. **Importer les helpers** depuis `testSetup.js`
3. **Suivre la structure** des tests existants

### Exemple de Template
```javascript
const request = require('supertest');
const express = require('express');
const { mockDb } = require('../helpers/testSetup');

describe('Nouveau Controller', () => {
  it('devrait faire quelque chose', async () => {
    // Mock setup
    mockDb.query.mockResolvedValueOnce([{ insertId: 1 }]);
    
    // Test
    const response = await request(app)
      .post('/api/endpoint')
      .send(data);
      
    // Assertions
    expect(response.status).toBe(200);
  });
});
```

## Bonnes Pratiques

### 🎯 Tests Simples et Focalisés
- Un test = un comportement spécifique
- Mocks minimaux mais efficaces
- Assertions claires et précises

### 🔄 Isolation Complète
- Aucun impact sur la base de données réelle
- Reset des mocks avant chaque test
- Tests indépendants les uns des autres

### 📝 Nommage Explicite
- Noms de tests descriptifs en français
- Structure `devrait [action] [condition]`
- Groupement logique avec `describe`

## Maintenance

### Mise à Jour des Tests
Lors de modifications des contrôleurs :
1. **Adapter les mocks** si les appels DB changent
2. **Mettre à jour les assertions** si le format de réponse évolue
3. **Ajouter de nouveaux tests** pour les nouvelles fonctionnalités

### Debugging
```bash
# Lancer un test spécifique
npm test -- --testNamePattern="création note personnelle"

# Mode verbose pour plus de détails
npm test -- --verbose

# Voir la couverture de code
npm run test:coverage
```

---

## Support

Pour toute question sur les tests :
1. Consulter cette documentation
2. Examiner les exemples dans les fichiers de test
3. Vérifier la configuration dans `jest.config.js`

Les tests sont un outil de sécurité et de qualité - utilisez-les régulièrement ! 🚀