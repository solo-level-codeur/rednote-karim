const { createProject, getAllProject, getProjectById, updateProject, deleteProject } = require('../models/noteModel');


const getAllProjectController = async (req, res) => {
  //const userId = req.user.id; // ID de l'utilisateur authentifié
  try {
    const projets = await getAllProject();
    res.json(projets);
  } catch (error) {
    console.error('Erreur lors de la récupération des projets :', error);
    res.status(500).json({ message: 'Erreur du serveur' });
  }
};