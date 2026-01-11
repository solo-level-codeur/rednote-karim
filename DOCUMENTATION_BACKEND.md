# 📚 Documentation Complète du Backend - Elite Project

## 🎯 Vue d'Ensemble

Ce document explique en détail l'architecture et le fonctionnement du backend de l'application Elite Project. Le backend est construit avec Node.js et Express, et fournit une API RESTful pour la gestion d'utilisateurs et de notes.

---

## 🏗️ Architecture Générale

### 📁 Structure du Projet Backend (`poc 3/`)

```
poc 3/
├── app.js                    # 🚀 Point d'entrée principal
├── package.json              # 📦 Dépendances et scripts
├── .env                      # 🔐 Variables d'environnement
├── config/
│   └── db.js                 # 🗄️ Configuration base de données
├── models/                   # 📊 Couche d'accès aux données
│   ├── userModel.js          # Modèle utilisateur
│   ├── noteModel.js          # Modèle notes
│   ├── projectModel.js       # Modèle projets
│   └── shareModel.js         # Modèle partage
├── controllers/              # 🎮 Logique métier
│   ├── userController.js     # Contrôleur utilisateur
│   ├── noteController.js     # Contrôleur notes
│   └── projectController.js  # Contrôleur projets
├── middlewares/              # 🛡️ Middlewares de sécurité
│   └── authMiddleware.js     # Authentification JWT
└── routes/                   # 🛣️ Définition des routes
    ├── userRoutes.js         # Routes utilisateur
    ├── noteRoutes.js         # Routes notes
    └── projectRoutes.js      # Routes projets
```

---

## 🔄 Pattern MVC (Model-View-Controller)

Le backend suit le pattern MVC, qui sépare l'application en 3 couches distinctes :

### 1. **Model (Modèle)** - Couche de Données
- **Localisation** : `/models/`
- **Rôle** : Gestion des données et interaction avec la base de données
- **Exemple** : `userModel.js` contient toutes les fonctions pour créer, lire, modifier les utilisateurs

### 2. **Controller (Contrôleur)** - Logique Métier
- **Localisation** : `/controllers/`
- **Rôle** : Traitement des requêtes, appel des modèles, formatage des réponses
- **Exemple** : `userController.js` gère l'inscription, la connexion, etc.

### 3. **Routes** - Interface d'Entrée
- **Localisation** : `/routes/`
- **Rôle** : Définition des endpoints et liaison avec les contrôleurs
- **Exemple** : `POST /api/register` → `userController.registerUser`

---

## 🚀 Point d'Entrée Principal (`app.js`)

```javascript
require('dotenv').config();              // 1. Chargement variables d'environnement
const express = require('express');      // 2. Import du framework Express
const cors = require('cors');            // 3. Gestion des requêtes cross-origin
const bodyParser = require('body-parser'); // 4. Parsing des requêtes JSON

// Configuration de l'application
const app = express();
const port = process.env.PORT || 3000;

// Middlewares globaux
app.use(cors());                         // Autorise les requêtes du frontend
app.use(bodyParser.json());              // Parse automatiquement le JSON

// Configuration des routes API
app.use('/api', userRoutes);             // Routes utilisateur
app.use('/api/notes', noteRoutes);       // Routes notes
app.use('/api/projects', projectRoutes); // Routes projets

// Démarrage du serveur
app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`);
});
```

### 🔍 Explication Ligne par Ligne

1. **`require('dotenv').config()`** : Charge les variables d'environnement depuis le fichier `.env`
2. **`express()`** : Crée une instance de l'application Express
3. **`cors()`** : Permet au frontend (port 5173) de communiquer avec le backend (port 3000)
4. **`bodyParser.json()`** : Convertit automatiquement les données JSON reçues en objets JavaScript
5. **`app.use('/api', routes)`** : Définit le préfixe `/api` pour toutes les routes
6. **`app.listen()`** : Démarre le serveur sur le port spécifié

---

## 🗄️ Configuration Base de Données (`config/db.js`)

```javascript
const mysql = require('mysql2');

// Création d'un pool de connexions pour optimiser les performances
const pool = mysql.createPool({
    host: process.env.DB_HOST,           // Adresse du serveur MySQL
    user: process.env.DB_USER,           // Nom d'utilisateur MySQL
    password: process.env.DB_PASSWORD,   // Mot de passe MySQL
    database: process.env.DB_NAME,       // Nom de la base de données
    socketPath: process.env.SOCKETPATH   // Chemin socket (macOS)
}).promise();                            // Support des promesses (async/await)

