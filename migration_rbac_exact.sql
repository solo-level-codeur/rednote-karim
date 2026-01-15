-- Migration RBAC pour préserver exactement les droits hardcodés actuels
-- Date: 2026-01-15
-- Objectif: Passer du code hardcodé à la DB sans changer les permissions

SET FOREIGN_KEY_CHECKS = 0;

-- =====================================
-- ÉTAPE 1: Nettoyer les permissions existantes
-- =====================================

DELETE FROM role_permissions;
DELETE FROM permissions WHERE permission_id > 8; -- Garder les permissions de base

-- =====================================
-- ÉTAPE 2: Ajouter permissions manquantes spécifiques
-- =====================================

INSERT INTO permissions (permission_name) VALUES 
('view_invited_projects'),      -- Voir projets où invité
('create_notes_in_projects'),   -- Créer notes dans projets invités
('edit_notes_in_projects'),     -- Modifier notes dans projets invités  
('create_projects'),            -- Créer nouveaux projets
('delete_projects'),            -- Supprimer projets
('manage_project_members'),     -- Ajouter/retirer membres projets
('manage_users'),               -- Créer/modifier/supprimer utilisateurs
('manage_user_roles'),          -- Modifier rôles des utilisateurs
('manage_tags'),                -- Gérer les tags
('admin_override')              -- Accès admin total (bypass toutes restrictions)
ON DUPLICATE KEY UPDATE permission_name = VALUES(permission_name);

-- =====================================
-- ÉTAPE 3: Attribution EXACTE selon droits actuels
-- =====================================

-- VIEWER (Rôle 4) - Lecture seule dans projets invités
INSERT INTO role_permissions (role_id, permission_id) VALUES
(4, (SELECT permission_id FROM permissions WHERE permission_name = 'view_invited_projects')),
(4, (SELECT permission_id FROM permissions WHERE permission_name = 'view_notes')),
(4, (SELECT permission_id FROM permissions WHERE permission_name = 'comment_notes'));

-- DEVELOPER (Rôle 3) - Création dans projets + tags
INSERT INTO role_permissions (role_id, permission_id) VALUES
(3, (SELECT permission_id FROM permissions WHERE permission_name = 'view_invited_projects')),
(3, (SELECT permission_id FROM permissions WHERE permission_name = 'view_notes')),
(3, (SELECT permission_id FROM permissions WHERE permission_name = 'create_notes')),
(3, (SELECT permission_id FROM permissions WHERE permission_name = 'create_notes_in_projects')),
(3, (SELECT permission_id FROM permissions WHERE permission_name = 'edit_notes')),
(3, (SELECT permission_id FROM permissions WHERE permission_name = 'edit_notes_in_projects')),
(3, (SELECT permission_id FROM permissions WHERE permission_name = 'comment_notes')),
(3, (SELECT permission_id FROM permissions WHERE permission_name = 'share_notes')),
(3, (SELECT permission_id FROM permissions WHERE permission_name = 'manage_tags'));

-- MANAGER (Rôle 2) - Tout Developer + gestion projets
INSERT INTO role_permissions (role_id, permission_id) VALUES
-- Hérite des droits Developer
(2, (SELECT permission_id FROM permissions WHERE permission_name = 'view_invited_projects')),
(2, (SELECT permission_id FROM permissions WHERE permission_name = 'view_notes')),
(2, (SELECT permission_id FROM permissions WHERE permission_name = 'create_notes')),
(2, (SELECT permission_id FROM permissions WHERE permission_name = 'create_notes_in_projects')),
(2, (SELECT permission_id FROM permissions WHERE permission_name = 'edit_notes')),
(2, (SELECT permission_id FROM permissions WHERE permission_name = 'edit_notes_in_projects')),
(2, (SELECT permission_id FROM permissions WHERE permission_name = 'delete_notes')),
(2, (SELECT permission_id FROM permissions WHERE permission_name = 'comment_notes')),
(2, (SELECT permission_id FROM permissions WHERE permission_name = 'share_notes')),
(2, (SELECT permission_id FROM permissions WHERE permission_name = 'manage_tags')),
-- Droits spécifiques Manager
(2, (SELECT permission_id FROM permissions WHERE permission_name = 'create_projects')),
(2, (SELECT permission_id FROM permissions WHERE permission_name = 'delete_projects')),
(2, (SELECT permission_id FROM permissions WHERE permission_name = 'manage_projects')),
(2, (SELECT permission_id FROM permissions WHERE permission_name = 'manage_project_members'));

-- ADMIN (Rôle 1) - Tous les droits + gestion utilisateurs
INSERT INTO role_permissions (role_id, permission_id) 
SELECT 1, permission_id FROM permissions; -- Admin a TOUTES les permissions

-- =====================================
-- ÉTAPE 4: Vérification des assignations
-- =====================================

-- Compter permissions par rôle (pour vérification)
SELECT 
    r.role_name,
    COUNT(rp.permission_id) as nb_permissions,
    GROUP_CONCAT(p.permission_name) as permissions_list
FROM roles r 
LEFT JOIN role_permissions rp ON r.role_id = rp.role_id
LEFT JOIN permissions p ON rp.permission_id = p.permission_id
GROUP BY r.role_id, r.role_name
ORDER BY r.role_id;

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================
-- RÉSUMÉ MIGRATION
-- =====================================
/*
VIEWER (4):    3 permissions - Lecture seule projets invités
DEVELOPER (3): 9 permissions - Création + modification dans projets
MANAGER (2):   13 permissions - Developer + gestion projets  
ADMIN (1):     Toutes permissions - Accès complet

Cette migration préserve EXACTEMENT la logique hardcodée actuelle.
*/