const { createNote, getAllNotes, getAllNotesFromProject, getNoteById, updateNote, deleteNote, getNoteAuthor } = require('../models/noteModel');
const { hasPermission } = require('../models/rbac');

// Créer une nouvelle note
const createNoteController = async (req, res) => {
  const { title, content, projectId } = req.body;
  const userId = req.user.id; // ID de l'utilisateur authentifié

  try {
    const noteId = await createNote(title, content, userId, projectId);
    
    res.status(201).json({ 
      id: noteId, 
      title, 
      content, 
      userId, 
      projectId
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
    // Admin peut voir toutes les notes
    const isAdminAccess = await hasPermission(userId, 'manage_users');
    const note = await getNoteById(id, userId, isAdminAccess);
    if (!note) {
      return res.status(404).json({ message: 'Note non trouvée' });
    }
    
    // Ajouter les permissions calculées côté serveur
    const isOwner = note.user_id === userId;
    const isAdmin = await hasPermission(userId, 'manage_users');
    
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


  try {
    // Admin peut modifier toutes les notes
    const isAdminAccess = await hasPermission(userId, 'manage_users');
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


// Obtenir toutes les notes d'un projet spécifique
const getAllNotesFromProjectController = async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user.id;
  try {
    // Admin peut accéder à tous les projets
    const isAdminAccess = await hasPermission(userId, 'manage_users');
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

// Obtenir l'auteur d'une note
const getNoteAuthorController = async (req, res) => {
  const { id } = req.params;
  
  try {
    const author = await getNoteAuthor(id);
    if (!author) {
      return res.status(404).json({ message: 'Note non trouvée' });
    }
    
    res.json({
      firstname: author.firstname,
      lastname: author.lastname
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'auteur :', error);
    res.status(500).json({ message: 'Erreur du serveur' });
  }
};

module.exports = { 
  createNoteController, 
  getAllNotesController, 
  getAllNotesFromProjectController,
  getNoteByIdController, 
  updateNoteController, 
  deleteNoteController,
  getNoteAuthorController
};
