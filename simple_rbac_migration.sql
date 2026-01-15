-- Migration RBAC Ultra-Simple - 4 permissions seulement
-- Objectif: Remplacer code hardcodé par DB simple

-- Nettoyer et redémarrer proprement
DELETE FROM role_permissions;
DELETE FROM permissions;

-- 8 permissions précises (couvre TOUS vos besoins)
INSERT INTO permissions (permission_name) VALUES 
('view_projects'),          -- Voir projets invités
('create_notes'),           -- Créer des notes
('edit_notes'),             -- Modifier des notes
('comment_notes'),          -- Commenter des notes
('manage_tags'),            -- Gérer les tags  
('manage_projects'),        -- Créer/supprimer projets
('manage_project_members'), -- Ajouter/retirer membres projets
('manage_users');           -- Gérer utilisateurs

-- Attribution EXACTE selon vos besoins détaillés
-- VIEWER (4): Voir projets invités + commenter seulement
INSERT INTO role_permissions (role_id, permission_id) VALUES
(4, (SELECT permission_id FROM permissions WHERE permission_name = 'view_projects')),
(4, (SELECT permission_id FROM permissions WHERE permission_name = 'comment_notes'));

-- DEVELOPER (3): Viewer + créer/modifier notes + gérer tags
INSERT INTO role_permissions (role_id, permission_id) VALUES
(3, (SELECT permission_id FROM permissions WHERE permission_name = 'view_projects')),
(3, (SELECT permission_id FROM permissions WHERE permission_name = 'create_notes')),
(3, (SELECT permission_id FROM permissions WHERE permission_name = 'edit_notes')),
(3, (SELECT permission_id FROM permissions WHERE permission_name = 'comment_notes')),
(3, (SELECT permission_id FROM permissions WHERE permission_name = 'manage_tags'));

-- MANAGER (2): Developer + gérer projets et membres  
INSERT INTO role_permissions (role_id, permission_id) VALUES
(2, (SELECT permission_id FROM permissions WHERE permission_name = 'view_projects')),
(2, (SELECT permission_id FROM permissions WHERE permission_name = 'create_notes')),
(2, (SELECT permission_id FROM permissions WHERE permission_name = 'edit_notes')),
(2, (SELECT permission_id FROM permissions WHERE permission_name = 'comment_notes')),
(2, (SELECT permission_id FROM permissions WHERE permission_name = 'manage_tags')),
(2, (SELECT permission_id FROM permissions WHERE permission_name = 'manage_projects')),
(2, (SELECT permission_id FROM permissions WHERE permission_name = 'manage_project_members'));

-- ADMIN (1): Toutes les permissions
INSERT INTO role_permissions (role_id, permission_id) 
SELECT 1, permission_id FROM permissions;

-- Vérification simple
SELECT r.role_name, p.permission_name 
FROM roles r 
JOIN role_permissions rp ON r.role_id = rp.role_id
JOIN permissions p ON rp.permission_id = p.permission_id  
ORDER BY r.role_id, p.permission_name;