module.exports = pool;
```

### 💡 Pourquoi un Pool de Connexions ?
- **Performance** : Réutilise les connexions existantes au lieu d'en créer de nouvelles
- **Stabilité** : Limite le nombre de connexions simultanées
- **Simplicité** : Gestion automatique des connexions

---

## 👤 Système d'Authentification

### 🔐 JWT (JSON Web Tokens)

L'application utilise JWT pour l'authentification sans état (stateless) :

```javascript
// Génération d'un token lors de la connexion
const generateToken = (id) => {
  return jwt.sign(
    { id },                              // Payload : ID utilisateur
    process.env.JWT_SECRET,              // Clé secrète pour signer le token
    { expiresIn: '30d' }                 // Expiration : 30 jours
  );
};
```

### 🛡️ Middleware d'Authentification (`authMiddleware.js`)

```javascript
const protect = (req, res, next) => {
  let token;

  // 1. Vérifier si le token est présent dans l'en-tête Authorization
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // 2. Extraire le token (format: "Bearer TOKEN_HERE")
      token = req.headers.authorization.split(' ')[1];
      
      // 3. Vérifier et décoder le token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // 4. Ajouter les infos utilisateur à la requête
      req.user = decoded;
      
      // 5. Passer au middleware suivant
      next();
    } catch (error) {
      res.status(401).json({ message: 'Token invalide' });
    }
  } else {
    res.status(401).json({ message: 'Pas de token fourni' });
  }
};
```

### 🔒 Flux d'Authentification Complet

```
1. Frontend envoie : POST /api/login { email, password }
2. Backend vérifie : email + password dans la base de données
3. Si OK : génération JWT + envoi au frontend
4. Frontend stocke : token dans localStorage
5. Requêtes suivantes : token ajouté automatiquement dans les headers
6. Backend valide : token à chaque requête protégée
```

---

## 📊 Modèles de Données (`models/`)

### 👤 Modèle Utilisateur (`userModel.js`)

#### Fonctions Principales :

```javascript
// Créer un nouvel utilisateur
const createUser = async (firstname, lastname, email, password, roleId = 3) => {
    // 1. Hacher le mot de passe avec bcrypt (sécurité)
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 2. Insérer en base avec requête préparée (anti-injection SQL)
    const [result] = await pool.execute(
        'INSERT INTO users (firstname, lastname, email, password, id_roles) VALUES (?, ?, ?, ?, ?)',
        [firstname, lastname, email, hashedPassword, roleId]
    );
    
    // 3. Retourner l'ID du nouvel utilisateur
    return result.insertId;
};

// Trouver un utilisateur par email
const findUserByEmail = async (email) => {
    const [rows] = await pool.execute(
        'SELECT * FROM users WHERE email = ?', 
        [email]
    );
    return rows[0]; // Premier résultat ou undefined
};

// Vérifier un mot de passe
const matchPassword = async (enteredPassword, hashedPassword) => {
    return await bcrypt.compare(enteredPassword, hashedPassword);
};
```

#### 🔒 Sécurité des Mots de Passe

```javascript
// Lors de l'inscription
const password = "motdepasse123";
const hashedPassword = await bcrypt.hash(password, 10);
// Résultat : "$2b$10$abcd...xyz" (impossible à déchiffrer)

