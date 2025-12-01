# Session de Demain - Backend & Base de Données

## 🎯 Objectifs de la prochaine session

### 1. Base de Données
- [ ] Concevoir le schéma de base de données
- [ ] Tables : Users, Notes, Projects, Sessions
- [ ] Relations entre entités
- [ ] Migrations et seeders

### 2. Backend API
- [ ] Configurer Node.js/Express server
- [ ] Authentification JWT
- [ ] Routes API REST :
  - `POST /auth/login` - Connexion
  - `POST /auth/register` - Inscription  
  - `GET /user/profile` - Profil utilisateur
  - `PUT /user/profile` - Modifier profil
  - `GET /notes` - Lister notes
  - `POST /notes` - Créer note
  - `PUT /notes/:id` - Modifier note
  - `DELETE /notes/:id` - Supprimer note
  - `GET /projects` - Lister projets

### 3. Intégration Frontend
- [ ] Connecter les services API existants
- [ ] Gérer les états d'authentification
- [ ] Affichage des données réelles
- [ ] Gestion des erreurs

## 📋 État actuel du Frontend

### ✅ Terminé aujourd'hui - Code bien structuré ⭐
- Interface complètement convertie à Bootstrap
- Composants Vue.js modulaires et optimisés
- Page profil avec bio éditable
- Thème centralisé avec variables CSS
- Navigation sidebar fonctionnelle
- 400+ lignes CSS supprimées

### 🏗 Architecture Frontend solide
- **Structure modulaire** : Components organisés par fonctionnalité
- **Séparation des responsabilités** : Utils, stores, services séparés
- **Code maintenable** : Bootstrap natif, moins de CSS custom
- **Réutilisabilité** : Composants génériques (NoteCard, ProjectCard)
- **Thème cohérent** : Variables CSS centralisées
- **Performance** : Code optimisé, imports propres

### 🔗 Points d'intégration Backend
- `src/services/api.js` - Services API prêts à connecter
- `src/stores/auth.js` - Store d'authentification
- Composants prêts : LoginForm, ProfileInfo, NoteCard, etc.

## 🛠 Technologies Backend à utiliser
- **Base de données** : PostgreSQL ou MySQL
- **Backend** : Node.js + Express
- **ORM** : Prisma ou Sequelize
- **Auth** : JWT + bcrypt
- **Validation** : Joi ou Zod

## 📁 Structure Backend proposée
```
backend/
├── src/
│   ├── controllers/    # Logique métier
│   ├── models/         # Modèles de données  
│   ├── routes/         # Routes API
│   ├── middleware/     # Auth, validation
│   ├── config/         # Configuration DB
│   └── utils/          # Utilitaires
├── prisma/             # Schéma et migrations
└── package.json
```

---
*Session suivante : Création du backend complet avec API fonctionnelle*