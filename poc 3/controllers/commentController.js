const { 
  createComment,
  getCommentsByNote,
  getCommentById,
  updateComment,
  deleteComment,
  canCommentNote,
  getRecentComments,
  getCommentCount
} = require('../models/commentModel');

// Créer un commentaire
const createCommentController = async (req, res) => {
  const { noteId } = req.params;
  const { content } = req.body;
  const userId = req.user.id;

  if (!content || content.trim().length === 0) {
    return res.status(400).json({ message: 'Le contenu du commentaire est requis' });
  }

  try {
    // Vérifier si l'utilisateur peut commenter cette note
    const access = await canCommentNote(noteId, userId);
    if (!access.canComment) {
      return res.status(403).json({ message: 'Vous n\'êtes pas autorisé à commenter cette note' });
    }

    const commentId = await createComment(noteId, userId, content.trim());
    
    // Récupérer le commentaire créé avec les infos utilisateur
    const newComment = await getCommentById(commentId);

    res.status(201).json({
      message: 'Commentaire créé avec succès',
      comment: newComment
    });
  } catch (error) {
    console.error('Erreur lors de la création du commentaire :', error);
    res.status(500).json({ message: 'Erreur du serveur' });
  }
};

// Obtenir tous les commentaires d'une note
const getCommentsController = async (req, res) => {
  const { noteId } = req.params;
  const userId = req.user.id;

  try {
    // Vérifier si l'utilisateur peut voir cette note (et donc ses commentaires)
    const access = await canCommentNote(noteId, userId);
    if (!access.canComment) {
      return res.status(403).json({ message: 'Vous n\'êtes pas autorisé à voir les commentaires de cette note' });
    }

    const comments = await getCommentsByNote(noteId);
    const count = await getCommentCount(noteId);

    res.json({
      noteId,
      count,
      comments
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des commentaires :', error);
    res.status(500).json({ message: 'Erreur du serveur' });
  }
};

// Obtenir un commentaire spécifique
const getCommentController = async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user.id;

  try {
    const comment = await getCommentById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Commentaire non trouvé' });
    }

    // Vérifier si l'utilisateur peut voir cette note
    const access = await canCommentNote(comment.id_notes, userId);
    if (!access.canComment) {
      return res.status(403).json({ message: 'Vous n\'êtes pas autorisé à voir ce commentaire' });
    }

    res.json(comment);
  } catch (error) {
    console.error('Erreur lors de la récupération du commentaire :', error);
    res.status(500).json({ message: 'Erreur du serveur' });
  }
};

// Mettre à jour un commentaire
const updateCommentController = async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;
  const userId = req.user.id;

  if (!content || content.trim().length === 0) {
    return res.status(400).json({ message: 'Le contenu du commentaire est requis' });
  }

  try {
    const success = await updateComment(commentId, content.trim(), userId);
    if (!success) {
      return res.status(404).json({ message: 'Commentaire non trouvé ou vous n\'êtes pas autorisé à le modifier' });
    }

    // Récupérer le commentaire mis à jour
    const updatedComment = await getCommentById(commentId);

    res.json({
      message: 'Commentaire mis à jour avec succès',
      comment: updatedComment
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du commentaire :', error);
    res.status(500).json({ message: 'Erreur du serveur' });
  }
};

// Supprimer un commentaire
const deleteCommentController = async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user.id;

  try {
    const success = await deleteComment(commentId, userId);
    if (!success) {
      return res.status(404).json({ message: 'Commentaire non trouvé ou vous n\'êtes pas autorisé à le supprimer' });
    }

    res.json({ message: 'Commentaire supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du commentaire :', error);
    res.status(500).json({ message: 'Erreur du serveur' });
  }
};

// Obtenir les commentaires récents de l'utilisateur
const getRecentCommentsController = async (req, res) => {
  const userId = req.user.id;
  const limit = parseInt(req.query.limit) || 10;

  try {
    const comments = await getRecentComments(userId, limit);
    res.json({
      count: comments.length,
      comments
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des commentaires récents :', error);
    res.status(500).json({ message: 'Erreur du serveur' });
  }
};

module.exports = {
  createCommentController,
  getCommentsController,
  getCommentController,
  updateCommentController,
  deleteCommentController,
  getRecentCommentsController
};