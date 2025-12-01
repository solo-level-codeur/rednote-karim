-- Script pour ajouter les colonnes de profil à la table users
USE memory;

-- Ajouter les nouvelles colonnes de profil
ALTER TABLE users 
ADD COLUMN bio TEXT NULL,
ADD COLUMN job_title VARCHAR(100) NULL,
ADD COLUMN department VARCHAR(100) NULL,
ADD COLUMN phone VARCHAR(20) NULL,
ADD COLUMN avatar_url VARCHAR(255) NULL,
ADD COLUMN linkedin_url VARCHAR(255) NULL,
ADD COLUMN github_url VARCHAR(255) NULL;

-- Mettre à jour l'utilisateur admin avec des informations exemple
UPDATE users 
SET 
    bio = 'Administrateur système responsable de la gestion de la plateforme Memory. Passionné par le développement et la gestion de projets collaboratifs.',
    job_title = 'Administrateur Système',
    department = 'IT',
    phone = '+33 1 23 45 67 89'
WHERE email = 'admin@memory.com';

-- Vérifier les modifications
SELECT 
    id_users,
    firstname,
    lastname,
    email,
    bio,
    job_title,
    department,
    phone,
    created_at
FROM users 
WHERE email = 'admin@memory.com';

-- Afficher la structure mise à jour de la table
DESCRIBE users;