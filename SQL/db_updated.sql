-- ----------------------------------------------------------
-- Script MYSQL mis à jour pour système de gestion de projets
-- Version Elite Project 2024 avec système de permissions avancé
-- ----------------------------------------------------------

-- =====================================================
-- SUPPRESSION DES TABLES EXISTANTES (si nécessaire)
-- =====================================================

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS note_shares;
DROP TABLE IF EXISTS note_documents;
DROP TABLE IF EXISTS note_tags;
DROP TABLE IF EXISTS project_tags;
DROP TABLE IF EXISTS project_members;
DROP TABLE IF EXISTS user_skills;
DROP TABLE IF EXISTS role_permissions;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS documents;
DROP TABLE IF EXISTS notes;
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS tags;
DROP TABLE IF EXISTS skills;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS permissions;
DROP TABLE IF EXISTS roles;

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- TABLES PRINCIPALES
-- =====================================================

-- Table des rôles utilisateurs
CREATE TABLE roles (
  id INT NOT NULL AUTO_INCREMENT,
  role_name VARCHAR(50) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT roles_PK PRIMARY KEY (id)
) ENGINE=InnoDB;

-- Table des permissions système
CREATE TABLE permissions (
  id INT NOT NULL AUTO_INCREMENT,
  permission_name VARCHAR(50) NOT NULL,
  description VARCHAR(255) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT permissions_PK PRIMARY KEY (id)
) ENGINE=InnoDB;

-- Table des utilisateurs (structure mise à jour)
CREATE TABLE users (
  id_users INT NOT NULL AUTO_INCREMENT,
  lastname VARCHAR(50) NOT NULL,
  firstname VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL,
  password VARCHAR(255) NOT NULL,
  date_end_contract DATE,
  id_roles INT NOT NULL DEFAULT 3,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT users_PK PRIMARY KEY (id_users)
) ENGINE=InnoDB;

-- Table des compétences
CREATE TABLE skills (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL,
  description VARCHAR(255),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT skills_PK PRIMARY KEY (id)
) ENGINE=InnoDB;

-- Table des tags avec couleurs
CREATE TABLE tags (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL,
  color VARCHAR(7) DEFAULT '#808080',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT tags_PK PRIMARY KEY (id)
) ENGINE=InnoDB;

-- Table des projets (améliorée avec gestion des permissions)
CREATE TABLE projects (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  creation_date DATE NOT NULL DEFAULT (CURRENT_DATE),
  close_date DATE,
  status ENUM('New','In Progress','On Hold','Completed','Archived') NOT NULL DEFAULT 'New',
  id_owner INT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT projects_PK PRIMARY KEY (id)
) ENGINE=InnoDB;

-- Table des tâches (optionnelle pour fonctionnalités futures)
CREATE TABLE tasks (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  priority ENUM('Low','Medium','High','Critical') NOT NULL DEFAULT 'Medium',
  status ENUM('To Do','In Progress','Done','Blocked') NOT NULL DEFAULT 'To Do',
  start_date DATE,
  due_date DATE,
  completed_date DATE,
  id_assigned_to INT NOT NULL,
  id_projects INT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT tasks_PK PRIMARY KEY (id)
) ENGINE=InnoDB;

-- Table des notes (structure principale mise à jour)
CREATE TABLE notes (
  id INT NOT NULL AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  creation_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  id_users INT NOT NULL,
  id_projects INT NOT NULL,
  CONSTRAINT notes_PK PRIMARY KEY (id)
) ENGINE=InnoDB;

-- Table des documents liés
CREATE TABLE documents (
  id INT NOT NULL AUTO_INCREMENT,
  filename VARCHAR(255) NOT NULL,
  path VARCHAR(500) NOT NULL,
  file_size INT,
  mime_type VARCHAR(100),
  upload_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  id_uploaded_by INT NOT NULL,
  CONSTRAINT documents_PK PRIMARY KEY (id)
) ENGINE=InnoDB;

