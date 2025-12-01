const { createNote, getAllNotes, getNoteById, updateNote, deleteNote, searchNotes, getNotesWithFilters } = require('../models/noteModel');

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

  try {
    const note = await getNoteById(id, userId);
    if (!note) {
      return res.status(404).json({ message: 'Note non trouvée' });
    }
    res.json(note);
  } catch (error) {
    console.error('Erreur lors de la récupération de la note :', error);
    res.status(500).json({ message: 'Erreur du serveur' });
  }
};

// Mettre à jour une note
const updateNoteController = async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;
  const userId = req.user.id; // ID de l'utilisateur authentifié

  try {
    const success = await updateNote(id, title, content, userId);
    if (!success) {
      return res.status(404).json({ message: 'Note non trouvée' });
    }
    res.json({ id, title, content, userId });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la note :', error);
    res.status(500).json({ message: 'Erreur du serveur' });
  }
};

// Supprimer une note
const deleteNoteController = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id; // ID de l'utilisateur authentifié

  try {
    const success = await deleteNote(id, userId);
    if (!success) {
      return res.status(404).json({ message: 'Note non trouvée' });
    }
    res.json({ message: 'Note supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la note :', error);
    res.status(500).json({ message: 'Erreur du serveur' });
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

module.exports = { 
  createNoteController, 
  getAllNotesController, 
  getNoteByIdController, 
  updateNoteController, 
  deleteNoteController,
  searchNotesController,
  getFilteredNotesController
};
