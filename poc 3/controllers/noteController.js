const { createNote, getAllNotes, getNoteById, updateNote, deleteNote } = require('../models/noteModel');

// Créer une nouvelle note
const createNoteController = async (req, res) => {
  const { title, content } = req.body;
  const userId = req.user.id; // ID de l'utilisateur authentifié

  try {
    const noteId = await createNote(title, content, userId);
    res.status(201).json({ id: noteId, title, content, userId });
  } catch (error) {
    console.error('Erreur lors de la création de la note :', error);
    res.status(500).json({ message: 'Erreur du serveur' });
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

module.exports = { createNoteController, getAllNotesController, getNoteByIdController, updateNoteController, deleteNoteController };
