-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : localhost:8889
-- Généré le : jeu. 15 jan. 2026 à 09:06
-- Version du serveur : 8.0.35
-- Version de PHP : 8.2.20

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `memo`
--

-- --------------------------------------------------------

--
-- Structure de la table `comments`
--

CREATE TABLE `comments` (
  `comment_id` int NOT NULL,
  `comment_text` text NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `note_id` int NOT NULL,
  `user_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `comments`
--

INSERT INTO `comments` (`comment_id`, `comment_text`, `created_at`, `note_id`, `user_id`) VALUES
(2, 'un', '2026-01-13 15:17:54', 3, 1),
(3, 'un', '2026-01-13 15:18:36', 3, 1),
(4, 'jn', '2026-01-13 15:18:47', 3, 1),
(5, 'lol', '2026-01-14 07:54:29', 3, 4),
(6, 'k', '2026-01-14 08:37:20', 12, 4),
(9, 'un', '2026-01-14 18:50:38', 25, 19),
(14, 'inc', '2026-01-14 22:14:22', 30, 23);

-- --------------------------------------------------------

--
-- Structure de la table `documents`
--

CREATE TABLE `documents` (
  `document_id` int NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `uploaded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `user_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `notes`
--

CREATE TABLE `notes` (
  `note_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `user_id` int NOT NULL,
  `project_id` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `notes`
--

INSERT INTO `notes` (`note_id`, `title`, `content`, `created_at`, `updated_at`, `user_id`, `project_id`) VALUES
(3, 'Test Note', '<p>Ceci est une note de testjj. jiujnjnj</p>', '2026-01-13 14:52:06', '2026-01-14 08:01:29', 1, NULL),
(8, 'Note du Projet Partagé', 'Cette note est dans le projet partagé avec Alice', '2026-01-13 15:37:31', '2026-01-13 15:37:31', 2, 4),
(12, 'Note technique du projet', '<p>Cette note contient les spécifications techniques du projet et les bonnes pratiques à suivre.</p>', '2026-01-13 22:01:11', '2026-01-14 08:37:13', 7, NULL),
(14, 'Spécifications du projet partagé', 'Cette note contient les spécifications que le Developer doit pouvoir modifier car il est membre du projet.', '2026-01-13 22:10:42', '2026-01-13 22:10:42', 7, 8),
(19, 'lol', '<p>lol</p>', '2026-01-14 10:04:18', '2026-01-14 10:04:18', 4, 11),
(20, 'Note de test', 'Contenu de test pour les commentaires', '2026-01-14 17:08:57', '2026-01-14 17:08:57', 14, 13),
(21, 'super', '<p>une note</p>', '2026-01-14 17:21:41', '2026-01-14 17:21:41', 13, 14),
(22, 'salut', '<p>szlut</p>', '2026-01-14 17:49:03', '2026-01-14 17:49:03', 19, 17),
(24, 'salut', '<p>salut</p>', '2026-01-14 17:49:46', '2026-01-14 17:49:46', 19, 17),
(25, 'sa', '<p>sz</p>', '2026-01-14 17:49:57', '2026-01-14 18:50:52', 19, NULL),
(26, 'Test Note SQL Lisible', 'Contenu test après nettoyage SQL', '2026-01-14 17:54:13', '2026-01-14 17:54:13', 15, 18),
(27, 'test', '<p>test</p>', '2026-01-14 21:05:53', '2026-01-14 21:05:53', 19, 20),
(28, 'salut', '<p>ddd</p>', '2026-01-14 21:22:18', '2026-01-14 21:22:18', 4, 21),
(30, 'note', '<p>note </p>', '2026-01-14 22:13:23', '2026-01-14 22:13:23', 24, 22);

-- --------------------------------------------------------

--
-- Structure de la table `note_documents`
--

CREATE TABLE `note_documents` (
  `document_id` int NOT NULL,
  `note_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `note_shares`
--

CREATE TABLE `note_shares` (
  `user_id` int NOT NULL,
  `note_id` int NOT NULL,
  `shared_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `permission` enum('Read','Write','Admin') NOT NULL DEFAULT 'Read'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `note_tags`
--

CREATE TABLE `note_tags` (
  `tag_id` int NOT NULL,
  `note_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `note_tags`
--

INSERT INTO `note_tags` (`tag_id`, `note_id`) VALUES
(5, 19),
(6, 19),
(5, 27);

-- --------------------------------------------------------

--
-- Structure de la table `permissions`
--

CREATE TABLE `permissions` (
  `permission_id` int NOT NULL,
  `permission_name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `permissions`
--

INSERT INTO `permissions` (`permission_id`, `permission_name`) VALUES
(8, 'comment_notes'),
(1, 'create_notes'),
(3, 'delete_notes'),
(2, 'edit_notes'),
(6, 'manage_projects'),
(5, 'manage_users'),
(7, 'share_notes'),
(4, 'view_notes');

-- --------------------------------------------------------

--
-- Structure de la table `projects`
--

CREATE TABLE `projects` (
  `project_id` int NOT NULL,
  `project_name` varchar(255) NOT NULL,
  `description` text,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `user_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `projects`
--

INSERT INTO `projects` (`project_id`, `project_name`, `description`, `start_date`, `end_date`, `user_id`, `created_at`, `updated_at`) VALUES
(1, 'Projet par défaut', 'Notes personnelles', '2026-01-13', NULL, 1, '2026-01-13 14:41:52', '2026-01-13 14:41:52'),
(3, 'Projet par défaut', 'Notes personnelles', '2026-01-13', NULL, 2, '2026-01-13 14:58:34', '2026-01-13 14:58:34'),
(4, 'Projet Partagé', 'Un projet partagé entre utilisateurs', '2026-01-13', NULL, 2, '2026-01-13 15:36:58', '2026-01-13 15:36:58'),
(8, 'Projet par défaut', 'Notes personnelles', '2026-01-13', NULL, 7, '2026-01-13 22:01:11', '2026-01-13 22:01:11'),
(10, 'Projet Privé Manager', 'Projet privé où le Developer ne devrait pas pouvoir déplacer ses notes', '2026-01-13', NULL, 7, '2026-01-13 22:06:59', '2026-01-13 22:06:59'),
(11, 'Projet par défaut', 'Notes personnelles', '2026-01-13', NULL, 4, '2026-01-13 22:22:35', '2026-01-13 22:22:35'),
(13, 'Projet par défaut', 'Notes personnelles', '2026-01-14', NULL, 14, '2026-01-14 17:08:57', '2026-01-14 17:08:57'),
(14, 'Projet par défaut', 'Notes personnelles', '2026-01-14', NULL, 13, '2026-01-14 17:21:41', '2026-01-14 17:21:41'),
(17, 'Projet par défaut', 'Notes personnelles', '2026-01-14', NULL, 19, '2026-01-14 17:49:03', '2026-01-14 17:49:03'),
(18, 'Projet par défaut', 'Notes personnelles', '2026-01-14', NULL, 15, '2026-01-14 17:54:13', '2026-01-14 17:54:13'),
(19, 'super', 'simple', '2026-01-14', NULL, 19, '2026-01-14 20:49:27', '2026-01-14 20:49:27'),
(20, 'salut v2', 'de', '2026-01-14', NULL, 19, '2026-01-14 21:02:45', '2026-01-14 21:02:45'),
(21, 'beta', '', '2026-01-14', NULL, 19, '2026-01-14 21:03:43', '2026-01-14 21:03:43'),
(22, 'cda', 'salut hatem on fais une reunion pour karil ?', '2026-01-14', NULL, 24, '2026-01-14 21:34:52', '2026-01-14 21:34:52');

-- --------------------------------------------------------

--
-- Structure de la table `project_members`
--

CREATE TABLE `project_members` (
  `user_id` int NOT NULL,
  `project_id` int NOT NULL,
  `joined_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `project_members`
--

INSERT INTO `project_members` (`user_id`, `project_id`, `joined_at`) VALUES
(2, 21, '2026-01-14 21:05:09'),
(3, 4, '2026-01-13 15:37:14'),
(14, 21, '2026-01-14 21:05:13'),
(23, 22, '2026-01-14 22:13:12');

-- --------------------------------------------------------

--
-- Structure de la table `project_tags`
--

CREATE TABLE `project_tags` (
  `tag_id` int NOT NULL,
  `project_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `roles`
--

CREATE TABLE `roles` (
  `role_id` int NOT NULL,
  `role_name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `roles`
--

INSERT INTO `roles` (`role_id`, `role_name`) VALUES
(1, 'Admin'),
(3, 'Developer'),
(2, 'Manager'),
(4, 'Viewer');

-- --------------------------------------------------------

--
-- Structure de la table `role_permissions`
--

CREATE TABLE `role_permissions` (
  `permission_id` int NOT NULL,
  `role_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `role_permissions`
--

INSERT INTO `role_permissions` (`permission_id`, `role_id`) VALUES
(1, 1),
(2, 1),
(3, 1),
(4, 1),
(5, 1),
(6, 1),
(7, 1),
(8, 1),
(1, 2),
(2, 2),
(3, 2),
(4, 2),
(6, 2),
(7, 2),
(8, 2),
(1, 3),
(2, 3),
(4, 3),
(7, 3),
(8, 3),
(4, 4),
(8, 4);

-- --------------------------------------------------------

--
-- Structure de la table `skills`
--

CREATE TABLE `skills` (
  `skill_id` int NOT NULL,
  `skill_name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `skills`
--

INSERT INTO `skills` (`skill_id`, `skill_name`) VALUES
(8, 'Angular'),
(11, 'Docker'),
(12, 'Git'),
(3, 'Java'),
(1, 'JavaScript'),
(10, 'MongoDB'),
(9, 'MySQL'),
(5, 'Node.js'),
(4, 'PHP'),
(2, 'Python'),
(6, 'React'),
(7, 'Vue.js');

-- --------------------------------------------------------

--
-- Structure de la table `tags`
--

CREATE TABLE `tags` (
  `tag_id` int NOT NULL,
  `tag_name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `tags`
--

INSERT INTO `tags` (`tag_id`, `tag_name`) VALUES
(5, 'john constantine'),
(6, 'lol'),
(8, 'non'),
(1, 'test');

-- --------------------------------------------------------

--
-- Structure de la table `tasks`
--

CREATE TABLE `tasks` (
  `task_id` int NOT NULL,
  `task_name` varchar(255) NOT NULL,
  `description` text,
  `due_date` date DEFAULT NULL,
  `status` varchar(50) DEFAULT 'TODO',
  `project_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

CREATE TABLE `users` (
  `user_id` int NOT NULL,
  `firstname` varchar(20) NOT NULL,
  `lastname` varchar(20) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `telephone` varchar(20) NOT NULL,
  `description` text NOT NULL,
  `role_id` int NOT NULL DEFAULT '3',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`user_id`, `firstname`, `lastname`, `email`, `password`, `telephone`, `description`, `role_id`, `created_at`, `updated_at`) VALUES
(1, 'John', 'Doe', 'john.doe@example.com', '$2b$10$FTXvuSW6mnUQIFUmbLKqDOdguyXtvQKidFdvxHyXCfg9ZU/1hAorS', '0123456789', 'Développeur full-stack', 1, '2026-01-13 14:40:09', '2026-01-13 14:40:09'),
(2, 'Test', 'User', 'testuser@example.com', '$2b$10$1vZqd5pqUhYHSMOb4Ze7IOi/hJsVf6OBKYn30e/Bs77vBydg8YhOS', '1234567890', 'Test description', 1, '2026-01-13 14:58:24', '2026-01-13 14:58:24'),
(3, 'Alice', 'Dupont', 'alice.dupont@test.com', '$2b$10$L9jzFoNqntzsQAD8c9RjJeTxUxnMhIdStf9CZkgq3jzC8qN4xiKzu', '0123456789', 'Développeuse test', 1, '2026-01-13 15:35:30', '2026-01-13 15:35:30'),
(4, 'John', 'Doe', 'kira@gmail.com', '$2b$10$3nkLJPBzknc/vyBmKHfEj.XyowPhGdpS9Kwpbmek9X3Ea9O/YI7aO', '0123456789', 'Développeur full-stack. ', 1, '2026-01-13 15:44:27', '2026-01-13 20:52:47'),
(5, 'Sophie', 'Martin', 'sophie.martin@manager.com', '$2b$10$kSTqzBmeAYyUtSO7ObsPaOD0.Zlb80W0UF56dsJRktiNYUEi/ZR1W', '0123456789', 'Chef de projet technique', 1, '2026-01-13 21:51:47', '2026-01-13 21:51:47'),
(6, 'Thomas', 'Dupont', 'thomas.dupont@dev.com', '$2b$10$vH8UoRknuDI5lL3Hr1Si3.jQ.iQDDUT/Qh56ZkMx.4AWHL5IsHauq', '0987654321', 'Développeur full-stack', 1, '2026-01-13 21:52:10', '2026-01-13 21:52:10'),
(7, 'Marie', 'Durand', 'marie.durand@manager.com', '$2b$10$f48fwJsqRm/rxeZHh4342OhuOl8aVZ8LrzyV4/CMXBWW9XqayGZSG', '0123456789', 'Cheffe de projet', 2, '2026-01-13 21:55:40', '2026-01-13 21:55:40'),
(9, 'John', 'Doe', 'lolo@gmail.com', '$2b$10$nTp44lfoEIlptogr9u7XCOKxlRhZEeflGUutC.aQtOub/HNYxqN.u', '0123456789', 'Développeur full-stack', 3, '2026-01-14 08:43:41', '2026-01-14 08:43:41'),
(10, 'test', 'user2', 'testuser2@example.com', '$2b$10$q7X7Gsjpfews3UREiL0xje3XMwzrJsG0JpCLkBq4xGFo5WagJs/vC', '', '', 3, '2026-01-14 09:58:04', '2026-01-14 09:58:04'),
(11, 'hyyh', 'jhjh', 'un@gmail.com', '$2b$10$nDNNXBhcFi5aZP0t40HaUuZE3WphI7R9bwaQcmyocCwvwzHLX1IQa', '', '', 3, '2026-01-14 10:01:17', '2026-01-14 10:01:17'),
(12, 'Test', 'User', 'test@test.com', '$2b$10$963OMRqmF5Zq0hrVaRws4e4N5Igsax5yyWFav6oCP/M0vP6AvMYL.', '', '', 3, '2026-01-14 16:39:23', '2026-01-14 16:39:23'),
(13, 'John', 'Doe', 'mama@gmail.com', '$2b$10$W6WEQ70/qawQRsHs0ebIDOa/MxVZjqNwMEIoV371cVzViybDihrbC', '0123456789', 'Développeur full-stack', 3, '2026-01-14 16:40:52', '2026-01-14 16:40:52'),
(14, 'Admin', 'Test', 'admin@test.com', '$2b$10$1NF3ub3ZE2PiOXPQyebP3eVuRdkfnGfZO/dQeWDnGcqWRa/l1Yeyq', '', '', 1, '2026-01-14 16:46:02', '2026-01-14 16:46:02'),
(15, 'ProjectTest', 'User', 'projecttest@example.com', '$2b$10$A02QfHK2R6nzoRd899t/nOIIBCtT0Z9VWjHWGGNsNGeH7uPHeGDwS', '', '', 3, '2026-01-14 17:20:05', '2026-01-14 17:20:05'),
(16, 'Manager', 'Test', 'manager@example.com', '$2b$10$Rg8rUd5hTMPPpmgrffjBUOc4Ht/BYN4GTlUtB3HWblN3YqDUG.H.m', '', '', 3, '2026-01-14 17:21:11', '2026-01-14 17:21:11'),
(17, 'John', 'Doe', 'ma@gmail.com', '$2b$10$IICU6zhfAWWFvaBb0AVimOVYCmlhUEUt18A7n4kcjplaDsa.r99rC', '0123456789', 'Développeur full-stack', 3, '2026-01-14 17:23:51', '2026-01-14 17:23:51'),
(18, 'Manager', 'Elite', 'manager@elite.com', '$2b$10$s2OFzJ5RwaPfg4tjXxhmL.g..JLbr.iVAY2RQj0dv8dwbyJBVSIcq', '', '', 3, '2026-01-14 17:31:16', '2026-01-14 17:31:16'),
(19, 'Manager', 'Elite', 'manager2@elite.com', '$2b$10$pbVMyTMm4iyevs2WpzkyqOVYIw1JItGaM/R34HPzFkPW4brDRmBTG', '', '', 2, '2026-01-14 17:34:02', '2026-01-14 17:34:02'),
(20, 'Test', 'Manager', 'test.manager@test.com', '$2b$10$cWoDXGqXTKOAv7MJ9hBvC.qu0OZYqUw8sSEauqnqDa8DuetTpPrKG', '0123456789', 'Manager pour test', 2, '2026-01-14 18:15:14', '2026-01-14 18:15:14'),
(21, 'Test', 'Admin', 'test.admin@test.com', '$2b$10$qp70vGZWyyY.3vQsVtZRRuU7DyvoqOxMEE8Bj4bIMGFzhOiy/QyNq', '0123456789', 'Admin pour test', 1, '2026-01-14 18:18:25', '2026-01-14 18:18:25'),
(22, 'Test', 'Developer', 'test.developer@test.com', '$2b$10$OtH7xfNBNKEP4.LlMiRdru0dsoTMAHcUZ7xRT3HbR7UCz0BZo/osa', '0123456789', 'Developer pour test', 3, '2026-01-14 18:39:09', '2026-01-14 18:39:09'),
(23, 'test1', 'test1', 'hatem@gmail.com', '$2b$10$JwFi6Jq4AsAapXmWxwdsguG79.U2VS6X1gf8QVM1HmwHKM9VDfdQu', '', '', 1, '2026-01-14 21:27:48', '2026-01-14 22:23:27'),
(24, 'joce', 'joce', 'joce@gmail.com', '$2b$10$elcGlDL2lTliPBtOMrMV..tB.L6L4IXDKiM0NiciTycG21Lc4Ewbi', '', '', 2, '2026-01-14 21:32:49', '2026-01-14 21:33:47');

-- --------------------------------------------------------

--
-- Structure de la table `user_skills`
--

CREATE TABLE `user_skills` (
  `skill_id` int NOT NULL,
  `user_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `user_task`
--

CREATE TABLE `user_task` (
  `task_id` int NOT NULL,
  `user_id` int NOT NULL,
  `assigned_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `comments`
--
ALTER TABLE `comments`
  ADD PRIMARY KEY (`comment_id`),
  ADD KEY `comments_note_id_FK` (`note_id`),
  ADD KEY `comments_user_id_FK` (`user_id`);

--
-- Index pour la table `documents`
--
ALTER TABLE `documents`
  ADD PRIMARY KEY (`document_id`),
  ADD KEY `documents_user_id_FK` (`user_id`);

--
-- Index pour la table `notes`
--
ALTER TABLE `notes`
  ADD PRIMARY KEY (`note_id`),
  ADD KEY `notes_user_id_FK` (`user_id`),
  ADD KEY `notes_project_id_FK` (`project_id`);

--
-- Index pour la table `note_documents`
--
ALTER TABLE `note_documents`
  ADD PRIMARY KEY (`document_id`,`note_id`),
  ADD KEY `note_documents_note_id_FK` (`note_id`);

--
-- Index pour la table `note_shares`
--
ALTER TABLE `note_shares`
  ADD PRIMARY KEY (`user_id`,`note_id`),
  ADD KEY `note_shares_note_id_FK` (`note_id`);

--
-- Index pour la table `note_tags`
--
ALTER TABLE `note_tags`
  ADD PRIMARY KEY (`tag_id`,`note_id`),
  ADD KEY `note_tags_note_id_FK` (`note_id`);

--
-- Index pour la table `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`permission_id`),
  ADD UNIQUE KEY `permission_name_UNQ` (`permission_name`);

--
-- Index pour la table `projects`
--
ALTER TABLE `projects`
  ADD PRIMARY KEY (`project_id`),
  ADD KEY `projects_user_id_FK` (`user_id`);

--
-- Index pour la table `project_members`
--
ALTER TABLE `project_members`
  ADD PRIMARY KEY (`user_id`,`project_id`),
  ADD KEY `project_members_project_id_FK` (`project_id`);

--
-- Index pour la table `project_tags`
--
ALTER TABLE `project_tags`
  ADD PRIMARY KEY (`tag_id`,`project_id`),
  ADD KEY `project_tags_project_id_FK` (`project_id`);

--
-- Index pour la table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`role_id`),
  ADD UNIQUE KEY `role_name_UNQ` (`role_name`);

--
-- Index pour la table `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD PRIMARY KEY (`permission_id`,`role_id`),
  ADD KEY `role_permissions_role_id_FK` (`role_id`);

--
-- Index pour la table `skills`
--
ALTER TABLE `skills`
  ADD PRIMARY KEY (`skill_id`),
  ADD UNIQUE KEY `skill_name_UNQ` (`skill_name`);

--
-- Index pour la table `tags`
--
ALTER TABLE `tags`
  ADD PRIMARY KEY (`tag_id`),
  ADD UNIQUE KEY `tag_name_UNQ` (`tag_name`);

--
-- Index pour la table `tasks`
--
ALTER TABLE `tasks`
  ADD PRIMARY KEY (`task_id`),
  ADD KEY `tasks_project_id_FK` (`project_id`);

--
-- Index pour la table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email_UNQ` (`email`),
  ADD KEY `users_role_id_FK` (`role_id`);

--
-- Index pour la table `user_skills`
--
ALTER TABLE `user_skills`
  ADD PRIMARY KEY (`skill_id`,`user_id`),
  ADD KEY `user_skills_user_id_FK` (`user_id`);

--
-- Index pour la table `user_task`
--
ALTER TABLE `user_task`
  ADD PRIMARY KEY (`task_id`,`user_id`),
  ADD KEY `user_task_user_id_FK` (`user_id`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `comments`
--
ALTER TABLE `comments`
  MODIFY `comment_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT pour la table `documents`
--
ALTER TABLE `documents`
  MODIFY `document_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `notes`
--
ALTER TABLE `notes`
  MODIFY `note_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT pour la table `permissions`
--
ALTER TABLE `permissions`
  MODIFY `permission_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT pour la table `projects`
--
ALTER TABLE `projects`
  MODIFY `project_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT pour la table `roles`
--
ALTER TABLE `roles`
  MODIFY `role_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT pour la table `skills`
--
ALTER TABLE `skills`
  MODIFY `skill_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT pour la table `tags`
--
ALTER TABLE `tags`
  MODIFY `tag_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT pour la table `tasks`
--
ALTER TABLE `tasks`
  MODIFY `task_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `comments`
--
ALTER TABLE `comments`
  ADD CONSTRAINT `comments_note_id_FK` FOREIGN KEY (`note_id`) REFERENCES `notes` (`note_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `comments_user_id_FK` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `documents`
--
ALTER TABLE `documents`
  ADD CONSTRAINT `documents_user_id_FK` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `notes`
--
ALTER TABLE `notes`
  ADD CONSTRAINT `notes_project_id_FK` FOREIGN KEY (`project_id`) REFERENCES `projects` (`project_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `notes_user_id_FK` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `note_documents`
--
ALTER TABLE `note_documents`
  ADD CONSTRAINT `note_documents_document_id_FK` FOREIGN KEY (`document_id`) REFERENCES `documents` (`document_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `note_documents_note_id_FK` FOREIGN KEY (`note_id`) REFERENCES `notes` (`note_id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `note_shares`
--
ALTER TABLE `note_shares`
  ADD CONSTRAINT `note_shares_note_id_FK` FOREIGN KEY (`note_id`) REFERENCES `notes` (`note_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `note_shares_user_id_FK` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `note_tags`
--
ALTER TABLE `note_tags`
  ADD CONSTRAINT `note_tags_note_id_FK` FOREIGN KEY (`note_id`) REFERENCES `notes` (`note_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `note_tags_tag_id_FK` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`tag_id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `projects`
--
ALTER TABLE `projects`
  ADD CONSTRAINT `projects_user_id_FK` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `project_members`
--
ALTER TABLE `project_members`
  ADD CONSTRAINT `project_members_project_id_FK` FOREIGN KEY (`project_id`) REFERENCES `projects` (`project_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `project_members_user_id_FK` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `project_tags`
--
ALTER TABLE `project_tags`
  ADD CONSTRAINT `project_tags_project_id_FK` FOREIGN KEY (`project_id`) REFERENCES `projects` (`project_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `project_tags_tag_id_FK` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`tag_id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD CONSTRAINT `role_permissions_permission_id_FK` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`permission_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `role_permissions_role_id_FK` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `tasks`
--
ALTER TABLE `tasks`
  ADD CONSTRAINT `tasks_project_id_FK` FOREIGN KEY (`project_id`) REFERENCES `projects` (`project_id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_role_id_FK` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`);

--
-- Contraintes pour la table `user_skills`
--
ALTER TABLE `user_skills`
  ADD CONSTRAINT `user_skills_skill_id_FK` FOREIGN KEY (`skill_id`) REFERENCES `skills` (`skill_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_skills_user_id_FK` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `user_task`
--
ALTER TABLE `user_task`
  ADD CONSTRAINT `user_task_task_id_FK` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`task_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_task_user_id_FK` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
