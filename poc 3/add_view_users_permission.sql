-- Migration RBAC : Ajouter permission view_users pour Managers
-- Solution sécurisée : Manager peut voir users mais pas les gérer

USE elite_notes;

-- 1. Créer la permission view_users
INSERT INTO permissions (permission_name) VALUES ('view_users');

-- 2. Attribuer view_users aux Managers (role_id = 2)
INSERT INTO role_permissions (role_id, permission_id) VALUES
(2, (SELECT permission_id FROM permissions WHERE permission_name = 'view_users'));

-- 3. Attribuer view_users aux Admins aussi (role_id = 1) pour cohérence
INSERT INTO role_permissions (role_id, permission_id) VALUES
(1, (SELECT permission_id FROM permissions WHERE permission_name = 'view_users'));

-- Vérification
SELECT r.role_name, p.permission_name 
FROM roles r 
JOIN role_permissions rp ON r.role_id = rp.role_id
JOIN permissions p ON rp.permission_id = p.permission_id  
WHERE p.permission_name = 'view_users'
ORDER BY r.role_id;