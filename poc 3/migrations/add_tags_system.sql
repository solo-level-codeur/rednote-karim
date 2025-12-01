-- Script de migration pour ajouter les systèmes complets

-- ==========================================
-- 1. SYSTÈME DE TAGS
-- ==========================================

-- Modifier la table tags existante pour ajouter created_by
ALTER TABLE tags ADD COLUMN created_by INT;

-- Créer la table de liaison note_tags
CREATE TABLE IF NOT EXISTS note_tags (
  id_note INT NOT NULL,
  id_tag INT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_note, id_tag),
  FOREIGN KEY (id_note) REFERENCES notes(id) ON DELETE CASCADE,
  FOREIGN KEY (id_tag) REFERENCES tags(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Ajouter des contraintes pour tags
ALTER TABLE tags ADD CONSTRAINT tags_created_by_FK 
  FOREIGN KEY (created_by) REFERENCES users(id_users) ON DELETE CASCADE;

-- ==========================================
-- 2. SYSTÈME DE PARTAGE
-- ==========================================

-- Créer la table note_shares (elle devrait exister dans le schéma original)
-- Si elle n'existe pas, la créer
CREATE TABLE IF NOT EXISTS note_shares (
  id_notes INT NOT NULL,
  id_users INT NOT NULL,
  shared_by INT NOT NULL,
  permission ENUM('read', 'write') NOT NULL DEFAULT 'read',
  shared_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_notes, id_users),
  FOREIGN KEY (id_notes) REFERENCES notes(id) ON DELETE CASCADE,
  FOREIGN KEY (id_users) REFERENCES users(id_users) ON DELETE CASCADE,
  FOREIGN KEY (shared_by) REFERENCES users(id_users) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ==========================================
-- 3. SYSTÈME DE COMMENTAIRES
-- ==========================================

-- Vérifier si la table comments existe et la modifier si nécessaire
-- Ajouter updated_date si elle n'existe pas
ALTER TABLE comments ADD COLUMN updated_date DATETIME DEFAULT NULL;

-- ==========================================
-- 4. MODIFICATIONS GÉNÉRALES
-- ==========================================

-- Modifier la table notes pour rendre id_projects nullable (pour les notes sans projet)
ALTER TABLE notes MODIFY COLUMN id_projects INT NULL;