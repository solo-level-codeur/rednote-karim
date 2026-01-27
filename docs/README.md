# Documentation Projet Memory Login

## Vue d'Ensemble

Cette documentation complète couvre l'architecture, le développement et la maintenance de l'application Memory Login. Le projet est une application web de gestion de notes collaboratives avec un système de projets, de tags et de permissions granulaires.

## Structure de la Documentation

### 📁 Architecture
- **[Architecture Frontend](architecture/frontend-architecture.md)** - Documentation complète de l'architecture Vue.js 3

### 📊 Rapports Techniques
- **[Processus de Création de Notes](rapports/processus-creation-notes.md)** - Analyse détaillée du flux complet de création
- **[Analyse Backend](rapports/analyse-backend.md)** - Documentation de l'architecture backend Node.js/Express

### 📖 Guides
- **[Guide de Développement](guides/guide-developpement.md)** - Guide complet pour développeurs

## Technologies Utilisées

### Frontend
- **Vue.js 3.5.18** - Framework JavaScript progressif
- **Vue Router 4** - Routage côté client
- **Bootstrap 5.3.8** - Framework CSS responsive
- **Tiptap 3.4.1** - Éditeur de texte riche
- **Axios 1.11.0** - Client HTTP
- **Vite 7.0.6** - Build tool

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **MySQL** - Base de données relationnelle
- **JWT** - Authentification via tokens
- **bcrypt** - Hachage sécurisé des mots de passe

## Fonctionnalités Principales

### ✍️ Gestion des Notes
- Création de notes avec éditeur riche (Tiptap)
- Support du formatage : texte, images, vidéos, listes de tâches
- Organisation par projets et tags
- Système de partage entre utilisateurs

### 👥 Gestion des Projets
- Création et gestion de projets collaboratifs
- Système de membres avec rôles
- Notes spécifiques par projet
- Contrôle d'accès granulaire

### 🏷️ Système de Tags
- Création de tags colorés
- Association multiple tags/notes
- Filtrage et recherche par tags
- Gestion centralisée des tags

### 🔐 Sécurité et Permissions
- Authentification JWT sécurisée (cookies httpOnly)
- Système RBAC (Role-Based Access Control)
- 4 niveaux de rôles : Admin, Manager, Developer, Viewer
- Permissions granulaires par fonctionnalité

## Architecture Système

```
Frontend (Vue.js 3)     Backend (Node.js/Express)     Base de Données (MySQL)
┌─────────────────┐    ┌──────────────────────────┐    ┌─────────────────────┐
│  Vue Components │◄──►│     API Routes           │◄──►│  Tables Relations   │
│  - Views        │    │     - /api/notes         │    │  - users            │
│  - Components   │    │     - /api/projects      │    │  - notes            │
│  - Services     │    │     - /api/tags          │    │  - projects         │
│                 │    │                          │    │  - tags             │
│  Vue Router     │    │     Middlewares          │    │  - permissions      │
│  Axios          │    │     - Authentication     │    │  - roles            │
│  Stores         │    │     - RBAC Permissions   │    │                     │
└─────────────────┘    └──────────────────────────┘    └─────────────────────┘
```

## Démarrage Rapide

### 1. Installation
```bash
# Backend
cd "poc 3"
npm install

# Frontend  
cd "../memory-login"
npm install
```

### 2. Configuration
Copier `.env.example` vers `.env` et configurer :
- Base de données MySQL
- Clé secrète JWT
- Port serveur

### 3. Lancement
```bash
# Terminal 1 - Backend
cd "poc 3"
npm run dev

# Terminal 2 - Frontend
cd "memory-login"
npm run dev
```

## Processus de Développement

### Flux de Création d'une Note

1. **Interface** → L'utilisateur accède à `/notes` ou `/projects/:id/notes`
2. **Formulaire** → `NoteCreateForm.vue` avec éditeur Tiptap
3. **Validation** → Contrôles côté client (titre + contenu obligatoires)
4. **API** → `POST /api/notes/note` avec authentication JWT
5. **Backend** → Validation + vérification permissions RBAC
6. **Base** → Insertion dans table `notes` avec relations
7. **Post-traitement** → Association des tags sélectionnés
8. **Réponse** → Mise à jour de l'interface utilisateur

### Composants Clés

#### Frontend
- **NotesList.vue** : Orchestrateur principal
- **NoteCreateForm.vue** : Formulaire de création
- **TiptapEditor.vue** : Éditeur de texte riche
- **TagSelector.vue** : Gestion des tags
- **SimpleSidebar.vue** : Navigation principale

#### Backend
- **noteController.js** : Logique métier des notes
- **noteModel.js** : Accès base de données
- **auth.js** : Middleware d'authentification
- **permissions.js** : Contrôle RBAC

## Sécurité

### Authentification
- **Tokens JWT** stockés dans cookies httpOnly
- **Expiration automatique** avec gestion des erreurs
- **Protection XSS/CSRF** via configuration sécurisée

### Permissions (RBAC)
| Rôle | Notes | Projets | Tags | Admin |
|------|-------|---------|------|-------|
| Admin | ✅ CRUD | ✅ CRUD | ✅ CRUD | ✅ Users |
| Manager | ✅ CRUD | ✅ CRUD | ✅ CRUD | ❌ |
| Developer | ✅ CRU | ✅ Read | ✅ CRUD | ❌ |
| Viewer | ✅ Read | ✅ Read | ✅ Read | ❌ |

### Protection
- **Requêtes préparées** contre injection SQL
- **Validation** des données côté serveur
- **Hachage bcrypt** pour les mots de passe
- **Headers sécurisés** avec Helmet.js

## Contribution

### Standards de Code
- **ESLint** pour la qualité du code JavaScript
- **Prettier** pour le formatage automatique
- **Conventions** : camelCase (JS), PascalCase (composants)

### Git Workflow
```bash
# Créer une branche feature
git checkout -b feature/nouvelle-fonctionnalite

# Développement avec commits atomiques
git commit -m "feat: ajouter création de tags dynamiques"

# Push et création PR
git push origin feature/nouvelle-fonctionnalite
```

## Support et Maintenance

### Logs et Debugging
- **Console logs** structurés côté serveur
- **Vue DevTools** pour le debugging frontend
- **Error boundaries** pour la gestion d'erreurs

### Performance
- **Lazy loading** des composants Vue
- **Pool de connexions** MySQL
- **Cache** avec expiration automatique
- **Optimisation** des requêtes SQL avec index

## Ressources Utiles

- [Vue.js 3 Documentation](https://vuejs.org/)
- [Tiptap Editor Guide](https://tiptap.dev/)
- [Express.js Documentation](https://expressjs.com/)
- [MySQL Documentation](https://dev.mysql.com/doc/)

---

Pour toute question ou problème, consultez les rapports techniques détaillés dans les dossiers correspondants ou contactez l'équipe de développement.