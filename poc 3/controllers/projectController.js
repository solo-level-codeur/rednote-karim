const { createProject, getAllProjects, getProjectById, updateProject, deleteProject, addProjectMember, removeProjectMember, getProjectMembers, updateMemberRole } = require('../models/projectModel');
const { ROLES } = require('../middlewares/permissionMiddleware');

// Créer un nouveau projet
const createProjectController = async (req, res) => {
  const { name, description } = req.body;
  const userId = req.user.id;

  try {
    const projectId = await createProject(name, description, userId);
    res.status(201).json({
      id: projectId,
      name,
      description,
      userId,
      message: 'Projet créé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la création du projet :', error);
    res.status(500).json({ message: 'Erreur du serveur', error: error.message });
  }
};

// Obtenir tous les projets d'un utilisateur
const getAllProjectsController = async (req, res) => {
  const userId = req.user.id;
  const userRole = req.user.role_id;

  try {
    // DEBUG: Afficher les infos utilisateur pour diagnostic
    console.log(`DEBUG - User: ${req.user.email}, Role ID: ${userRole}, ROLES.ADMIN: ${ROLES.ADMIN}`);
    
    // Seuls les Admins peuvent voir tous les projets
    if (userRole === ROLES.ADMIN) {
      console.log('DEBUG - Admin access granted');
      const projects = await getAllProjects(userId, true); // true pour accès admin
      res.json(projects);
    } else {
      console.log('DEBUG - Non-admin access - filtered projects only');
      // Manager, Developer et Viewer voient seulement leurs projets + projets invités
      const projects = await getAllProjects(userId, false);
      res.json(projects);
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des projets :', error);
    res.status(500).json({ message: 'Erreur du serveur' });
  }
};

// Obtenir un projet spécifique
const getProjectByIdController = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role_id;

  try {
    // Seuls les Admins peuvent voir tous les projets
    const isAdminAccess = userRole === ROLES.ADMIN;
    const project = await getProjectById(id, userId, isAdminAccess);
    
    if (!project) {
      return res.status(404).json({ message: 'Projet non trouvé ou accès refusé' });
    }
    res.json(project);
  } catch (error) {
    console.error('Erreur lors de la récupération du projet :', error);
    res.status(500).json({ message: 'Erreur du serveur' });
  }
};

// Mettre à jour un projet
const updateProjectController = async (req, res) => {
  const { id } = req.params;
  const { name, description, status } = req.body;
  const userId = req.user.id;

  try {
    const success = await updateProject(id, name, description, status, userId);
    if (!success) {
      return res.status(404).json({ message: 'Projet non trouvé' });
    }
    res.json({ id, name, description, status, message: 'Projet mis à jour avec succès' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du projet :', error);
    res.status(500).json({ message: 'Erreur du serveur' });
  }
};

// Supprimer un projet
const deleteProjectController = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role_id;

  try {
    // Admin peut supprimer n'importe quel projet
    const isAdminRequest = userRole === ROLES.ADMIN;
    console.log(`🗑️ DEBUG Delete Project - ID: ${id}, User: ${req.user.email}, Role: ${userRole}, Admin: ${isAdminRequest}`);
    
    const success = await deleteProject(id, userId, isAdminRequest);
    if (!success) {
      console.log(`❌ Projet ${id} non trouvé pour suppression`);
      return res.status(404).json({ message: 'Projet non trouvé' });
    }
    console.log(`✅ Projet ${id} supprimé avec succès`);
    res.json({ message: 'Projet supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du projet :', error);
    res.status(500).json({ message: 'Erreur du serveur' });
  }
};

// Ajouter un membre à un projet
const addProjectMemberController = async (req, res) => {
  const { projectId } = req.params;
  const { userId, role } = req.body;
  const requesterId = req.user.id;

  try {
    const success = await addProjectMember(projectId, userId, role || 'Member');
    if (!success) {
      return res.status(400).json({ message: 'Impossible d\'ajouter le membre' });
    }
    res.status(201).json({ 
      message: 'Membre ajouté avec succès',
      projectId,
      userId,
      role: role || 'Member'
    });
  } catch (error) {
    console.error('Erreur lors de l\'ajout du membre :', error);
    res.status(500).json({ message: 'Erreur du serveur', error: error.message });
  }
};

// Retirer un membre d'un projet
const removeProjectMemberController = async (req, res) => {
  const { projectId, userId } = req.params;
  const requesterId = req.user.id;
  const userRole = req.user.role_id;

  try {
    // Admin peut retirer tout membre
    const isAdminRequest = userRole === ROLES.ADMIN;
    const success = await removeProjectMember(projectId, userId, requesterId, isAdminRequest);
    if (!success) {
      return res.status(404).json({ message: 'Membre non trouvé dans le projet' });
    }
    res.json({ message: 'Membre retiré avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du membre :', error);
    if (error.message === 'Seul le propriétaire peut retirer des membres') {
      res.status(403).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Erreur du serveur' });
    }
  }
};

// Obtenir tous les membres d'un projet
const getProjectMembersController = async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role_id;

  try {
    // Admin peut accéder à tous les projets
    const isAdminAccess = userRole === ROLES.ADMIN;
    const members = await getProjectMembers(projectId, userId, isAdminAccess);
    res.json({
      projectId,
      count: members.length,
      members
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des membres :', error);
    if (error.message === 'Accès refusé au projet') {
      res.status(403).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Erreur du serveur' });
    }
  }
};

// Mettre à jour le rôle d'un membre
const updateMemberRoleController = async (req, res) => {
  const { projectId, userId } = req.params;
  const { role } = req.body;
  const requesterId = req.user.id;
  const userRole = req.user.role_id;

  try {
    // Admin peut modifier tous les rôles
    const isAdminRequest = userRole === ROLES.ADMIN;
    const success = await updateMemberRole(projectId, userId, role, requesterId, isAdminRequest);
    if (!success) {
      return res.status(404).json({ message: 'Membre non trouvé dans le projet' });
    }
    res.json({ 
      message: 'Rôle mis à jour avec succès',
      projectId,
      userId,
      newRole: role
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du rôle :', error);
    if (error.message === 'Seul le propriétaire peut modifier les rôles') {
      res.status(403).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Erreur du serveur' });
    }
  }
};

module.exports = { 
  createProjectController, 
  getAllProjectsController, 
  getProjectByIdController, 
  updateProjectController, 
  deleteProjectController,
  addProjectMemberController,
  removeProjectMemberController, 
  getProjectMembersController,
  updateMemberRoleController
};