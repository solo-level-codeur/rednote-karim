const db = require('../config/db');

// Partager une note avec un utilisateur
const shareNote = async (noteId, sharedWithUserId, sharedByUserId, permission = 'read') => {
  const [result] = await db.query(
    'INSERT INTO note_shares (note_id, user_id, shared_by, permission, shared_at) VALUES (?, ?, ?, ?, NOW())',
    [noteId, sharedWithUserId, sharedByUserId, permission]
  );
  return result.insertId;
};

// Supprimer un partage
const unshareNote = async (noteId, userId, ownerId) => {
  const [result] = await db.query(
    'DELETE FROM note_shares WHERE note_id = ? AND user_id = ? AND shared_by = ?',
    [noteId, userId, ownerId]
  );
  return result.affectedRows;
};

// Obtenir toutes les notes partagées avec un utilisateur
const getSharedNotes = async (userId) => {
  const [rows] = await db.query(`
    SELECT 
      n.*,
      ns.permission,
      ns.shared_at,
      u.firstname as shared_by_firstname,
      u.lastname as shared_by_lastname,
      p.project_name as project_name
    FROM notes n
    INNER JOIN note_shares ns ON n.note_id = ns.note_id
    INNER JOIN users u ON ns.shared_by = u.user_id
    LEFT JOIN projects p ON n.project_id = p.project_id
    WHERE ns.user_id = ?
    ORDER BY ns.shared_at DESC
  `, [userId]);
  return rows;
};

// Obtenir les utilisateurs avec qui une note est partagée
const getNoteShares = async (noteId, ownerId) => {
  const [rows] = await db.query(`
    SELECT 
      u.user_id,
      u.firstname,
      u.lastname,
      u.email,
      ns.permission,
      ns.shared_at
    FROM note_shares ns
    INNER JOIN users u ON ns.user_id = u.user_id
    WHERE ns.note_id = ? AND ns.shared_by = ?
  `, [noteId, ownerId]);
  return rows;
};

// Vérifier si un utilisateur peut accéder à une note
const canAccessNote = async (noteId, userId) => {
  // Vérifier si c'est le propriétaire
  const [ownerCheck] = await db.query(
    'SELECT note_id FROM notes WHERE note_id = ? AND user_id = ?',
    [noteId, userId]
  );
  
  if (ownerCheck.length > 0) {
    return { canAccess: true, isOwner: true, permission: 'write' };
  }

  // Vérifier si la note est partagée avec l'utilisateur
  const [shareCheck] = await db.query(
    'SELECT permission FROM note_shares WHERE note_id = ? AND user_id = ?',
    [noteId, userId]
  );

  if (shareCheck.length > 0) {
    return { 
      canAccess: true, 
      isOwner: false, 
      permission: shareCheck[0].permission 
    };
  }

  return { canAccess: false, isOwner: false, permission: null };
};

// Mettre à jour les permissions de partage
const updateSharePermission = async (noteId, userId, newPermission, ownerId) => {
  const [result] = await db.query(
    'UPDATE note_shares SET permission = ? WHERE note_id = ? AND user_id = ? AND shared_by = ?',
    [newPermission, noteId, userId, ownerId]
  );
  return result.affectedRows;
};

// Obtenir toutes les notes accessibles par un utilisateur (propres + partagées)
const getAllAccessibleNotes = async (userId, projectId = null) => {
  let query = `
    SELECT 
      n.*,
      p.project_name as project_name,
      'owner' as access_type,
      'write' as permission
    FROM notes n
    LEFT JOIN projects p ON n.project_id = p.project_id
    WHERE n.user_id = ?`;
  
  let params = [userId];
  
  if (projectId) {
    query += ` AND n.project_id = ?`;
    params.push(parseInt(projectId, 10));
  }

  query += `
    UNION

    SELECT 
      n.*,
      p.project_name as project_name,
      'shared' as access_type,
      ns.permission
    FROM notes n
    INNER JOIN note_shares ns ON n.note_id = ns.note_id
    LEFT JOIN projects p ON n.project_id = p.project_id
    WHERE ns.user_id = ?`;
    
  params.push(userId);
  
  if (projectId) {
    query += ` AND n.project_id = ?`;
    params.push(parseInt(projectId, 10));
  }

  query += ` ORDER BY updated_at DESC`;
  
  console.log('SQL Query:', query);
  console.log('Params:', params);
  
  const [rows] = await db.query(query, params);
  console.log('Results:', rows.length, 'rows');
  return rows;
};

module.exports = {
  shareNote,
  unshareNote,
  getSharedNotes,
  getNoteShares,
  canAccessNote,
  updateSharePermission,
  getAllAccessibleNotes
};