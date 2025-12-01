-- ----------------------------------------------------------
-- Script MYSQL corrigé pour système de gestion de projets
-- ----------------------------------------------------------

-- =====================================================
-- TABLES PRINCIPALES
-- =====================================================

CREATE TABLE roles (
  id INT NOT NULL AUTO_INCREMENT,
  role_name VARCHAR(50) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT roles_PK PRIMARY KEY (id)
)ENGINE=InnoDB;

CREATE TABLE permissions (
  id INT NOT NULL AUTO_INCREMENT,
  permission_name VARCHAR(50) NOT NULL,
  description VARCHAR(255) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT permissions_PK PRIMARY KEY (id)
)ENGINE=InnoDB;

CREATE TABLE users (
  id_users INT NOT NULL AUTO_INCREMENT,
  lastname VARCHAR(50) NOT NULL,
  firstname VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL,
  password VARCHAR(255) NOT NULL,
  date_end_contract DATE,
  id_roles INT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT users_PK PRIMARY KEY (id_users)
)ENGINE=InnoDB;

CREATE TABLE skills (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL,
  description VARCHAR(255),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT skills_PK PRIMARY KEY (id)
)ENGINE=InnoDB;

CREATE TABLE tags (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL,
  color VARCHAR(7) DEFAULT '#808080',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT tags_PK PRIMARY KEY (id)
)ENGINE=InnoDB;

CREATE TABLE projects (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  creation_date DATE NOT NULL,
  close_date DATE,
  status ENUM('New','In Progress','On Hold','Completed','Archived') NOT NULL DEFAULT 'New',
  id_owner INT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT projects_PK PRIMARY KEY (id)
)ENGINE=InnoDB;

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
)ENGINE=InnoDB;

CREATE TABLE notes (
  id INT NOT NULL AUTO_INCREMENT,
  title VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  creation_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  id_users INT NOT NULL,
  id_projects INT NOT NULL,
  CONSTRAINT notes_PK PRIMARY KEY (id)
)ENGINE=InnoDB;

CREATE TABLE documents (
  id INT NOT NULL AUTO_INCREMENT,
  filename VARCHAR(255) NOT NULL,
  path VARCHAR(500) NOT NULL,
  file_size INT,
  mime_type VARCHAR(100),
  upload_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  id_uploaded_by INT NOT NULL,
  CONSTRAINT documents_PK PRIMARY KEY (id)
)ENGINE=InnoDB;

CREATE TABLE comments (
  id INT NOT NULL AUTO_INCREMENT,
  content TEXT NOT NULL,
  comment_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  id_users INT NOT NULL,
  id_notes INT NOT NULL,
  CONSTRAINT comments_PK PRIMARY KEY (id)
)ENGINE=InnoDB;

-- =====================================================
-- TABLES DE LIAISON (Many-to-Many)
-- =====================================================

CREATE TABLE role_permissions (
  id_permissions INT NOT NULL,
  id_roles INT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT role_permissions_PK PRIMARY KEY (id_permissions, id_roles)
)ENGINE=InnoDB;

CREATE TABLE user_skills (
  id_skills INT NOT NULL,
  id_users INT NOT NULL,
  level ENUM('Beginner','Intermediate','Advanced','Expert') DEFAULT 'Intermediate',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT user_skills_PK PRIMARY KEY (id_skills, id_users)
)ENGINE=InnoDB;

CREATE TABLE project_members (
  id_projects INT NOT NULL,
  id_users INT NOT NULL,
  role VARCHAR(50) DEFAULT 'Member',
  joined_date DATE NOT NULL,
  CONSTRAINT project_members_PK PRIMARY KEY (id_projects, id_users)
)ENGINE=InnoDB;

CREATE TABLE project_tags (
  id_projects INT NOT NULL,
  id_tags INT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT project_tags_PK PRIMARY KEY (id_projects, id_tags)
)ENGINE=InnoDB;

CREATE TABLE note_tags (
  id_notes INT NOT NULL,
  id_tags INT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT note_tags_PK PRIMARY KEY (id_notes, id_tags)
)ENGINE=InnoDB;

CREATE TABLE note_documents (
  id_documents INT NOT NULL,
  id_notes INT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT note_documents_PK PRIMARY KEY (id_documents, id_notes)
)ENGINE=InnoDB;

CREATE TABLE note_shares (
  id_notes INT NOT NULL,
  id_users INT NOT NULL,
  permission ENUM('Read','Write','Admin') NOT NULL DEFAULT 'Read',
  shared_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT note_shares_PK PRIMARY KEY (id_notes, id_users)
)ENGINE=InnoDB;

-- =====================================================
-- CLÉS ÉTRANGÈRES
-- =====================================================

-- Users
ALTER TABLE users
  ADD CONSTRAINT users_id_roles_FK FOREIGN KEY (id_roles)
  REFERENCES roles (id);

-- Projects
ALTER TABLE projects
  ADD CONSTRAINT projects_id_owner_FK FOREIGN KEY (id_owner)
  REFERENCES users (id_users);

-- Tasks
ALTER TABLE tasks
  ADD CONSTRAINT tasks_id_assigned_to_FK FOREIGN KEY (id_assigned_to)
  REFERENCES users (id_users);

ALTER TABLE tasks
  ADD CONSTRAINT tasks_id_projects_FK FOREIGN KEY (id_projects)
  REFERENCES projects (id);

