# Matrice des Données

| Table | Description | Colonnes Clés |
|-------|-------------|---------------|
| **users** | Utilisateurs de l'application | `id_users`, `email`, `password`, `firstname`, `lastname`, `id_roles` |
| **roles** | Rôles système (Admin, User, etc.) | `id`, `role_name` |
| **permissions** | Droits d'accès granulaires | `id`, `permission_name` |
| **projects** | Espaces de travail collaboratifs | `id`, `name`, `status`, `id_owner` |
| **project_members** | Membres associés aux projets | `id_projects`, `id_users`, `role` |
| **notes** | Contenu principal (texte riche) | `id`, `title`, `content`, `id_projects`, `id_users` |
| **comments** | Discussions sur les notes | `id`, `content`, `id_notes`, `id_users` |
| **documents** | Fichiers uploadés | `id`, `filename`, `path`, `mime_type` |
| **tags** | Étiquettes de classification | `id`, `name`, `color` |
| **tasks** | Gestion de tâches (futur) | `id`, `name`, `status`, `priority`, `id_assigned_to` |

## Relations Principales
- **Users <-> Projects** : 1-N (Owner), N-N (Members)
- **Projects <-> Notes** : 1-N
- **Notes <-> Comments** : 1-N
- **Notes <-> Tags** : N-N
- **Users <-> Roles** : N-1