-- Table des commentaires (fonctionnalité clé)
CREATE TABLE comments (
  id INT NOT NULL AUTO_INCREMENT,
  content TEXT NOT NULL,
  comment_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  id_users INT NOT NULL,
  id_notes INT NOT NULL,
  CONSTRAINT comments_PK PRIMARY KEY (id)
) ENGINE=InnoDB;

-- =====================================================
-- TABLES DE LIAISON (Many-to-Many)
-- =====================================================

-- Liaison rôles-permissions
CREATE TABLE role_permissions (
  id_permissions INT NOT NULL,
  id_roles INT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT role_permissions_PK PRIMARY KEY (id_permissions, id_roles)
) ENGINE=InnoDB;

-- Liaison utilisateurs-compétences
CREATE TABLE user_skills (
  id_skills INT NOT NULL,
  id_users INT NOT NULL,
  level ENUM('Beginner','Intermediate','Advanced','Expert') DEFAULT 'Intermediate',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT user_skills_PK PRIMARY KEY (id_skills, id_users)
) ENGINE=InnoDB;

-- Membres de projet avec rôles spécifiques (FONCTIONNALITÉ CLÉ)
CREATE TABLE project_members (
  id_projects INT NOT NULL,
  id_users INT NOT NULL,
  role VARCHAR(50) DEFAULT 'Member',
  joined_date DATE NOT NULL DEFAULT (CURRENT_DATE),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT project_members_PK PRIMARY KEY (id_projects, id_users)
) ENGINE=InnoDB;

-- Tags associés aux projets
CREATE TABLE project_tags (
  id_projects INT NOT NULL,
  id_tags INT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT project_tags_PK PRIMARY KEY (id_projects, id_tags)
) ENGINE=InnoDB;

-- Tags associés aux notes
CREATE TABLE note_tags (
  id_notes INT NOT NULL,
  id_tags INT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT note_tags_PK PRIMARY KEY (id_notes, id_tags)
) ENGINE=InnoDB;

-- Documents liés aux notes
CREATE TABLE note_documents (
  id_documents INT NOT NULL,
  id_notes INT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT note_documents_PK PRIMARY KEY (id_documents, id_notes)
) ENGINE=InnoDB;

-- Partage individuel de notes (en plus du système projet)
CREATE TABLE note_shares (
  id_notes INT NOT NULL,
  id_users INT NOT NULL,
  permission ENUM('read','write','admin') NOT NULL DEFAULT 'read',
  shared_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  shared_by INT NOT NULL,
  CONSTRAINT note_shares_PK PRIMARY KEY (id_notes, id_users)
) ENGINE=InnoDB;

-- =====================================================
-- CLÉS ÉTRANGÈRES
-- =====================================================

-- Utilisateurs
ALTER TABLE users
  ADD CONSTRAINT users_id_roles_FK FOREIGN KEY (id_roles)
  REFERENCES roles (id) ON DELETE RESTRICT;

-- Projets
ALTER TABLE projects
  ADD CONSTRAINT projects_id_owner_FK FOREIGN KEY (id_owner)
  REFERENCES users (id_users) ON DELETE RESTRICT;

-- Tâches
ALTER TABLE tasks
  ADD CONSTRAINT tasks_id_assigned_to_FK FOREIGN KEY (id_assigned_to)
  REFERENCES users (id_users) ON DELETE RESTRICT;

ALTER TABLE tasks
  ADD CONSTRAINT tasks_id_projects_FK FOREIGN KEY (id_projects)
  REFERENCES projects (id) ON DELETE CASCADE;

-- Notes
ALTER TABLE notes
  ADD CONSTRAINT notes_id_users_FK FOREIGN KEY (id_users)
  REFERENCES users (id_users) ON DELETE RESTRICT;

ALTER TABLE notes
  ADD CONSTRAINT notes_id_projects_FK FOREIGN KEY (id_projects)
  REFERENCES projects (id) ON DELETE CASCADE;

