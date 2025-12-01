-- ----------------------------------------------------------
-- Script pour corriger la table note_shares
-- ----------------------------------------------------------

USE memory;

-- Ajouter la colonne shared_by à la table note_shares
ALTER TABLE note_shares ADD COLUMN shared_by INT NOT NULL DEFAULT 1 AFTER id_users;

-- Ajouter la contrainte de clé étrangère
ALTER TABLE note_shares ADD CONSTRAINT note_shares_shared_by_FK 
    FOREIGN KEY (shared_by) REFERENCES users (id_users);

-- Vérifier la structure mise à jour
DESCRIBE note_shares;

-- Afficher un message de succès
SELECT 'Colonne shared_by ajoutée avec succès!' AS Status;