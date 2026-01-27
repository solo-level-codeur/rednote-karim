# Guide de Développement - Application Memory Login

## Introduction

Ce guide fournit toutes les informations nécessaires pour développer et maintenir l'application Memory Login. Il couvre l'installation, la configuration, les bonnes pratiques de développement et les procédures de déploiement.

## Table des Matières

1. [Installation et Configuration](#installation-et-configuration)
2. [Architecture et Structure](#architecture-et-structure)
3. [Développement Frontend](#développement-frontend)
4. [Développement Backend](#développement-backend)
5. [Base de Données](#base-de-données)
6. [Authentification et Sécurité](#authentification-et-sécurité)
7. [Tests et Validation](#tests-et-validation)
8. [Bonnes Pratiques](#bonnes-pratiques)
9. [Déploiement](#déploiement)
10. [Maintenance](#maintenance)

## Installation et Configuration

### Prérequis
- **Node.js** : Version 20.19.0 ou supérieure
- **MySQL** : Version 8.0 ou supérieure
- **Git** : Pour la gestion de version
- **npm** : Gestionnaire de paquets

### Installation du Projet

#### 1. Clonage du Repository
```bash
git clone <repository-url>
cd "elite project"
```

#### 2. Installation Frontend
```bash
cd "memory-login"
npm install
```

#### 3. Installation Backend
```bash
cd "../poc 3"
npm install
```

### Configuration de l'Environnement

#### Variables d'Environnement Backend (.env)
```env
# Base de données
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=memory_login
DB_PORT=3306

# JWT
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=24h

# Serveur
PORT=3000
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:5173
```

#### Configuration Frontend (vite.config.js)
```javascript
export default {
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
}
```

### Démarrage en Mode Développement

#### Terminal 1 - Backend
```bash
cd "poc 3"
npm run dev
# Serveur disponible sur http://localhost:3000
```

#### Terminal 2 - Frontend
```bash
cd "memory-login"
npm run dev
# Interface disponible sur http://localhost:5173
```

## Architecture et Structure

### Organisation des Dossiers

```
elite project/
├── memory-login/           # Frontend Vue.js
│   ├── src/
│   │   ├── views/         # Pages principales
│   │   ├── components/    # Composants réutilisables
│   │   ├── services/      # Services API
│   │   ├── stores/        # Gestion d'état
│   │   └── router/        # Configuration routage
│   └── package.json
├── poc 3/                 # Backend Node.js/Express
│   ├── controllers/       # Logique métier
│   ├── models/           # Accès aux données
│   ├── routes/           # Définition des routes
│   ├── middlewares/      # Middlewares personnalisés
│   └── config/           # Configuration
└── docs/                 # Documentation
    ├── architecture/     # Documentation architecture
    ├── rapports/        # Rapports techniques
    └── guides/          # Guides de développement
```

## Développement Frontend

### Technologies Utilisées
- **Vue.js 3** avec Options API et Composition API
- **Vue Router 4** pour le routage
- **Axios** pour les appels API
- **Bootstrap 5** pour l'interface utilisateur
- **Tiptap** pour l'édition de texte riche
- **Vite** pour le build et le développement

### Structure des Composants

#### Composants de Layout
- `SimpleSidebar.vue` : Navigation principale
- `NotesHeader.vue` : En-tête des vues de notes
- `NotesGrid.vue` : Grille d'affichage des notes

#### Composants de Formulaires
- `NoteCreateForm.vue` : Création de notes
- `TagSelector.vue` : Sélection de tags
- `ProjectSelector.vue` : Sélection de projets

#### Composants d'Édition
- `TiptapEditor.vue` : Éditeur de texte riche
- `SimpleEditorToolbar.vue` : Barre d'outils d'édition

### Conventions de Nommage Frontend

#### Fichiers et Composants
- **Composants** : PascalCase (`NoteCreateForm.vue`)
- **Props** : camelCase (`showCreateForm`)
- **Events** : kebab-case (`@create-note`)
- **CSS Classes** : Bootstrap classes + customs

#### Code JavaScript
```javascript
// Props
props: {
  noteData: {
    type: Object,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
}

// Events
emits: ['create', 'update', 'delete']

// Methods
methods: {
  handleCreateNote() {
    // Logique de création
  },
  
  async fetchNotes() {
    // Logique de récupération
  }
}
```

### Gestion des APIs Frontend

#### Configuration Axios (services/api.js)
```javascript
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
})

// Organisation des APIs par domaine
export const notesAPI = {
  getAllNotes: () => api.get('/notes'),
  createNote: (noteData) => api.post('/notes/note', noteData),
  // ...
}

export const tagsAPI = {
  getAllTags: () => api.get('/tags'),
  createTag: (tagData) => api.post('/tags', tagData),
  // ...
}
```

### Gestion d'État

#### Store d'Authentification (stores/auth.js)
```javascript
export const authStore = reactive({
  state: {
    isAuthenticated: false,
    user: null
  },
  
  login(userData) {
    this.state.isAuthenticated = true
    this.state.user = userData
    localStorage.setItem('user', JSON.stringify(userData))
  },
  
  logout() {
    this.state.isAuthenticated = false
    this.state.user = null
    localStorage.removeItem('user')
  }
})
```

## Développement Backend

### Technologies Utilisées
- **Node.js** avec Express.js
- **MySQL** avec mysql2/promise
- **JWT** pour l'authentification
- **bcrypt** pour le hachage des mots de passe
- **CORS** pour les requêtes cross-origin

### Structure des Contrôleurs

#### Pattern Standard
```javascript
const createResourceController = async (req, res) => {
  try {
    // 1. Validation des données
    const { field1, field2 } = req.body
    if (!field1 || !field2) {
      return res.status(400).json({ message: 'Données manquantes' })
    }

    // 2. Logique métier
    const userId = req.user.id
    const result = await createResourceModel(field1, field2, userId)

    // 3. Réponse structurée
    res.status(201).json({
      success: true,
      data: result,
      message: 'Ressource créée avec succès'
    })
  } catch (error) {
    console.error('Erreur:', error)
    res.status(500).json({ message: 'Erreur serveur' })
  }
}
```

### Structure des Modèles

#### Pattern de Modèle
```javascript
const createResource = async (field1, field2, userId) => {
  try {
    const [result] = await db.query(
      'INSERT INTO resources (field1, field2, user_id) VALUES (?, ?, ?)',
      [field1, field2, userId]
    )
    return result.insertId
  } catch (error) {
    console.error('Erreur DB:', error)
    throw error
  }
}

const getResourcesByUser = async (userId) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM resources WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    )
    return rows
  } catch (error) {
    console.error('Erreur DB:', error)
    throw error
  }
}
```

### Middlewares de Sécurité

#### Authentification (middlewares/auth.js)
```javascript
const protect = async (req, res, next) => {
  try {
    const token = req.cookies.authToken
    if (!token) {
      return res.status(401).json({ message: 'Token manquant' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await getUserById(decoded.id)
    
    req.user = {
      id: user.user_id,
      email: user.email,
      role_id: user.role_id
    }
    
    next()
  } catch (error) {
    res.status(401).json({ message: 'Token invalide' })
  }
}
```

#### Permissions RBAC (middlewares/permissions.js)
```javascript
const can = (permission) => {
  return async (req, res, next) => {
    try {
      const [rows] = await db.query(`
        SELECT 1 FROM users u
        JOIN role_permissions rp ON u.role_id = rp.role_id
        JOIN permissions p ON rp.permission_id = p.permission_id
        WHERE u.user_id = ? AND p.permission_name = ?
      `, [req.user.id, permission])
      
      if (rows.length === 0) {
        return res.status(403).json({ message: 'Permissions insuffisantes' })
      }
      
      next()
    } catch (error) {
      res.status(500).json({ message: 'Erreur de permissions' })
    }
  }
}
```

## Base de Données

### Schema Principal

#### Table users
```sql
CREATE TABLE users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role_id INT NOT NULL DEFAULT 3,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (role_id) REFERENCES roles(role_id)
);
```

#### Table notes
```sql
CREATE TABLE notes (
  note_id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  user_id INT NOT NULL,
  project_id INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE,
  
  INDEX idx_user_id (user_id),
  INDEX idx_project_id (project_id),
  INDEX idx_created_at (created_at)
);
```

#### Table projects
```sql
CREATE TABLE projects (
  project_id INT AUTO_INCREMENT PRIMARY KEY,
  project_name VARCHAR(255) NOT NULL,
  description TEXT,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE CASCADE
);
```

### Migrations et Seeds

#### Script d'Initialisation
```sql
-- Création des rôles
INSERT INTO roles (role_name) VALUES 
('Admin'), ('Manager'), ('Developer'), ('Viewer');

-- Création des permissions
INSERT INTO permissions (permission_name) VALUES 
('create_notes'), ('read_notes'), ('update_notes'), ('delete_notes'),
('create_projects'), ('read_projects'), ('update_projects'), ('delete_projects');

-- Association rôles-permissions
INSERT INTO role_permissions (role_id, permission_id) VALUES
-- Admin : toutes les permissions
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8),
-- Manager : gestion projets + notes
(2, 1), (2, 2), (2, 3), (2, 4), (2, 5), (2, 6), (2, 7),
-- Developer : notes seulement
(3, 1), (3, 2), (3, 3), (3, 6),
-- Viewer : lecture seule
(4, 2), (4, 6);
```

## Authentification et Sécurité

### Système JWT

#### Génération de Token
```javascript
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.user_id,
      email: user.email,
      role_id: user.role_id
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '24h' }
  )
}
```

#### Configuration des Cookies Sécurisés
```javascript
// Login controller
const token = generateToken(user)

res.cookie('authToken', token, {
  httpOnly: true,           // Protection XSS
  secure: process.env.NODE_ENV === 'production', // HTTPS uniquement en prod
  sameSite: 'strict',       // Protection CSRF
  maxAge: 24 * 60 * 60 * 1000 // 24 heures
})
```

### Hachage des Mots de Passe

#### Lors de l'Inscription
```javascript
const bcrypt = require('bcrypt')

const registerController = async (req, res) => {
  const { username, email, password } = req.body
  
  // Hachage du mot de passe
  const saltRounds = 12
  const hashedPassword = await bcrypt.hash(password, saltRounds)
  
  // Insertion en base avec mot de passe haché
  await createUser(username, email, hashedPassword)
}
```

#### Lors de la Connexion
```javascript
const loginController = async (req, res) => {
  const { email, password } = req.body
  
  const user = await getUserByEmail(email)
  if (!user) {
    return res.status(401).json({ message: 'Email ou mot de passe incorrect' })
  }
  
  // Vérification du mot de passe
  const isValidPassword = await bcrypt.compare(password, user.password)
  if (!isValidPassword) {
    return res.status(401).json({ message: 'Email ou mot de passe incorrect' })
  }
  
  // Génération et envoi du token
  const token = generateToken(user)
  res.cookie('authToken', token, cookieOptions)
}
```

## Tests et Validation

### Tests Frontend (Recommandé)

#### Configuration Vitest
```javascript
// vitest.config.js
export default {
  test: {
    environment: 'jsdom',
    globals: true
  }
}
```

#### Test d'un Composant
```javascript
// tests/components/NoteCreateForm.test.js
import { mount } from '@vue/test-utils'
import NoteCreateForm from '@/components/NoteCreateForm.vue'

describe('NoteCreateForm', () => {
  it('émet un event create avec les bonnes données', async () => {
    const wrapper = mount(NoteCreateForm, {
      props: { show: true, newNote: { title: '', content: '' } }
    })
    
    await wrapper.find('input').setValue('Test Title')
    await wrapper.find('button').trigger('click')
    
    expect(wrapper.emitted().create).toBeTruthy()
  })
})
```

### Tests Backend (Recommandé)

#### Configuration Jest
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js']
}
```

#### Test d'API
```javascript
// tests/controllers/noteController.test.js
const request = require('supertest')
const app = require('../app')

describe('POST /api/notes/note', () => {
  it('crée une nouvelle note', async () => {
    const token = await getValidToken()
    
    const response = await request(app)
      .post('/api/notes/note')
      .set('Cookie', `authToken=${token}`)
      .send({
        title: 'Test Note',
        content: '<p>Test Content</p>'
      })
      
    expect(response.status).toBe(201)
    expect(response.body.data.title).toBe('Test Note')
  })
})
```

## Bonnes Pratiques

### Frontend

#### Gestion des Erreurs
```javascript
// Dans un composant Vue
async fetchData() {
  try {
    this.loading = true
    const response = await api.get('/endpoint')
    this.data = response.data
  } catch (error) {
    console.error('Erreur:', error)
    this.error = 'Erreur lors du chargement des données'
    
    // Toast notification
    this.$toast.error('Erreur lors du chargement')
  } finally {
    this.loading = false
  }
}
```

#### Optimisation des Performances
```javascript
// Lazy loading des composants
const NoteDetailView = () => import('@/views/NoteDetailView.vue')

// Computed properties pour les données dérivées
computed: {
  filteredNotes() {
    return this.notes.filter(note => 
      note.title.toLowerCase().includes(this.searchQuery.toLowerCase())
    )
  }
}
```

### Backend

#### Validation des Données
```javascript
const validateNoteData = (title, content) => {
  const errors = []
  
  if (!title || title.trim().length === 0) {
    errors.push('Le titre est obligatoire')
  }
  
  if (!content || content.trim().length === 0) {
    errors.push('Le contenu est obligatoire')
  }
  
  if (title && title.length > 255) {
    errors.push('Le titre ne peut pas dépasser 255 caractères')
  }
  
  return errors
}
```

#### Logging Structuré
```javascript
const logger = {
  info: (message, meta = {}) => {
    console.log(JSON.stringify({
      level: 'info',
      message,
      timestamp: new Date().toISOString(),
      ...meta
    }))
  },
  
  error: (message, error = {}, meta = {}) => {
    console.error(JSON.stringify({
      level: 'error',
      message,
      error: {
        message: error.message,
        stack: error.stack
      },
      timestamp: new Date().toISOString(),
      ...meta
    }))
  }
}
```

## Déploiement

### Préparation du Build

#### Frontend
```bash
cd "memory-login"
npm run build
# Génère le dossier dist/ avec les fichiers optimisés
```

#### Backend
```bash
cd "poc 3"
# Pas de build nécessaire, mais vérifier les dépendances
npm ci --production
```

### Configuration Production

#### Variables d'Environnement Production
```env
NODE_ENV=production
DB_HOST=production_host
DB_PASSWORD=secure_password
JWT_SECRET=very_secure_secret_key
CORS_ORIGIN=https://yourdomain.com
```

#### Configuration Nginx (Frontend)
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        root /var/www/memory-login/dist;
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Monitoring et Logs

#### PM2 pour le Backend
```bash
# Installation PM2
npm install -g pm2

# Configuration ecosystem.config.js
module.exports = {
  apps: [{
    name: 'memory-login-api',
    script: 'app.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    }
  }]
}

# Démarrage
pm2 start ecosystem.config.js --env production
```

## Maintenance

### Sauvegarde Base de Données
```bash
# Sauvegarde complète
mysqldump -u root -p memory_login > backup_$(date +%Y%m%d_%H%M%S).sql

# Restauration
mysql -u root -p memory_login < backup_file.sql
```

### Mise à Jour des Dépendances
```bash
# Vérification des vulnérabilités
npm audit

# Mise à jour des dépendances
npm update

# Mise à jour majeure (avec précaution)
npm outdated
npm install package@latest
```

### Logs et Monitoring
```bash
# Logs PM2
pm2 logs

# Monitoring des performances
pm2 monit

# Redémarrage sans interruption
pm2 reload ecosystem.config.js
```

Ce guide fournit une base complète pour le développement et la maintenance de l'application Memory Login. Il doit être mis à jour régulièrement selon l'évolution du projet.