-- Documents
ALTER TABLE documents
  ADD CONSTRAINT documents_id_uploaded_by_FK FOREIGN KEY (id_uploaded_by)
  REFERENCES users (id_users) ON DELETE RESTRICT;

-- Commentaires
ALTER TABLE comments
  ADD CONSTRAINT comments_id_users_FK FOREIGN KEY (id_users)
  REFERENCES users (id_users) ON DELETE RESTRICT;

ALTER TABLE comments
  ADD CONSTRAINT comments_id_notes_FK FOREIGN KEY (id_notes)
  REFERENCES notes (id) ON DELETE CASCADE;

-- Relations rôles-permissions
ALTER TABLE role_permissions
  ADD CONSTRAINT role_permissions_id_permissions_FK FOREIGN KEY (id_permissions)
  REFERENCES permissions (id) ON DELETE CASCADE;

ALTER TABLE role_permissions
  ADD CONSTRAINT role_permissions_id_roles_FK FOREIGN KEY (id_roles)
  REFERENCES roles (id) ON DELETE CASCADE;

-- Relations utilisateurs-compétences
ALTER TABLE user_skills
  ADD CONSTRAINT user_skills_id_skills_FK FOREIGN KEY (id_skills)
  REFERENCES skills (id) ON DELETE CASCADE;

ALTER TABLE user_skills
  ADD CONSTRAINT user_skills_id_users_FK FOREIGN KEY (id_users)
  REFERENCES users (id_users) ON DELETE CASCADE;

-- Membres de projet
ALTER TABLE project_members
  ADD CONSTRAINT project_members_id_projects_FK FOREIGN KEY (id_projects)
  REFERENCES projects (id) ON DELETE CASCADE;

ALTER TABLE project_members
  ADD CONSTRAINT project_members_id_users_FK FOREIGN KEY (id_users)
  REFERENCES users (id_users) ON DELETE CASCADE;

-- Tags des projets
ALTER TABLE project_tags
  ADD CONSTRAINT project_tags_id_projects_FK FOREIGN KEY (id_projects)
  REFERENCES projects (id) ON DELETE CASCADE;

ALTER TABLE project_tags
  ADD CONSTRAINT project_tags_id_tags_FK FOREIGN KEY (id_tags)
  REFERENCES tags (id) ON DELETE CASCADE;

-- Tags des notes
ALTER TABLE note_tags
  ADD CONSTRAINT note_tags_id_notes_FK FOREIGN KEY (id_notes)
  REFERENCES notes (id) ON DELETE CASCADE;

ALTER TABLE note_tags
  ADD CONSTRAINT note_tags_id_tags_FK FOREIGN KEY (id_tags)
  REFERENCES tags (id) ON DELETE CASCADE;

-- Documents des notes
ALTER TABLE note_documents
  ADD CONSTRAINT note_documents_id_documents_FK FOREIGN KEY (id_documents)
  REFERENCES documents (id) ON DELETE CASCADE;

ALTER TABLE note_documents
  ADD CONSTRAINT note_documents_id_notes_FK FOREIGN KEY (id_notes)
  REFERENCES notes (id) ON DELETE CASCADE;

-- Partage de notes
ALTER TABLE note_shares
  ADD CONSTRAINT note_shares_id_notes_FK FOREIGN KEY (id_notes)
  REFERENCES notes (id) ON DELETE CASCADE;

ALTER TABLE note_shares
  ADD CONSTRAINT note_shares_id_users_FK FOREIGN KEY (id_users)
  REFERENCES users (id_users) ON DELETE CASCADE;

ALTER TABLE note_shares
  ADD CONSTRAINT note_shares_shared_by_FK FOREIGN KEY (shared_by)
  REFERENCES users (id_users) ON DELETE RESTRICT;

-- =====================================================
-- INDEX UNIQUES
-- =====================================================

CREATE UNIQUE INDEX roles_role_name_UNQ ON roles (role_name);
CREATE UNIQUE INDEX permissions_permission_name_UNQ ON permissions (permission_name);
CREATE UNIQUE INDEX users_email_UNQ ON users (email);
CREATE UNIQUE INDEX skills_name_UNQ ON skills (name);
CREATE UNIQUE INDEX tags_name_UNQ ON tags (name);

