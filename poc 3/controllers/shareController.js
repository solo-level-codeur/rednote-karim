const { 
  shareNote, 
  unshareNote, 
  getSharedNotes, 
  getNoteShares, 
  canAccessNote,
  updateSharePermission,
  getAllAccessibleNotes 
} = require('../models/shareModel');

// Partager une note
const shareNoteController = async (req, res) => {
  const { noteId } = req.params;
  const { userEmail, permission = 'read' } = req.body;
  const sharedByUserId = req.user.id;

  if (!userEmail) {
    return res.status(400).json({ message: 'Email de l\'utilisateur requis' });
  }

  if (!['read', 'write'].includes(permission)) {
    return res.status(400).json({ message: 'Permission invalide. Utilisez "read" ou "write"' });
  }

  try {
    // Vérifier que l'utilisateur est propriétaire de la note
    const access = await canAccessNote(noteId, sharedByUserId);
    if (!access.isOwner) {
      return res.status(403).json({ message: 'Vous n\'êtes pas autorisé à partager cette note' });
    }

    // Trouver l'utilisateur par email
    const { findUserByEmail } = require('../models/userModel');
    const targetUser = await findUserByEmail(userEmail);
    if (!targetUser) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Vérifier qu'on ne partage pas avec soi-même
    if (targetUser.id_users === sharedByUserId) {
      return res.status(400).json({ message: 'Vous ne pouvez pas partager une note avec vous-même' });
    }

    // Partager la note
    await shareNote(noteId, targetUser.id_users, sharedByUserId, permission);

    res.status(201).json({
      message: 'Note partagée avec succès',
      sharedWith: {
        id: targetUser.id_users,
        email: targetUser.email,
        name: `${targetUser.firstname} ${targetUser.lastname}`
      },
      permission
    });
  } catch (error) {
    console.error('Erreur lors du partage :', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Note déjà partagée avec cet utilisateur' });
    }
    res.status(500).json({ message: 'Erreur du serveur' });
  }
};

// Arrêter de partager une note
const unshareNoteController = async (req, res) => {
  const { noteId, userId } = req.params;
  const ownerId = req.user.id;

  try {
    // Vérifier que l'utilisateur est propriétaire de la note
    const access = await canAccessNote(noteId, ownerId);
    if (!access.isOwner) {
      return res.status(403).json({ message: 'Vous n\'êtes pas autorisé à gérer le partage de cette note' });
    }

    const success = await unshareNote(noteId, userId, ownerId);
    if (!success) {
      return res.status(404).json({ message: 'Partage non trouvé' });
    }

    res.json({ message: 'Partage supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du partage :', error);
    res.status(500).json({ message: 'Erreur du serveur' });
  }
};

// Obtenir les notes partagées avec l'utilisateur connecté
const getSharedNotesController = async (req, res) => {
  const userId = req.user.id;

  try {
    const sharedNotes = await getSharedNotes(userId);
    res.json({
      count: sharedNotes.length,
      notes: sharedNotes
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des notes partagées :', error);
    res.status(500).json({ message: 'Erreur du serveur' });
  }
};

// Obtenir la liste des utilisateurs avec qui une note est partagée
const getNoteSharesController = async (req, res) => {
  const { noteId } = req.params;
  const ownerId = req.user.id;

  try {
    // Vérifier que l'utilisateur est propriétaire de la note
    const access = await canAccessNote(noteId, ownerId);
    if (!access.isOwner) {
      return res.status(403).json({ message: 'Vous n\'êtes pas autorisé à voir les partages de cette note' });
    }

    const shares = await getNoteShares(noteId, ownerId);
    res.json({
      noteId,
      count: shares.length,
      shares
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des partages :', error);
    res.status(500).json({ message: 'Erreur du serveur' });
  }
};

// Mettre à jour les permissions de partage
const updateSharePermissionController = async (req, res) => {
  const { noteId, userId } = req.params;
  const { permission } = req.body;
  const ownerId = req.user.id;

  if (!['read', 'write'].includes(permission)) {
    return res.status(400).json({ message: 'Permission invalide. Utilisez "read" ou "write"' });
  }

  try {
    // Vérifier que l'utilisateur est propriétaire de la note
    const access = await canAccessNote(noteId, ownerId);
    if (!access.isOwner) {
      return res.status(403).json({ message: 'Vous n\'êtes pas autorisé à modifier les permissions de cette note' });
    }

    const success = await updateSharePermission(noteId, userId, permission, ownerId);
    if (!success) {
      return res.status(404).json({ message: 'Partage non trouvé' });
    }

    res.json({ 
      message: 'Permissions mises à jour avec succès',
      noteId,
      userId,
      permission
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour des permissions :', error);
    res.status(500).json({ message: 'Erreur du serveur' });
  }
};

// Obtenir toutes les notes accessibles (propres + partagées)
const getAllAccessibleNotesController = async (req, res) => {
  const userId = req.user.id;

  try {
    const notes = await getAllAccessibleNotes(userId);
    res.json({
      count: notes.length,
      notes
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des notes accessibles :', error);
    res.status(500).json({ message: 'Erreur du serveur' });
  }
};

module.exports = {
  shareNoteController,
  unshareNoteController,
  getSharedNotesController,
  getNoteSharesController,
  updateSharePermissionController,
  getAllAccessibleNotesController
};