// Lors de la connexion
const isMatch = await bcrypt.compare("motdepasse123", hashedPassword);
// Résultat : true ou false
```

---

## 🎮 Contrôleurs (`controllers/`)

### 👤 Contrôleur Utilisateur (`userController.js`)

#### Inscription d'un Utilisateur

```javascript
const registerUser = async (req, res) => {
  // 1. Extraction des données de la requête
  const { firstname, lastname, email, password, roleId = 3 } = req.body;

  try {
    // 2. Vérifier si l'utilisateur existe déjà
    const userExists = await findUserByEmail(email);
    if (userExists) {
      return res.status(400).json({ message: 'Utilisateur déjà existant' });
    }

    // 3. Créer le nouvel utilisateur
    const userId = await createUser(firstname, lastname, email, password, roleId);
    
    // 4. Générer un token JWT
    const token = generateToken(userId);

    // 5. Répondre avec les informations utilisateur
    res.status(201).json({
      id: userId,
      firstname,
      lastname,
      email,
      token,
    });
  } catch (error) {
    // 6. Gestion des erreurs
    res.status(500).json({ message: 'Erreur du serveur' });
  }
};
```

#### Connexion d'un Utilisateur

```javascript
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Chercher l'utilisateur par email
    const user = await findUserByEmail(email);
    
    // 2. Vérifier utilisateur + mot de passe
    if (user && (await matchPassword(password, user.password))) {
      // 3. Générer le token
      const token = generateToken(user.id_users);
      
      // 4. Réponse avec informations utilisateur
      res.json({
        id: user.id_users,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        role: user.id_roles === 1 ? 'Admin' : 'Developer',
        token,
      });
    } else {
      // 5. Erreur si credentials incorrects
      res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erreur du serveur' });
  }
};
```

---

## 🛣️ Système de Routage (`routes/`)

### 👤 Routes Utilisateur (`userRoutes.js`)

```javascript
const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile } = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

// Routes publiques (pas d'authentification requise)
router.post('/register', registerUser);     // Inscription
router.post('/login', loginUser);           // Connexion

// Routes protégées (authentification requise)
router.get('/profile', protect, getUserProfile);  // Profil utilisateur

module.exports = router;
```

### 🔍 Mapping Complet des Routes

| Méthode | URL | Middleware | Contrôleur | Description |
|---------|-----|------------|------------|-------------|
| POST | `/api/register` | - | `registerUser` | Inscription |
| POST | `/api/login` | - | `loginUser` | Connexion |
| GET | `/api/profile` | `protect` | `getUserProfile` | Profil utilisateur |
| GET | `/api/profile/stats` | `protect` | `getUserProfileWithStats` | Profil + statistiques |
| PUT | `/api/profile` | `protect` | `updateUserProfile` | Mise à jour profil |

---

## 🔒 Sécurité et Bonnes Pratiques

### 1. **Prévention Injection SQL**

```javascript
// ❌ DANGEREUX - Vulnérable aux injections SQL
const query = `SELECT * FROM users WHERE email = '${email}'`;

// ✅ SÉCURISÉ - Requêtes préparées
const [rows] = await pool.execute(
    'SELECT * FROM users WHERE email = ?', 
    [email]
);
```

### 2. **Hachage des Mots de Passe**

```javascript
// ❌ DANGEREUX - Mot de passe en clair
password: "motdepasse123"