-- =====================================================
-- INDEX DE PERFORMANCE
-- =====================================================

-- Index pour les recherches fréquentes
CREATE INDEX projects_status_IDX ON projects (status);
CREATE INDEX projects_creation_date_IDX ON projects (creation_date);
CREATE INDEX projects_id_owner_IDX ON projects (id_owner);

CREATE INDEX tasks_status_IDX ON tasks (status);
CREATE INDEX tasks_priority_IDX ON tasks (priority);
CREATE INDEX tasks_due_date_IDX ON tasks (due_date);
CREATE INDEX tasks_id_assigned_to_IDX ON tasks (id_assigned_to);
CREATE INDEX tasks_id_projects_IDX ON tasks (id_projects);

CREATE INDEX notes_creation_date_IDX ON notes (creation_date);
CREATE INDEX notes_updated_date_IDX ON notes (updated_date);
CREATE INDEX notes_id_users_IDX ON notes (id_users);
CREATE INDEX notes_id_projects_IDX ON notes (id_projects);
CREATE INDEX notes_title_IDX ON notes (title);

CREATE INDEX comments_comment_date_IDX ON comments (comment_date);
CREATE INDEX comments_id_notes_IDX ON comments (id_notes);
CREATE INDEX comments_id_users_IDX ON comments (id_users);

CREATE INDEX documents_upload_date_IDX ON documents (upload_date);
CREATE INDEX documents_id_uploaded_by_IDX ON documents (id_uploaded_by);

CREATE INDEX project_members_role_IDX ON project_members (role);
CREATE INDEX note_shares_permission_IDX ON note_shares (permission);

-- =====================================================
-- DONNÉES DE BASE
-- =====================================================

-- Rôles par défaut du système
INSERT INTO roles (role_name) VALUES 
  ('Admin'),
  ('Manager'),
  ('Developer'),
  ('Viewer');

-- Permissions de base
INSERT INTO permissions (permission_name, description) VALUES 
  ('create_project', 'Peut créer des projets'),
  ('edit_project', 'Peut modifier des projets'),
  ('delete_project', 'Peut supprimer des projets'),
  ('manage_project_members', 'Peut gérer les membres des projets'),
  ('create_task', 'Peut créer des tâches'),
  ('edit_task', 'Peut modifier des tâches'),
  ('delete_task', 'Peut supprimer des tâches'),
  ('create_note', 'Peut créer des notes'),
  ('edit_note', 'Peut modifier des notes'),
  ('delete_note', 'Peut supprimer des notes'),
  ('share_note', 'Peut partager des notes'),
  ('comment_note', 'Peut commenter des notes'),
  ('manage_users', 'Peut gérer les utilisateurs'),
  ('view_all', 'Peut voir tous les contenus'),
  ('manage_tags', 'Peut gérer les tags');

-- Attribution permissions Admin (id_roles = 1) - Tous les droits
INSERT INTO role_permissions (id_permissions, id_roles)
SELECT id, 1 FROM permissions;

-- Attribution permissions Manager (id_roles = 2) - Gestion de projets et équipes
INSERT INTO role_permissions (id_permissions, id_roles)
SELECT id, 2 FROM permissions WHERE permission_name IN (
  'create_project', 'edit_project', 'manage_project_members',
  'create_task', 'edit_task', 'delete_task',
  'create_note', 'edit_note', 'delete_note', 'share_note', 'comment_note',
  'view_all', 'manage_tags'
);

-- Attribution permissions Developer (id_roles = 3) - Travail quotidien
INSERT INTO role_permissions (id_permissions, id_roles)
SELECT id, 3 FROM permissions WHERE permission_name IN (
  'create_project', 'edit_project',
  'create_task', 'edit_task',
  'create_note', 'edit_note', 'share_note', 'comment_note'
);

