const { createNote, getAllNotes, getAllNotesFromProject, getNoteById, updateNote, deleteNote, searchNotes, getNotesWithFilters } = require('../models/noteModel');

// Créer une nouvelle note
const createNoteController = async (req, res) => {
  const { title, content, projectId } = req.body;
  const userId = req.user.id; // ID de l'utilisateur authentifié

  try {
    const noteId = await createNote(title, content, userId, projectId);
    
    let message = 'Note créée avec succès';
    let noteType = 'Note de projet';
    
    if (!projectId) {
      message = 'Note créée avec succès dans votre projet par défaut';
      noteType = 'Note personnelle';
    }
    
    res.status(201).json({ 
      id: noteId, 
      title, 
      content, 
      userId, 
      projectId: projectId || 'auto-créé',
      type: noteType,
      message: message
    });
  } catch (error) {
    console.error('Erreur lors de la création de la note :', error);
    res.status(500).json({ message: 'Erreur du serveur', error: error.message });
  }
};

// Obtenir toutes les notes d'un utilisateur
const getAllNotesController = async (req, res) => {
  const userId = req.user.id; // ID de l'utilisateur authentifié

  try {
    const notes = await getAllNotes(userId);
    res.json(notes);
  } catch (error) {
    console.error('Erreur lors de la récupération des notes :', error);
    res.status(500).json({ message: 'Erreur du serveur' });
  }
};

// Obtenir une note spécifique
const getNoteByIdController = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id; // ID de l'utilisateur authentifié
  const userRole = req.user.role_id;
  const { ROLES } = require('../middlewares/permissionMiddleware');

  try {
    // Admin peut voir toutes les notes
    const isAdminAccess = userRole === ROLES.ADMIN;
    const note = await getNoteById(id, userId, isAdminAccess);
    if (!note) {
      return res.status(404).json({ message: 'Note non trouvée' });
    }
    
    // Ajouter les permissions calculées côté serveur
    const isOwner = note.user_id === userId;
    const isAdmin = userRole === ROLES.ADMIN;
    
    const responseNote = {
      ...note,
      canEdit: isOwner || isAdmin,
      canDelete: isOwner || isAdmin,
      isOwner: isOwner
    };
    
    res.json(responseNote);
  } catch (error) {
    console.error('Erreur lors de la récupération de la note :', error);
    res.status(500).json({ message: 'Erreur du serveur' });
  }
};

// Mettre à jour une note
const updateNoteController = async (req, res) => {
  const { id } = req.params;
  const { title, content, projectId } = req.body;
  const userId = req.user.id; // ID de l'utilisateur authentifié
  const userRole = req.user.role_id;
  const { ROLES } = require('../middlewares/permissionMiddleware');

  console.log('🔧 DEBUG Update note:', { id, title, content, projectId, userId });

  try {
    // Admin peut modifier toutes les notes
    const isAdminAccess = userRole === ROLES.ADMIN;
    const success = await updateNote(id, title, content, userId, projectId, isAdminAccess);
    if (!success) {
      return res.status(404).json({ message: 'Note non trouvée' });
    }
    res.json({ id, title, content, projectId, userId });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la note :', error);
    res.status(500).json({ message: 'Erreur du serveur' });
  }
};

// Supprimer une note
const deleteNoteController = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id; // ID de l'utilisateur authentifié

  console.log('🗑️ DEBUG Delete - Note ID:', id, 'User ID:', userId);

  try {
    const success = await deleteNote(id, userId);
    if (!success) {
      return res.status(404).json({ message: 'Note non trouvée' });
    }
    res.json({ message: 'Note supprimée avec succès' });
  } catch (error) {
    console.error('❌ ERROR Delete note:', error);
    res.status(500).json({ message: 'Erreur du serveur', error: error.message });
  }
};

// Rechercher des notes
const searchNotesController = async (req, res) => {
  const userId = req.user.id;
  const { q: searchTerm, projectId } = req.query;

  if (!searchTerm || searchTerm.trim().length < 2) {
    return res.status(400).json({ message: 'Le terme de recherche doit contenir au moins 2 caractères' });
  }

  try {
    const notes = await searchNotes(userId, searchTerm.trim(), projectId);
    res.json({
      searchTerm,
      projectId: projectId || null,
      count: notes.length,
      results: notes
    });
  } catch (error) {
    console.error('Erreur lors de la recherche :', error);
    res.status(500).json({ message: 'Erreur du serveur' });
  }
};

// Obtenir des notes avec filtres
const getFilteredNotesController = async (req, res) => {
  const userId = req.user.id;
  const filters = {
    projectId: req.query.projectId,
    dateFrom: req.query.dateFrom,
    dateTo: req.query.dateTo,
    sortBy: req.query.sortBy,
    sortOrder: req.query.sortOrder,
    limit: req.query.limit
  };

  // Nettoyer les filtres vides
  Object.keys(filters).forEach(key => {
    if (!filters[key]) delete filters[key];
  });

  try {
    const notes = await getNotesWithFilters(userId, filters);
    res.json({
      filters: filters,
      count: notes.length,
      results: notes
    });
  } catch (error) {
    console.error('Erreur lors de la récupération filtrée :', error);
    res.status(500).json({ message: 'Erreur du serveur' });
  }
};

// Obtenir toutes les notes d'un projet spécifique
const getAllNotesFromProjectController = async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role_id;
  const { ROLES } = require('../middlewares/permissionMiddleware');

  try {
    // Admin peut accéder à tous les projets
    const isAdminAccess = userRole === ROLES.ADMIN;
    const notes = await getAllNotesFromProject(projectId, userId, isAdminAccess);
    res.json({
      projectId: projectId,
      count: notes.length,
      notes: notes
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des notes du projet :', error);
    if (error.message === 'Accès refusé au projet') {
      res.status(403).json({ message: 'Vous n\'avez pas accès à ce projet' });
    } else {
      res.status(500).json({ message: 'Erreur du serveur' });
    }
  }
};

module.exports = { 
  createNoteController, 
  getAllNotesController, 
  getAllNotesFromProjectController,
  getNoteByIdController, 
  updateNoteController, 
  deleteNoteController,
  searchNotesController,
  getFilteredNotesController
};
