const db = require('../config/db');

// Créer un commentaire sur une note
const createComment = async (noteId, userId, content) => {
  const [result] = await db.query(`
    INSERT INTO comments (
      comment_text, 
      created_at, 
      note_id, 
      user_id
    ) VALUES (?, NOW(), ?, ?)
  `, [content, noteId, userId]);
  return result.insertId;
};

// Obtenir tous les commentaires d'une note
const getCommentsByNote = async (noteId) => {
  const [rows] = await db.query(`
    SELECT 
      comments.comment_id,
      comments.comment_text,
      comments.created_at,
      comments.note_id,
      comments.user_id,
      users.firstname,
      users.lastname,
      users.email
    FROM comments 
    INNER JOIN users ON comments.user_id = users.user_id
    WHERE comments.note_id = ?
    ORDER BY comments.created_at ASC
  `, [noteId]);
  return rows;
};

// Obtenir un commentaire par ID
const getCommentById = async (commentId) => {
  const [rows] = await db.query(`
    SELECT 
      comments.comment_id,
      comments.comment_text,
      comments.created_at,
      comments.note_id,
      comments.user_id,
      users.firstname,
      users.lastname,
      users.email,
      notes.title as note_title
    FROM comments 
    INNER JOIN users ON comments.user_id = users.user_id
    INNER JOIN notes ON comments.note_id = notes.note_id
    WHERE comments.comment_id = ?
  `, [commentId]);
  return rows[0];
};

// Mettre à jour un commentaire
const updateComment = async (commentId, content, userId) => {
  const [result] = await db.query(`
    UPDATE comments 
    SET 
      comment_text = ?, 
      created_at = NOW() 
    WHERE comment_id = ? AND user_id = ?
  `, [content, commentId, userId]);
  return result.affectedRows;
};

// Supprimer un commentaire
const deleteComment = async (commentId, userId) => {
  const [result] = await db.query(`
    DELETE FROM comments 
    WHERE comment_id = ? AND user_id = ?
  `, [commentId, userId]);
  return result.affectedRows;
};

// Vérifier si un utilisateur peut commenter une note
const canCommentNote = async (noteId, userId, userRole = null) => {
  const { hasPermission } = require('./rbac');
  
  // Admin peut toujours commenter
  if (await hasPermission(userId, 'manage_users')) {
    return { canComment: true, isOwner: false, isAdmin: true };
  }

  // Vérifier si c'est le propriétaire de la note
  const [ownerCheck] = await db.query(`
    SELECT note_id 
    FROM notes 
    WHERE note_id = ? AND user_id = ?
  `, [noteId, userId]);
  
  if (ownerCheck.length > 0) {
    return { canComment: true, isOwner: true };
  }

  // Vérifier si la note est partagée avec l'utilisateur
  const [shareCheck] = await db.query(`
    SELECT permission 
    FROM note_shares 
    WHERE note_id = ? AND user_id = ?
  `, [noteId, userId]);

  if (shareCheck.length > 0) {
    return { 
      canComment: true, 
      isOwner: false,
      permission: shareCheck[0].permission 
    };
  }

  // Vérifier si l'utilisateur est membre du projet de cette note
  const [projectCheck] = await db.query(`
    SELECT 
      project_members.user_id, 
      projects.project_id
    FROM notes 
    INNER JOIN project_members ON notes.project_id = project_members.project_id
    INNER JOIN projects ON notes.project_id = projects.project_id
    WHERE notes.note_id = ? AND project_members.user_id = ?
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
      comments.comment_id,
      comments.comment_text,
      comments.created_at,
      comments.note_id,
      comments.user_id,
      notes.title as note_title,
      notes.user_id as note_owner_id
    FROM comments 
    INNER JOIN notes ON comments.note_id = notes.note_id
    WHERE comments.user_id = ?
    ORDER BY comments.created_at DESC
    LIMIT ?
  `, [userId, limit]);
  return rows;
};

// Compter les commentaires d'une note
const getCommentCount = async (noteId) => {
  const [rows] = await db.query(`
    SELECT COUNT(*) as count 
    FROM comments 
    WHERE note_id = ?
  `, [noteId]);
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