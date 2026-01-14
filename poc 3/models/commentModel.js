const db = require('../config/db');
const { ROLES } = require('../middlewares/permissionMiddleware');

// Créer un commentaire sur une note
const createComment = async (noteId, userId, content) => {
  const [result] = await db.query(
    'INSERT INTO comments (comment_text, created_at, note_id, user_id) VALUES (?, NOW(), ?, ?)',
    [content, noteId, userId]
  );
  return result.insertId;
};

// Obtenir tous les commentaires d'une note
const getCommentsByNote = async (noteId) => {
  const [rows] = await db.query(`
    SELECT 
      c.*,
      u.firstname,
      u.lastname,
      u.email
    FROM comments c
    INNER JOIN users u ON c.user_id = u.user_id
    WHERE c.note_id = ?
    ORDER BY c.created_at ASC
  `, [noteId]);
  return rows;
};

// Obtenir un commentaire par ID
const getCommentById = async (commentId) => {
  const [rows] = await db.query(`
    SELECT 
      c.*,
      u.firstname,
      u.lastname,
      u.email,
      n.title as note_title
    FROM comments c
    INNER JOIN users u ON c.user_id = u.user_id
    INNER JOIN notes n ON c.note_id = n.note_id
    WHERE c.comment_id = ?
  `, [commentId]);
  return rows[0];
};

// Mettre à jour un commentaire
const updateComment = async (commentId, content, userId) => {
  const [result] = await db.query(
    'UPDATE comments SET comment_text = ?, created_at = NOW() WHERE comment_id = ? AND user_id = ?',
    [content, commentId, userId]
  );
  return result.affectedRows;
};

// Supprimer un commentaire
const deleteComment = async (commentId, userId) => {
  const [result] = await db.query(
    'DELETE FROM comments WHERE comment_id = ? AND user_id = ?',
    [commentId, userId]
  );
  return result.affectedRows;
};

// Vérifier si un utilisateur peut commenter une note
const canCommentNote = async (noteId, userId, userRole = null) => {
  // Admin peut toujours commenter
  if (userRole === ROLES.ADMIN) {
    return { canComment: true, isOwner: false, isAdmin: true };
  }

  // Vérifier si c'est le propriétaire de la note
  const [ownerCheck] = await db.query(
    'SELECT note_id FROM notes WHERE note_id = ? AND user_id = ?',
    [noteId, userId]
  );
  
  if (ownerCheck.length > 0) {
    return { canComment: true, isOwner: true };
  }

  // Vérifier si la note est partagée avec l'utilisateur
  const [shareCheck] = await db.query(
    'SELECT permission FROM note_shares WHERE note_id = ? AND user_id = ?',
    [noteId, userId]
  );

  if (shareCheck.length > 0) {
    return { 
      canComment: true, 
      isOwner: false,
      permission: shareCheck[0].permission 
    };
  }

  // Vérifier si l'utilisateur est membre du projet de cette note
  const [projectCheck] = await db.query(`
    SELECT pm.user_id, p.project_id as project_id
    FROM notes n
    INNER JOIN project_members pm ON n.project_id = pm.project_id
    INNER JOIN projects p ON n.project_id = p.project_id
    WHERE n.note_id = ? AND pm.user_id = ?
  `, [noteId, userId]);

  if (projectCheck.length > 0) {
    return { 
      canComment: true, 
      isOwner: false,
      projectMember: true
    };
  }

  return { canComment: false, isOwner: false };
};

// Obtenir les commentaires récents d'un utilisateur
const getRecentComments = async (userId, limit = 10) => {
  const [rows] = await db.query(`
    SELECT 
      c.*,
      n.title as note_title,
      n.note_id as note_id,
      n.user_id as note_owner_id
    FROM comments c
    INNER JOIN notes n ON c.note_id = n.note_id
    WHERE c.user_id = ?
    ORDER BY c.created_at DESC
    LIMIT ?
  `, [userId, limit]);
  return rows;
};

// Compter les commentaires d'une note
const getCommentCount = async (noteId) => {
  const [rows] = await db.query(
    'SELECT COUNT(*) as count FROM comments WHERE note_id = ?',
    [noteId]
  );
  return rows[0].count;
};

module.exports = {
  createComment,
  getCommentsByNote,
  getCommentById,
  updateComment,
  deleteComment,
  canCommentNote,
  getRecentComments,
  getCommentCount
};