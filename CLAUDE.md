# 🚀 Elite Project - Application Full-Stack de Gestion de Notes
Le projet a pour objectif de créer un logiciel interne pour les développeurs de Memory afin de gérer les notes et les retours (feedbacks), facilitant ainsi le partage d'informations, d'idées, de problèmes techniques et de suggestions de manière centralisée et structurée.

## Résumé des Fonctionnalités du Logiciel de Gestion de Notes

### I. Fonctionnalités Clés de l'Application Web

Les fonctionnalités principales sont conçues pour améliorer la collaboration et la centralisation de l'information entre les développeurs.

*   **1. Création et Partage de Notes**
    *   Les développeurs peuvent créer des notes sous forme de **texte, d'images, ou de code**.
    *   Le partage est possible avec un ou plusieurs développeurs spécifiques, ou avec l'ensemble de l'équipe.

*   **2. Classification et Étiquetage**
    *   Les notes peuvent être classées par **projet, langage de programmation, ou type de problème**.
    *   Ajout d'étiquettes pour faciliter la recherche ultérieure (ex: **"bug", "optimisation", "documentation"**).

*   **3. Recherche Avancée**
    *   Fonctionnalité permettant de retrouver rapidement des notes spécifiques.
    *   La recherche est basée sur des critères tels que les **mots-clés, les projets, ou les contributeurs**.

*   **4. Commentaires et Discussions**
    *   Chaque note peut être commentée par d'autres membres de l'équipe.
    *   Présence d'un système de **fil de discussion** pour maintenir les échanges organisés et proposer des solutions.

*   **5. Profil des Contributeurs**
    *   Chaque développeur peut détailler son profil, incluant ses **compétences techniques**.
    *   Ces compétences servent à mieux attribuer les développeurs aux projets ou à la résolution de bugs.

*   **6. Tableau de Bord Personnalisé**
    *   Chaque développeur dispose d'un tableau de bord affichant, entre autres :
        *   Les notes les plus récentes.
        *   Les tâches qui lui sont assignées.
        *   Les projets sur lesquels il travaille.
        *   La liste des contributeurs ayant au moins un projet en commun.
        *   Les discussions en cours.

### II. Fonctionnalités Avancées

Ces fonctionnalités permettent de renforcer la gestion des flux d'information et la surveillance de l'activité.

*   **Notifications**
    *   Les développeurs reçoivent des notifications lors de la création de nouvelles notes les concernant directement.
    *   Des alertes sont envoyées lorsque des commentaires sont ajoutés à une note qu'ils suivent.

*   **Métriques de Participation et Rapports**
    *   Définition d'indicateurs pour **mesurer la participation** (ex : nombre de notes, qualité des contributions, résolution de problèmes).
    *   Un administrateur peut générer des **rapports de participation** individuels et par projet.

*   **Confidentialité et Gestion des Accès**
    *   Nécessité de définir qui aura accès aux profils détaillés et aux rapports de participation.
    *   Proposition de **niveaux d'accès différents** selon les rôles (Alternant, Dev Senior, Chef de projet, etc.).
    *   Prise en compte des aspects de sécurité pour la gestion des utilisateurs et le partage des notes.

### III. Fonctionnalités de l'Application Annexe en Python (Second Temps)

En complément de l'application web, une application annexe en Python devra être développée, utilisant la même API et se synchronisant avec l'application web. Il est demandé de choisir au moins une des options suivantes :

1.  **Gestion de notes** : Création rapide de prises de notes avec une **synchronisation manuelle**.
2.  **Messagerie** : Synchronisation **automatique** des discussions présentes sur le site web.
3.  **Répertoire des développeurs** : Application destinée au responsable des ressources humaines, incluant la gestion des compétences.

---

Pour mieux comprendre l'importance des fonctionnalités de classification et de recherche avancée :

Imaginez que ce logiciel est une immense **bibliothèque interne** pour les développeurs. Sans la classification et les étiquettes, toutes les connaissances seraient empilées aléatoirement. La recherche avancée agit comme un **bibliothécaire expert** : il ne se contente pas de chercher un mot-clé, il utilise les catégories (projet, langage) et les étiquettes (bug, optimisation) pour vous trouver l'information précise et pertinente dont vous avez besoin en un instant, assurant ainsi le gain de temps attendu.
## 🎯 Vue d'ensemble du Projet

**Elite Project** est une application full-stack complète pour la gestion de notes personnelles. Le projet combine un backend API RESTful robuste (Node.js/Express) avec un frontend moderne et interactif (Vue.js), offrant une expérience utilisateur fluide et sécurisée.

### 🎨 À quoi sert l'application

