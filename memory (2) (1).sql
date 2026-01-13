-- ----------------------------------------------------------
-- Script MYSQL pour mcd - Version corrigée avec données initiales
-- ----------------------------------------------------------

SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table: roles
-- ----------------------------
DROP TABLE IF EXISTS roles;
CREATE TABLE roles (
  role_id INT NOT NULL AUTO_INCREMENT,
  role_name VARCHAR(255) NOT NULL,
  CONSTRAINT roles_PK PRIMARY KEY (role_id),
  CONSTRAINT role_name_UNQ UNIQUE (role_name)
) ENGINE=InnoDB;

-- Insertion des rôles
INSERT INTO roles (role_id, role_name) VALUES
(1, 'Admin'),
(2, 'Manager'),
(3, 'Developer'),
(4, 'Viewer');

-- ----------------------------
-- Table: permissions
-- ----------------------------
DROP TABLE IF EXISTS permissions;
CREATE TABLE permissions (
  permission_id INT NOT NULL AUTO_INCREMENT,
  permission_name VARCHAR(255) NOT NULL,
  CONSTRAINT permissions_PK PRIMARY KEY (permission_id),
  CONSTRAINT permission_name_UNQ UNIQUE (permission_name)
) ENGINE=InnoDB;

-- Insertion des permissions de base
INSERT INTO permissions (permission_name) VALUES
('create_notes'),
('edit_notes'),
('delete_notes'),
('view_notes'),
('manage_users'),
('manage_projects'),
('share_notes'),
('comment_notes');

