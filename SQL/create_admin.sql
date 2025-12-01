-- Script pour créer un utilisateur administrateur
USE memory;

-- Supprimer l'utilisateur admin s'il existe déjà
DELETE FROM users WHERE email = 'admin@memory.com';

-- Créer un utilisateur admin 
-- Mot de passe: 'admin123' (hashé avec bcrypt)
INSERT INTO users (firstname, lastname, email, password, id_roles, created_at) VALUES 
('Admin', 'System', 'admin@memory.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1, NOW());

-- Vérifier la création
SELECT 
    id_users,
    firstname,
    lastname, 
    email,
    id_roles,
    CASE 
        WHEN id_roles = 1 THEN 'Admin'
        WHEN id_roles = 2 THEN 'Manager' 
        WHEN id_roles = 3 THEN 'Developer'
        WHEN id_roles = 4 THEN 'Viewer'
        ELSE 'Unknown'
    END as role_name,
    created_at
FROM users 
WHERE email = 'admin@memory.com';

-- Afficher tous les utilisateurs pour vérification
SELECT 
    id_users,
    firstname,
    lastname, 
    email,
    id_roles,
    CASE 
        WHEN id_roles = 1 THEN 'Admin'
        WHEN id_roles = 2 THEN 'Manager' 
        WHEN id_roles = 3 THEN 'Developer'
        WHEN id_roles = 4 THEN 'Viewer'
        ELSE 'Unknown'
    END as role_name,
    created_at
FROM users 
ORDER BY id_roles, created_at;