- **Gestion de Notes Personnelles** : Créer, modifier, supprimer et organiser des notes
- **Authentification Sécurisée** : Système d'inscription/connexion avec JWT
- **Interface Utilisateur Moderne** : Interface responsive avec éditeur de texte riche
- **Sécurité Avancée** : Protection des données et isolation des notes par utilisateur

## 🏗️ Architecture Globale du Projet

```
elite project/
├── poc 3/                    # 🔧 BACKEND (API Node.js/Express)
│   ├── app.js                # Point d'entrée principal
│   ├── package.json          # Dépendances backend
│   ├── .env                  # Variables d'environnement
│   ├── config/
│   │   └── db.js             # Configuration MySQL
│   ├── models/               # 📊 Couche de données
│   │   ├── userModel.js      # Modèle utilisateur
│   │   └── noteModel.js      # Modèle note
│   ├── controllers/          # 🎮 Logique métier
│   │   ├── userController.js # Contrôleur utilisateur
│   │   └── noteController.js # Contrôleur notes
│   ├── middlewares/          # 🛡️ Sécurité
│   │   └── authMiddleware.js # Authentification JWT
│   └── routes/               # 🛣️ Définition des routes
│       ├── userRoutes.js     # Routes utilisateur
│       └── noteRoutes.js     # Routes notes
│
├── memory-login/             # 🎨 FRONTEND (Vue.js/Vite)
│   ├── package.json          # Dépendances frontend
│   ├── src/
│   │   ├── components/       # 🧩 Composants réutilisables
│   │   │   ├── AppHeader.vue  # En-tête navigation
│   │   │   ├── LoginForm.vue  # Formulaire de connexion
│   │   │   └── ...           # Autres composants UI
│   │   ├── views/            # 📄 Pages principales
│   │   │   ├── LoginView.vue  # Page de connexion
│   │   │   ├── RegisterView.vue # Page d'inscription
│   │   │   ├── DashboardView.vue # Tableau de bord
│   │   │   └── ...           # Autres vues
│   │   ├── router/           # 🧭 Navigation
│   │   │   └── index.js      # Configuration des routes
│   │   ├── services/         # 🔌 Services API
│   │   │   └── api.js        # Client HTTP (Axios)
│   │   ├── stores/           # 📦 Gestion d'état
│   │   │   └── auth.js       # Store d'authentification
│   │   └── main.js           # Point d'entrée frontend
│
├── SQL/                      # 🗄️ SCRIPTS DE BASE DE DONNÉES
│   └── db.sql                # Schéma et données initiales
│
├── CLAUDE.md                 # 📖 Documentation projet
└── INTEGRATION_FRONTEND_BACKEND.md # 🔗 Guide d'intégration
```

## 🛠️ Technologies et Patterns Utilisés

### 🔧 Backend (poc 3/) - Stack Node.js

**Technologies:**
- **Node.js** : Runtime JavaScript côté serveur
- **Express.js** : Framework web minimaliste et flexible
- **MySQL** : Base de données relationnelle
- **JWT (JSON Web Tokens)** : Authentification stateless
- **bcrypt** : Hachage sécurisé des mots de passe

**Dépendances Principales:**
- **express** : Framework web pour Node.js
- **mysql2** : Connecteur MySQL avec support des promesses
- **bcryptjs** : Cryptage des mots de passe
- **jsonwebtoken** : Gestion des tokens JWT
- **cors** : Gestion des politiques CORS
- **dotenv** : Variables d'environnement

**Patterns Architecturaux:**
- **MVC (Model-View-Controller)** : Séparation claire des responsabilités
- **Repository Pattern** : Couche d'abstraction pour l'accès aux données
- **Middleware Pattern** : Gestion modulaire des requêtes HTTP
- **Dependency Injection** : Configuration centralisée (database, routes)

### 🎨 Frontend (memory-login/) - Stack Vue.js

**Technologies:**
- **Vue.js 3** : Framework JavaScript progressif
- **Vite** : Build tool moderne et rapide
- **Vue Router** : Routage SPA (Single Page Application)
- **Axios** : Client HTTP pour les appels API
- **Bootstrap + FontAwesome** : UI Framework et icônes

**Dépendances Principales:**
- **vue** : Framework frontend réactif
- **vue-router** : Gestion du routage côté client
- **axios** : Client HTTP pour API calls
- **@tiptap/vue-3** : Éditeur de texte riche WYSIWYG
- **bootstrap** : Framework CSS responsive
- **@fortawesome/fontawesome-free** : Bibliothèque d'icônes