-- ----------------------------
-- Table: role_permissions
-- ----------------------------
DROP TABLE IF EXISTS role_permissions;
CREATE TABLE role_permissions (
  permission_id INT NOT NULL,
  role_id INT NOT NULL,
  CONSTRAINT role_permissions_PK PRIMARY KEY (permission_id, role_id),
  CONSTRAINT role_permissions_permission_id_FK FOREIGN KEY (permission_id) REFERENCES permissions (permission_id) ON DELETE CASCADE,
  CONSTRAINT role_permissions_role_id_FK FOREIGN KEY (role_id) REFERENCES roles (role_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ----------------------------
-- Table: users
-- ----------------------------
DROP TABLE IF EXISTS users;
CREATE TABLE users (
  user_id INT NOT NULL AUTO_INCREMENT,
  firstname VARCHAR(20) NOT NULL,
  lastname VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  telephone VARCHAR(20) NOT NULL,
  description TEXT NOT NULL,
  role_id INT NOT NULL DEFAULT 3,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT users_PK PRIMARY KEY (user_id),
  CONSTRAINT email_UNQ UNIQUE (email),
  CONSTRAINT users_role_id_FK FOREIGN KEY (role_id) REFERENCES roles (role_id)
) ENGINE=InnoDB;

-- ----------------------------
-- Table: skills
-- ----------------------------
DROP TABLE IF EXISTS skills;
CREATE TABLE skills (
  skill_id INT NOT NULL AUTO_INCREMENT,
  skill_name VARCHAR(255) NOT NULL,
  CONSTRAINT skills_PK PRIMARY KEY (skill_id),
  CONSTRAINT skill_name_UNQ UNIQUE (skill_name)
) ENGINE=InnoDB;

-- ----------------------------
-- Table: user_skills
-- ----------------------------
DROP TABLE IF EXISTS user_skills;
CREATE TABLE user_skills (
  skill_id INT NOT NULL,
  user_id INT NOT NULL,
  CONSTRAINT user_skills_PK PRIMARY KEY (skill_id, user_id),
  CONSTRAINT user_skills_skill_id_FK FOREIGN KEY (skill_id) REFERENCES skills (skill_id) ON DELETE CASCADE,
  CONSTRAINT user_skills_user_id_FK FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ----------------------------
-- Table: projects
-- ----------------------------
DROP TABLE IF EXISTS projects;
CREATE TABLE projects (
  project_id INT NOT NULL AUTO_INCREMENT,
  project_name VARCHAR(255) NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT projects_PK PRIMARY KEY (project_id),
  CONSTRAINT projects_user_id_FK FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ----------------------------
-- Table: project_members
-- ----------------------------
DROP TABLE IF EXISTS project_members;
CREATE TABLE project_members (
  user_id INT NOT NULL,
  project_id INT NOT NULL,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT project_members_PK PRIMARY KEY (user_id, project_id),
  CONSTRAINT project_members_user_id_FK FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE,
  CONSTRAINT project_members_project_id_FK FOREIGN KEY (project_id) REFERENCES projects (project_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ----------------------------
-- Table: notes
-- ----------------------------
DROP TABLE IF EXISTS notes;
CREATE TABLE notes (
  note_id INT NOT NULL AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  user_id INT NOT NULL,
  project_id INT,
  CONSTRAINT notes_PK PRIMARY KEY (note_id),
  CONSTRAINT notes_user_id_FK FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE,
  CONSTRAINT notes_project_id_FK FOREIGN KEY (project_id) REFERENCES projects (project_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ----------------------------
-- Table: tags
-- ----------------------------
DROP TABLE IF EXISTS tags;
CREATE TABLE tags (
  tag_id INT NOT NULL AUTO_INCREMENT,
  tag_name VARCHAR(255) NOT NULL,
  CONSTRAINT tags_PK PRIMARY KEY (tag_id),
  CONSTRAINT tag_name_UNQ UNIQUE (tag_name)
) ENGINE=InnoDB;

-- ----------------------------
-- Table: note_tags
-- ----------------------------
DROP TABLE IF EXISTS note_tags;
CREATE TABLE note_tags (
  tag_id INT NOT NULL,
  note_id INT NOT NULL,
  CONSTRAINT note_tags_PK PRIMARY KEY (tag_id, note_id),
  CONSTRAINT note_tags_tag_id_FK FOREIGN KEY (tag_id) REFERENCES tags (tag_id) ON DELETE CASCADE,
  CONSTRAINT note_tags_note_id_FK FOREIGN KEY (note_id) REFERENCES notes (note_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ----------------------------
-- Table: project_tags
-- ----------------------------
DROP TABLE IF EXISTS project_tags;
CREATE TABLE project_tags (
  tag_id INT NOT NULL,
  project_id INT NOT NULL,
  CONSTRAINT project_tags_PK PRIMARY KEY (tag_id, project_id),
  CONSTRAINT project_tags_tag_id_FK FOREIGN KEY (tag_id) REFERENCES tags (tag_id) ON DELETE CASCADE,
  CONSTRAINT project_tags_project_id_FK FOREIGN KEY (project_id) REFERENCES projects (project_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ----------------------------
-- Table: comments
-- ----------------------------
DROP TABLE IF EXISTS comments;
CREATE TABLE comments (
  comment_id INT NOT NULL AUTO_INCREMENT,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  note_id INT NOT NULL,
  user_id INT NOT NULL,
  CONSTRAINT comments_PK PRIMARY KEY (comment_id),
  CONSTRAINT comments_note_id_FK FOREIGN KEY (note_id) REFERENCES notes (note_id) ON DELETE CASCADE,
  CONSTRAINT comments_user_id_FK FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ----------------------------
-- Table: note_shares
-- ----------------------------
DROP TABLE IF EXISTS note_shares;
CREATE TABLE note_shares (
  user_id INT NOT NULL,
  note_id INT NOT NULL,
  shared_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  permission ENUM('Read','Write','Admin') NOT NULL DEFAULT 'Read',
  CONSTRAINT note_shares_PK PRIMARY KEY (user_id, note_id),
  CONSTRAINT note_shares_user_id_FK FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE,
  CONSTRAINT note_shares_note_id_FK FOREIGN KEY (note_id) REFERENCES notes (note_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ----------------------------
-- Table: documents
-- ----------------------------
DROP TABLE IF EXISTS documents;
CREATE TABLE documents (
  document_id INT NOT NULL AUTO_INCREMENT,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  user_id INT NOT NULL,
  CONSTRAINT documents_PK PRIMARY KEY (document_id),
  CONSTRAINT documents_user_id_FK FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ----------------------------
-- Table: note_documents
-- ----------------------------
DROP TABLE IF EXISTS note_documents;
CREATE TABLE note_documents (
  document_id INT NOT NULL,
  note_id INT NOT NULL,
  CONSTRAINT note_documents_PK PRIMARY KEY (document_id, note_id),
  CONSTRAINT note_documents_document_id_FK FOREIGN KEY (document_id) REFERENCES documents (document_id) ON DELETE CASCADE,
  CONSTRAINT note_documents_note_id_FK FOREIGN KEY (note_id) REFERENCES notes (note_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ----------------------------
-- Table: tasks
-- ----------------------------
DROP TABLE IF EXISTS tasks;
CREATE TABLE tasks (
  task_id INT NOT NULL AUTO_INCREMENT,
  task_name VARCHAR(255) NOT NULL,
  description TEXT,
  due_date DATE,
  status VARCHAR(50) DEFAULT 'TODO',
  project_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT tasks_PK PRIMARY KEY (task_id),
  CONSTRAINT tasks_project_id_FK FOREIGN KEY (project_id) REFERENCES projects (project_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ----------------------------
-- Table: user_task
-- ----------------------------
DROP TABLE IF EXISTS user_task;
CREATE TABLE user_task (
  task_id INT NOT NULL,
  user_id INT NOT NULL,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT user_task_PK PRIMARY KEY (task_id, user_id),
  CONSTRAINT user_task_task_id_FK FOREIGN KEY (task_id) REFERENCES tasks (task_id) ON DELETE CASCADE,
  CONSTRAINT user_task_user_id_FK FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;

-- ----------------------------
-- Données initiales pour les compétences
-- ----------------------------
INSERT INTO skills (skill_name) VALUES
('JavaScript'),
('Python'),
('Java'),
('PHP'),
('Node.js'),
('React'),
('Vue.js'),
('Angular'),
('MySQL'),
('MongoDB'),
('Docker'),
('Git');