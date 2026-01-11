const db = require('../config/db');

// Partager une note avec un utilisateur
const shareNote = async (noteId, sharedWithUserId, sharedByUserId, permission = 'read') => {
  const [result] = await db.query(
    'INSERT INTO note_shares (id_notes, id_users, shared_by, permission, shared_date) VALUES (?, ?, ?, ?, NOW())',
    [noteId, sharedWithUserId, sharedByUserId, permission]
  );
  return result.insertId;
};

// Supprimer un partage
const unshareNote = async (noteId, userId, ownerId) => {
  const [result] = await db.query(
    'DELETE FROM note_shares WHERE id_notes = ? AND id_users = ? AND shared_by = ?',
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
      ns.shared_date,
      u.firstname as shared_by_firstname,
      u.lastname as shared_by_lastname,
      p.name as project_name
    FROM notes n
    INNER JOIN note_shares ns ON n.id = ns.id_notes
    INNER JOIN users u ON ns.shared_by = u.id_users
    LEFT JOIN projects p ON n.id_projects = p.id
    WHERE ns.id_users = ?
    ORDER BY ns.shared_date DESC
  `, [userId]);
  return rows;
};

// Obtenir les utilisateurs avec qui une note est partagée
const getNoteShares = async (noteId, ownerId) => {
  const [rows] = await db.query(`
    SELECT 
      u.id_users,
      u.firstname,
      u.lastname,
      u.email,
      ns.permission,
      ns.shared_date
    FROM note_shares ns
    INNER JOIN users u ON ns.id_users = u.id_users
    WHERE ns.id_notes = ? AND ns.shared_by = ?
  `, [noteId, ownerId]);
  return rows;
};

// Vérifier si un utilisateur peut accéder à une note
const canAccessNote = async (noteId, userId) => {
  // Vérifier si c'est le propriétaire
  const [ownerCheck] = await db.query(
    'SELECT id FROM notes WHERE id = ? AND id_users = ?',
    [noteId, userId]
  );
  
  if (ownerCheck.length > 0) {
    return { canAccess: true, isOwner: true, permission: 'write' };
  }

  // Vérifier si la note est partagée avec l'utilisateur
  const [shareCheck] = await db.query(
    'SELECT permission FROM note_shares WHERE id_notes = ? AND id_users = ?',
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
    'UPDATE note_shares SET permission = ? WHERE id_notes = ? AND id_users = ? AND shared_by = ?',
    [newPermission, noteId, userId, ownerId]
  );
  return result.affectedRows;
};

// Obtenir toutes les notes accessibles par un utilisateur (propres + partagées)
const getAllAccessibleNotes = async (userId, projectId = null) => {
  let query = `
    SELECT 
      n.*,
      p.name as project_name,
      'owner' as access_type,
      'write' as permission
    FROM notes n
    LEFT JOIN projects p ON n.id_projects = p.id
    WHERE n.id_users = ?`;
  
  let params = [userId];
  
  if (projectId) {
    query += ` AND n.id_projects = ?`;
    params.push(parseInt(projectId, 10));
  }

  query += `
    UNION

    SELECT 
      n.*,
      p.name as project_name,
      'shared' as access_type,
      ns.permission
    FROM notes n
    INNER JOIN note_shares ns ON n.id = ns.id_notes
    LEFT JOIN projects p ON n.id_projects = p.id
    WHERE ns.id_users = ?`;
    
  params.push(userId);
  
  if (projectId) {
    query += ` AND n.id_projects = ?`;
    params.push(parseInt(projectId, 10));
  }

  query += ` ORDER BY updated_date DESC`;
  
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