// ✅ SÉCURISÉ - Mot de passe haché
password: "$2b$10$abcd...xyz"
```

### 3. **Validation des Tokens JWT**

```javascript
// Vérification automatique sur toutes les routes protégées
router.get('/profile', protect, getUserProfile);
```

### 4. **Gestion des Erreurs**

```javascript
try {
    // Code potentiellement dangereux
    const user = await findUserByEmail(email);
} catch (error) {
    // Ne jamais exposer les erreurs internes
    res.status(500).json({ message: 'Erreur du serveur' });
}
```

---

## 📡 API RESTful - Endpoints Disponibles

### 👤 **Endpoints Utilisateur**

#### 📝 **POST /api/register** - Inscription

**Requête :**
```json
{
  "firstname": "Jean",
  "lastname": "Dupont",
  "email": "jean@example.com",
  "password": "motdepasse123"
}
```

**Réponse :**
```json
{
  "id": 1,
  "firstname": "Jean",
  "lastname": "Dupont",
  "email": "jean@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 🔐 **POST /api/login** - Connexion

**Requête :**
```json
{
  "email": "jean@example.com",
  "password": "motdepasse123"
}
```

**Réponse :**
```json
{
  "id": 1,
  "firstname": "Jean",
  "lastname": "Dupont",
  "email": "jean@example.com",
  "role": "Developer",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 👤 **GET /api/profile** - Profil Utilisateur

**Headers :**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Réponse :**
```json
{
  "id": 1,
  "firstname": "Jean",
  "lastname": "Dupont",
  "email": "jean@example.com"
}
```

---

## ⚙️ Variables d'Environnement (`.env`)

```env
# Base de données MySQL
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=elite_notes
SOCKETPATH=/tmp/mysql.sock

# Sécurité JWT
JWT_SECRET=your_super_secret_key_here

# Configuration serveur
PORT=3000
NODE_ENV=development
```

### 🔐 Importance du Fichier .env

1. **Sécurité** : Les informations sensibles ne sont pas dans le code
2. **Flexibilité** : Configuration différente par environnement
3. **Bonnes pratiques** : Le fichier `.env` ne doit jamais être commité

---

## 🧪 Tests et Utilisation

### 1. **Démarrage du Serveur**

```bash
cd "poc 3"
npm install      # Installation des dépendances
npm run dev      # Démarrage en mode développement (avec nodemon)
```

### 2. **Test avec curl**

```bash
# Test inscription
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{"firstname":"Test","lastname":"User","email":"test@example.com","password":"password123"}'

# Test connexion
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### 3. **Test avec Postman**

1. **Inscription** : POST `http://localhost:3000/api/register`
2. **Connexion** : POST `http://localhost:3000/api/login`
3. **Profil** : GET `http://localhost:3000/api/profile` (avec token Bearer)

---

## 📊 Dépendances Techniques

### 🔧 **Dépendances Principales**

```json
{
  "dependencies": {
    "express": "^4.21.2",        // Framework web Node.js
    "mysql2": "^3.13.0",         // Connecteur MySQL avec promesses
    "bcryptjs": "^3.0.2",        // Hachage sécurisé des mots de passe
    "jsonwebtoken": "^9.0.2",    // Gestion des tokens JWT
    "cors": "^2.8.5",            // Gestion des requêtes cross-origin
    "dotenv": "^16.4.7",         // Variables d'environnement
    "body-parser": "^1.20.3"     // Parse des requêtes HTTP
  },
  "devDependencies": {
    "nodemon": "^3.1.9"          // Redémarrage automatique en développement
  }
}
```

### 📚 **Rôle de Chaque Dépendance**

- **Express** : Framework minimaliste pour créer des serveurs web
- **MySQL2** : Driver moderne pour MySQL avec support async/await
- **bcryptjs** : Chiffrement unidirectionnel des mots de passe
- **jsonwebtoken** : Création et vérification de tokens JWT
- **CORS** : Autorise les requêtes entre différents domaines
- **dotenv** : Charge les variables d'environnement depuis `.env`
- **nodemon** : Redémarre automatiquement le serveur lors des modifications

---

## 🎓 Niveau de Complexité - Évaluation pour Débutant

### ✅ **Points Positifs (Adapté aux Débutants)**

1. **Architecture Claire** : Pattern MVC bien séparé
2. **Code Lisible** : Noms de fonctions et variables explicites
3. **Sécurité de Base** : JWT, bcrypt, requêtes préparées
4. **Gestion d'Erreurs** : Try/catch systématique
5. **Documentation** : Commentaires en français

### ⚠️ **Points d'Attention**

1. **Async/Await** : Concept avancé mais bien implémenté
2. **JWT** : Mécanisme complexe mais usage standard
3. **Pool de Connexions** : Concept avancé mais transparent

### 🎯 **Recommandations pour la Présentation**

1. **Commencer par** : Expliquer le pattern MVC
2. **Montrer** : Le flux d'une requête (route → controller → model)
3. **Insister sur** : La sécurité (JWT, bcrypt, SQL préparé)
4. **Démontrer** : Un cas d'usage complet (inscription → connexion → profil)

---

## 🚀 Conclusions

Ce backend présente une architecture **professionnelle** mais **accessible** :

### 🏆 **Forces du Projet**
- ✅ Architecture MVC classique et bien structurée
- ✅ Sécurité moderne (JWT, bcrypt, requêtes préparées)
- ✅ API RESTful standard et documentée
- ✅ Code propre et commenté
- ✅ Gestion d'erreurs cohérente

### 📈 **Niveau Technique**
- **Complexité** : Intermédiaire (adapté licence)
- **Technologies** : Standards de l'industrie
- **Bonnes pratiques** : Respectées
- **Maintenabilité** : Excellente

### 🎓 **Pour la Soutenance**
Ce code démontre une **maîtrise solide** des concepts backend essentiels et peut être expliqué de manière claire et pédagogique à un jury de licence.

---

**📝 Note** : Cette documentation couvre tous les aspects techniques nécessaires pour comprendre, expliquer et défendre le backend lors de votre présentation de licence.