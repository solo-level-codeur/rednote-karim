const { createProject, getAllProjects, getProjectById, updateProject, deleteProject } = require('../models/projectModel');

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

  try {
    const projects = await getAllProjects(userId);
    res.json(projects);
  } catch (error) {
    console.error('Erreur lors de la récupération des projets :', error);
    res.status(500).json({ message: 'Erreur du serveur' });
  }
};

// Obtenir un projet spécifique
const getProjectByIdController = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const project = await getProjectById(id, userId);
    if (!project) {
      return res.status(404).json({ message: 'Projet non trouvé' });
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

  try {
    const success = await deleteProject(id, userId);
    if (!success) {
      return res.status(404).json({ message: 'Projet non trouvé' });
    }
    res.json({ message: 'Projet supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du projet :', error);
    res.status(500).json({ message: 'Erreur du serveur' });
  }
};

module.exports = { 
  createProjectController, 
  getAllProjectsController, 
  getProjectByIdController, 
  updateProjectController, 
  deleteProjectController 
};