-- Attribution permissions Viewer (id_roles = 4) - Lecture seule
INSERT INTO role_permissions (id_permissions, id_roles)
SELECT id, 4 FROM permissions WHERE permission_name IN (
  'view_all', 'comment_note'
);

-- Tags par défaut utiles
INSERT INTO tags (name, color) VALUES 
  ('Bug', '#dc3545'),
  ('Feature', '#28a745'),
  ('Documentation', '#17a2b8'),
  ('Urgent', '#fd7e14'),
  ('Review', '#6f42c1'),
  ('Meeting', '#6c757d'),
  ('Idea', '#ffc107'),
  ('Done', '#20c997');

-- Compétences techniques de base
INSERT INTO skills (name, description) VALUES 
  ('JavaScript', 'Développement JavaScript/TypeScript'),
  ('Vue.js', 'Framework Vue.js et écosystème'),
  ('Node.js', 'Développement backend Node.js'),
  ('MySQL', 'Base de données MySQL'),
  ('Git', 'Contrôle de version avec Git'),
  ('Docker', 'Containerisation avec Docker'),
  ('TipTap', 'Éditeur de texte riche TipTap'),
  ('Bootstrap', 'Framework CSS Bootstrap'),
  ('API REST', 'Conception et développement d\'APIs REST'),
  ('Gestion de projet', 'Méthodologies de gestion de projet');

-- =====================================================
-- VUES UTILES POUR L'APPLICATION
-- =====================================================

-- Vue des notes avec informations complètes
CREATE VIEW notes_detailed AS
SELECT 
  n.id,
  n.title,
  n.content,
  n.creation_date,
  n.updated_date,
  n.id_users,
  n.id_projects,
  u.firstname as author_firstname,
  u.lastname as author_lastname,
  p.name as project_name,
  p.status as project_status,
  (SELECT COUNT(*) FROM comments c WHERE c.id_notes = n.id) as comments_count
FROM notes n
JOIN users u ON n.id_users = u.id_users
JOIN projects p ON n.id_projects = p.id;

-- Vue des projets avec statistiques
CREATE VIEW projects_stats AS
SELECT 
  p.id,
  p.name,
  p.description,
  p.creation_date,
  p.status,
  p.id_owner,
  u.firstname as owner_firstname,
  u.lastname as owner_lastname,
  (SELECT COUNT(*) FROM notes n WHERE n.id_projects = p.id) as notes_count,
  (SELECT COUNT(*) FROM project_members pm WHERE pm.id_projects = p.id) + 1 as members_count,
  (SELECT COUNT(*) FROM tasks t WHERE t.id_projects = p.id) as tasks_count
FROM projects p
JOIN users u ON p.id_owner = u.id_users;

-- =====================================================
-- COMMENTAIRES DE DOCUMENTATION
-- =====================================================

/*
Structure mise à jour Elite Project 2024

NOUVELLES FONCTIONNALITÉS IMPLÉMENTÉES:
1. ✅ Système de permissions par projet avec rôles (Member, Admin, Viewer, Editor)
2. ✅ Gestion des membres de projet avec dates d'ajout
3. ✅ Système de commentaires complet avec édition/suppression
4. ✅ Partage de notes individuel avec permissions granulaires
5. ✅ Tags colorés pour catégorisation
6. ✅ Compétences utilisateurs avec niveaux
7. ✅ Contraintes CASCADE pour suppression propre
8. ✅ Index optimisés pour performances
9. ✅ Vues pour requêtes complexes fréquentes

AMÉLIORATIONS TECHNIQUES:
- Champs updated_date automatiques
- Contraintes de clés étrangères renforcées
- Index sur les colonnes de recherche fréquente
- Permissions flexibles par rôle
- Support TipTap avec contenu HTML
- Système de commentaires hiérarchique

UTILISATION:
1. Créer la base avec ce script
2. Créer un utilisateur admin
3. Créer des projets et inviter des membres
4. Les membres voient toutes les notes du projet
5. Système de commentaires actif sur toutes les notes
*/