-- Notes
ALTER TABLE notes
  ADD CONSTRAINT notes_id_users_FK FOREIGN KEY (id_users)
  REFERENCES users (id_users);

ALTER TABLE notes
  ADD CONSTRAINT notes_id_projects_FK FOREIGN KEY (id_projects)
  REFERENCES projects (id);

-- Documents
ALTER TABLE documents
  ADD CONSTRAINT documents_id_uploaded_by_FK FOREIGN KEY (id_uploaded_by)
  REFERENCES users (id_users);

-- Comments
ALTER TABLE comments
  ADD CONSTRAINT comments_id_users_FK FOREIGN KEY (id_users)
  REFERENCES users (id_users);

ALTER TABLE comments
  ADD CONSTRAINT comments_id_notes_FK FOREIGN KEY (id_notes)
  REFERENCES notes (id);

-- Role Permissions
ALTER TABLE role_permissions
  ADD CONSTRAINT role_permissions_id_permissions_FK FOREIGN KEY (id_permissions)
  REFERENCES permissions (id);

ALTER TABLE role_permissions
  ADD CONSTRAINT role_permissions_id_roles_FK FOREIGN KEY (id_roles)
  REFERENCES roles (id);

-- User Skills
ALTER TABLE user_skills
  ADD CONSTRAINT user_skills_id_skills_FK FOREIGN KEY (id_skills)
  REFERENCES skills (id);

ALTER TABLE user_skills
  ADD CONSTRAINT user_skills_id_users_FK FOREIGN KEY (id_users)
  REFERENCES users (id_users);

-- Project Members
ALTER TABLE project_members
  ADD CONSTRAINT project_members_id_projects_FK FOREIGN KEY (id_projects)
  REFERENCES projects (id);

ALTER TABLE project_members
  ADD CONSTRAINT project_members_id_users_FK FOREIGN KEY (id_users)
  REFERENCES users (id_users);

-- Project Tags
ALTER TABLE project_tags
  ADD CONSTRAINT project_tags_id_projects_FK FOREIGN KEY (id_projects)
  REFERENCES projects (id);

ALTER TABLE project_tags
  ADD CONSTRAINT project_tags_id_tags_FK FOREIGN KEY (id_tags)
  REFERENCES tags (id);

-- Note Tags
ALTER TABLE note_tags
  ADD CONSTRAINT note_tags_id_notes_FK FOREIGN KEY (id_notes)
  REFERENCES notes (id);

ALTER TABLE note_tags
  ADD CONSTRAINT note_tags_id_tags_FK FOREIGN KEY (id_tags)
  REFERENCES tags (id);

-- Note Documents
ALTER TABLE note_documents
  ADD CONSTRAINT note_documents_id_documents_FK FOREIGN KEY (id_documents)
  REFERENCES documents (id);

ALTER TABLE note_documents
  ADD CONSTRAINT note_documents_id_notes_FK FOREIGN KEY (id_notes)
  REFERENCES notes (id);

-- Note Shares
ALTER TABLE note_shares
  ADD CONSTRAINT note_shares_id_notes_FK FOREIGN KEY (id_notes)
  REFERENCES notes (id);

ALTER TABLE note_shares
  ADD CONSTRAINT note_shares_id_users_FK FOREIGN KEY (id_users)
  REFERENCES users (id_users);

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
CREATE INDEX notes_id_users_IDX ON notes (id_users);
CREATE INDEX notes_id_projects_IDX ON notes (id_projects);

CREATE INDEX comments_comment_date_IDX ON comments (comment_date);
CREATE INDEX comments_id_notes_IDX ON comments (id_notes);

CREATE INDEX documents_upload_date_IDX ON documents (upload_date);
CREATE INDEX documents_id_uploaded_by_IDX ON documents (id_uploaded_by);

-- =====================================================
-- DONNÉES DE BASE (OPTIONNEL)
-- =====================================================

-- Rôles par défaut
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
  ('create_task', 'Peut créer des tâches'),
  ('edit_task', 'Peut modifier des tâches'),
  ('delete_task', 'Peut supprimer des tâches'),
  ('create_note', 'Peut créer des notes'),
  ('edit_note', 'Peut modifier des notes'),
  ('delete_note', 'Peut supprimer des notes'),
  ('manage_users', 'Peut gérer les utilisateurs'),
  ('view_all', 'Peut voir tous les contenus');

-- Attribution permissions Admin (id_roles = 1)
INSERT INTO role_permissions (id_permissions, id_roles)
SELECT id, 1 FROM permissions;

-- Attribution permissions Manager (id_roles = 2)
INSERT INTO role_permissions (id_permissions, id_roles)
SELECT id, 2 FROM permissions WHERE permission_name IN (
  'create_project', 'edit_project', 
  'create_task', 'edit_task', 'delete_task',
  'create_note', 'edit_note', 'delete_note',
  'view_all'
);

-- Attribution permissions Developer (id_roles = 3)
INSERT INTO role_permissions (id_permissions, id_roles)
SELECT id, 3 FROM permissions WHERE permission_name IN (
  'create_task', 'edit_task',
  'create_note', 'edit_note'
);

-- Attribution permissions Viewer (id_roles = 4)
INSERT INTO role_permissions (id_permissions, id_roles)
SELECT id, 4 FROM permissions WHERE permission_name = 'view_all';