**Patterns Frontend:**
- **Component-Based Architecture** : Composants réutilisables
- **Reactive Store Pattern** : Gestion d'état réactive
- **Single Page Application (SPA)** : Navigation fluide
- **API Service Layer** : Abstraction des appels HTTP
- **Route Guards** : Protection des routes authentifiées

## 🎯 Flux d'Architecture et Communication

### 🔄 Communication Frontend ↔ Backend

```
┌─────────────────┐    HTTP/HTTPS     ┌─────────────────┐
│   Vue.js SPA    │ ←──────────────→ │  Express API    │
│   (Port 5173)   │    JSON + JWT     │   (Port 3000)   │
└─────────────────┘                   └─────────────────┘
         │                                     │
         ▼                                     ▼
┌─────────────────┐                   ┌─────────────────┐
│  Browser Store  │                   │  MySQL Database │
│  (localStorage) │                   │                 │
└─────────────────┘                   └─────────────────┘
```

### 🔐 Flux d'Authentification

1. **Inscription/Connexion** → Envoi credentials au backend
2. **Backend** → Vérification + génération token JWT
3. **Frontend** → Stockage token + données utilisateur
4. **Requêtes protégées** → Token ajouté automatiquement (intercepteur Axios)
5. **Backend** → Validation token + autorisation accès ressources

## 🏗️ Patterns d'Architecture Détaillés

### 🔧 Backend - Architecture en Couches

**1. Couche Routing (routes/)**
```javascript
// Définition des endpoints et liaison avec contrôleurs
GET    /api/notes/profile     → userController.getUserProfile
POST   /api/notes/register    → userController.registerUser
POST   /api/notes/login       → userController.loginUser
```

**2. Couche Middleware (middlewares/)**
```javascript
// Protection et validation des requêtes
authMiddleware.protect        → Vérification JWT
authMiddleware.authorizeNoteOwner → Vérification propriété ressource
```

**3. Couche Controller (controllers/)**
```javascript
// Logique métier et orchestration
- Validation des données d'entrée
- Appel des services (models)
- Formatage des réponses
- Gestion des erreurs
```

**4. Couche Model/Repository (models/)**
```javascript
// Accès aux données et logique de persistance
- Requêtes SQL préparées
- Validation des données
- Mappage objet-relationnel
```

**5. Couche Configuration (config/)**
```javascript
// Configuration centralisée
- Connexion base de données
- Variables d'environnement
- Pool de connexions MySQL
```

### 🎨 Frontend - Architecture Componentisée

**1. Couche Vue (views/)**
```javascript
// Pages principales de l'application
LoginView.vue     → Page d'authentification
RegisterView.vue  → Page d'inscription  
DashboardView.vue → Interface principale de gestion des notes
```

**2. Couche Composants (components/)**
```javascript
// Composants réutilisables
AppHeader.vue     → En-tête avec navigation/déconnexion
LoginForm.vue     → Formulaire de connexion réactif
NoteEditor.vue    → Éditeur de texte riche (TipTap)
```

**3. Couche Services (services/)**
```javascript
// Abstraction des appels API
api.js           → Client HTTP configuré (Axios + intercepteurs)
authAPI          → Endpoints d'authentification
notesAPI         → Endpoints de gestion des notes
```

**4. Couche Store (stores/)**
```javascript
// Gestion d'état globale
auth.js          → État d'authentification (utilisateur, token)
notes.js         → État des notes (cache, état local)
```

**5. Couche Routing (router/)**
```javascript
// Navigation et protection des routes
index.js         → Configuration routes + guards d'authentification
```

## 🔄 Fonctionnalités Métier Implémentées

### 👤 Gestion des Utilisateurs

**Backend (API RESTful):**
- **POST /api/notes/register** : Inscription avec validation email unique
- **POST /api/notes/login** : Connexion + génération JWT (30j expiration)
- **GET /api/notes/profile** : Profil utilisateur authentifié

**Frontend (Interface Vue.js):**
- **Formulaires réactifs** avec validation en temps réel
- **Gestion d'état d'authentification** persistante
- **Redirection automatique** selon le statut d'authentification

### 📋 Gestion des Notes

