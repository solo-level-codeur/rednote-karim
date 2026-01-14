const db = require('../config/db');

// Partager une note avec un utilisateur
const shareNote = async (noteId, sharedWithUserId, permission = 'Read') => {
  const [result] = await db.query(
    'INSERT INTO note_shares (note_id, user_id, permission, shared_at) VALUES (?, ?, ?, NOW())',
    [noteId, sharedWithUserId, permission]
  );
  return result.insertId;
};

// Supprimer un partage
const unshareNote = async (noteId, userId) => {
  const [result] = await db.query(
    'DELETE FROM note_shares WHERE note_id = ? AND user_id = ?',
    [noteId, userId]
  );
  return result.affectedRows;
};

// Obtenir toutes les notes partagées avec un utilisateur
const getSharedNotes = async (userId) => {
  const [rows] = await db.query(`
    SELECT 
      notes.*,
      note_shares.permission,
      note_shares.shared_at,
      users.firstname as shared_by_firstname,
      users.lastname as shared_by_lastname,
      projects.project_name as project_name
    FROM notes 
    INNER JOIN note_shares ON notes.note_id = note_shares.note_id
    INNER JOIN users ON notes.user_id = users.user_id
    LEFT JOIN projects ON notes.project_id = projects.project_id
    WHERE note_shares.user_id = ?
    ORDER BY note_shares.shared_at DESC
  `, [userId]);
  return rows;
};

// Obtenir les utilisateurs avec qui une note est partagée
const getNoteShares = async (noteId) => {
  const [rows] = await db.query(`
    SELECT 
      users.user_id,
      users.firstname,
      users.lastname,
      users.email,
      note_shares.permission,
      note_shares.shared_at
    FROM note_shares 
    INNER JOIN users ON note_shares.user_id = users.user_id
    WHERE note_shares.note_id = ?
  `, [noteId]);
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
const updateSharePermission = async (noteId, userId, newPermission) => {
  const [result] = await db.query(
    'UPDATE note_shares SET permission = ? WHERE note_id = ? AND user_id = ?',
    [newPermission, noteId, userId]
  );
  return result.affectedRows;
};

// Obtenir toutes les notes accessibles par un utilisateur (propres + partagées)
const getAllAccessibleNotes = async (userId, projectId = null) => {
  let query = `
    SELECT 
      notes.*,
      projects.project_name as project_name,
      'owner' as access_type,
      'write' as permission
    FROM notes 
    LEFT JOIN projects ON notes.project_id = projects.project_id
    WHERE notes.user_id = ?`;
  
  let params = [userId];
  
  if (projectId) {
    query += ` AND notes.project_id = ?`;
    params.push(parseInt(projectId, 10));
  }

  query += `
    UNION

    SELECT 
      notes.*,
      projects.project_name as project_name,
      'shared' as access_type,
      note_shares.permission
    FROM notes 
    INNER JOIN note_shares ON notes.note_id = note_shares.note_id
    LEFT JOIN projects ON notes.project_id = projects.project_id
    WHERE note_shares.user_id = ?`;
    
  params.push(userId);
  
  if (projectId) {
    query += ` AND notes.project_id = ?`;
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