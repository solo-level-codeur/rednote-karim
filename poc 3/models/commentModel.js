const db = require('../config/db');

// Créer un commentaire sur une note
const createComment = async (noteId, userId, content) => {
  const [result] = await db.query(
    'INSERT INTO comments (content, comment_date, id_notes, id_users) VALUES (?, NOW(), ?, ?)',
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
    INNER JOIN users u ON c.id_users = u.id_users
    WHERE c.id_notes = ?
    ORDER BY c.comment_date ASC
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
    INNER JOIN users u ON c.id_users = u.id_users
    INNER JOIN notes n ON c.id_notes = n.id
    WHERE c.id = ?
  `, [commentId]);
  return rows[0];
};

// Mettre à jour un commentaire
const updateComment = async (commentId, content, userId) => {
  const [result] = await db.query(
    'UPDATE comments SET content = ?, comment_date = NOW() WHERE id = ? AND id_users = ?',
    [content, commentId, userId]
  );
  return result.affectedRows;
};

// Supprimer un commentaire
const deleteComment = async (commentId, userId) => {
  const [result] = await db.query(
    'DELETE FROM comments WHERE id = ? AND id_users = ?',
    [commentId, userId]
  );
  return result.affectedRows;
};

// Vérifier si un utilisateur peut commenter une note
const canCommentNote = async (noteId, userId) => {
  // Vérifier si c'est le propriétaire de la note
  const [ownerCheck] = await db.query(
    'SELECT id FROM notes WHERE id = ? AND id_users = ?',
    [noteId, userId]
  );
  
  if (ownerCheck.length > 0) {
    return { canComment: true, isOwner: true };
  }

  // Vérifier si la note est partagée avec l'utilisateur
  const [shareCheck] = await db.query(
    'SELECT permission FROM note_shares WHERE id_notes = ? AND id_users = ?',
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
    SELECT pm.role, p.id as project_id
    FROM notes n
    INNER JOIN project_members pm ON n.id_projects = pm.id_projects
    INNER JOIN projects p ON n.id_projects = p.id
    WHERE n.id = ? AND pm.id_users = ?
  `, [noteId, userId]);

  if (projectCheck.length > 0) {
    return { 
      canComment: true, 
      isOwner: false,
      projectMember: true,
      projectRole: projectCheck[0].role 
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
      n.id as note_id,
      n.id_users as note_owner_id
    FROM comments c
    INNER JOIN notes n ON c.id_notes = n.id
    WHERE c.id_users = ?
    ORDER BY c.comment_date DESC
    LIMIT ?
  `, [userId, limit]);
  return rows;
};

// Compter les commentaires d'une note
const getCommentCount = async (noteId) => {
  const [rows] = await db.query(
    'SELECT COUNT(*) as count FROM comments WHERE id_notes = ?',
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