**Backend (CRUD Complet):**
- **GET /api/notes/** : Liste des notes de l'utilisateur connecté
- **GET /api/notes/note/:id** : Récupération note spécifique (propriétaire)
- **POST /api/notes/note** : Création nouvelle note
- **PUT /api/notes/note/:id** : Modification note (propriétaire)
- **DELETE /api/notes/note/:id** : Suppression note (propriétaire)

**Frontend (Interface Interactive):**
- **Éditeur de texte riche** avec TipTap (formatage, liens, images)
- **Sauvegarde automatique** et gestion d'état local
- **Interface responsive** Bootstrap adaptée mobile/desktop

## 🔒 Sécurité et Patterns de Protection

### 🛡️ Côté Backend
```javascript
// JWT Authentication
authMiddleware.protect         → Validation token sur routes protégées
authMiddleware.authorizeNoteOwner → Vérification propriété ressource

// Sécurité des données
bcrypt.hash()                 → Hachage sécurisé mots de passe
Prepared Statements          → Protection contre injection SQL
CORS policy                  → Contrôle accès cross-origin
```

### 🔐 Côté Frontend
```javascript
// Route Protection
beforeEach() guard           → Redirection si non authentifié
Token Management            → Stockage sécurisé localStorage
Automatic Logout            → Expiration token + nettoyage état

// UX Security
Loading States              → Feedback visuel durant requêtes
Error Handling             → Messages d'erreur utilisateur
Form Validation            → Validation côté client + serveur
```

## 💾 Modèle de Données

### 🗄️ Structure Base de Données MySQL

```sql
-- Table users (Utilisateurs)
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,        -- Hashé avec bcrypt
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table notes (Notes personnelles)
CREATE TABLE notes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT,                          -- Contenu riche (HTML via TipTap)
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Index pour performance
CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_users_email ON users(email);
```

## 🚀 Guide de Démarrage

### 📋 Prérequis
- **Node.js** (v18+)
- **MySQL** (v8.0+)
- **npm** ou **yarn**

### 🔧 Installation et Configuration

**1. Configuration de la base de données :**
```bash
# Créer la base de données MySQL
mysql -u root -p
CREATE DATABASE elite_notes;
USE elite_notes;
# Exécuter le script SQL/db.sql
```

**2. Configuration du Backend :**
```bash
cd "poc 3"
npm install
# Créer le fichier .env avec vos variables
cp .env.example .env
```

**Variables d'environnement (.env) :**
```env
# Base de données
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=elite_notes
SOCKETPATH=/tmp/mysql.sock    # Optionnel (macOS)

# Sécurité
JWT_SECRET=your_super_secret_key_here
PORT=3000

# Environnement
NODE_ENV=development
```

**3. Configuration du Frontend :**
```bash
cd memory-login
npm install
```

### ▶️ Lancement de l'Application

**Terminal 1 - Backend :**
```bash
cd "poc 3"
npm run dev          # Développement avec nodemon
# ou npm start       # Production
```

**Terminal 2 - Frontend :**
```bash
cd memory-login  
npm run dev          # Serveur de développement Vite
```

**Accès aux applications :**
- **Frontend** : http://localhost:5173
- **Backend API** : http://localhost:3000
- **Documentation API** : Consultez INTEGRATION_FRONTEND_BACKEND.md

## 🎯 Fonctionnalités Principales

### ✨ Côté Utilisateur
- ✅ **Inscription/Connexion sécurisée** avec validation
- ✅ **Dashboard personnel** avec liste des notes
- ✅ **Création/Modification de notes** avec éditeur riche
- ✅ **Recherche et filtrage** dans les notes
- ✅ **Interface responsive** (mobile/desktop)
- ✅ **Déconnexion automatique** (expiration session)

### 🔒 Côté Sécurité
- ✅ **Hachage mots de passe** (bcrypt)
- ✅ **Authentification JWT** stateless
- ✅ **Isolation des données** par utilisateur
- ✅ **Protection CORS** configurée
- ✅ **Requêtes SQL préparées** (anti-injection)
- ✅ **Validation données** côté client et serveur
- ✅ **Gestion erreurs** sécurisée

### 🏗️ Côté Technique
- ✅ **Architecture modulaire** et maintenable
- ✅ **Séparation frontend/backend** claire
- ✅ **API RESTful** bien documentée
- ✅ **Gestion d'état réactive** (Vue.js)
- ✅ **Build et bundling** optimisés (Vite)
- ✅ **Hot reloading** en développement

## 🎨 Cas d'Usage de l'Application

**Elite Project** répond aux besoins suivants :

1. **Prise de notes personnelles** : Journal, idées, mémos
2. **Rédaction de documents** : Articles, documentation avec formatage
3. **Gestion de connaissances** : Base de connaissances personnelle
4. **Collaboration** : Partage contrôlé de notes (extension future)
5. **Archivage** : Stockage sécurisé et recherche dans l'historique

## 🔮 Extensions Possibles

- **Catégories et tags** pour organiser les notes
- **Partage de notes** entre utilisateurs
- **Export** PDF/Markdown
- **Recherche full-text** avancée
- **Collaboration temps réel**
- **Application mobile** (Vue Native/PWA)
- **Intégration cloud** (stockage fichiers)
- **API publique** avec authentification OAuth