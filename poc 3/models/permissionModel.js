const db = require('../config/db');

// =====================================
// MODÈLE PERMISSIONS - Réplication logique hardcodée exacte
// =====================================

/**
 * Récupère toutes les permissions d'un utilisateur
 * @param {number} userId - ID de l'utilisateur
 * @returns {Promise<string[]>} - Liste des permissions
 */
const getUserPermissions = async (userId) => {
  try {
    const [rows] = await db.query(`
      SELECT DISTINCT p.permission_name 
      FROM permissions p
      JOIN role_permissions rp ON p.permission_id = rp.permission_id  
      JOIN users u ON u.role_id = rp.role_id
      WHERE u.user_id = ?
    `, [userId]);
    
    return rows.map(row => row.permission_name);
  } catch (error) {
    console.error('Erreur getUserPermissions:', error);
    return [];
  }
};

/**
 * Vérifie si un utilisateur a une permission spécifique
 * @param {number} userId - ID utilisateur
 * @param {string} permissionName - Nom de la permission
 * @returns {Promise<boolean>} - True si autorisé
 */
const hasPermission = async (userId, permissionName) => {
  try {
    const [rows] = await db.query(`
      SELECT 1 FROM permissions p
      JOIN role_permissions rp ON p.permission_id = rp.permission_id
      JOIN users u ON u.role_id = rp.role_id  
      WHERE u.user_id = ? AND p.permission_name = ?
    `, [userId, permissionName]);
    
    return rows.length > 0;
  } catch (error) {
    console.error('Erreur hasPermission:', error);
    return false;
  }
};

/**
 * Récupère le rôle d'un utilisateur (pour compatibilité)
 * @param {number} userId - ID utilisateur
 * @returns {Promise<number|null>} - Role ID
 */
const getUserRole = async (userId) => {
  try {
    const [rows] = await db.query(`
      SELECT role_id FROM users WHERE user_id = ?
    `, [userId]);
    
    return rows.length > 0 ? rows[0].role_id : null;
  } catch (error) {
    console.error('Erreur getUserRole:', error);
    return null;
  }
};

/**
 * Vérifie si un utilisateur est admin (bypass total)
 * Réplique: if (await hasPermission(userId, 'manage_users'))
 * @param {number} userId - ID utilisateur
 * @returns {Promise<boolean>} - True si admin
 */
const isAdmin = async (userId) => {
  return await hasPermission(userId, 'admin_override');
};

/**
 * Vérifie si un utilisateur peut voir un projet spécifique
 * Réplique la logique: propriétaire OU membre OU admin
 * @param {number} userId - ID utilisateur
 * @param {number} projectId - ID projet
 * @returns {Promise<boolean>} - True si peut voir
 */
const canViewProject = async (userId, projectId) => {
  try {
    // Admin peut tout voir
    if (await isAdmin(userId)) {
      return true;
    }

    // Propriétaire du projet OU membre du projet
    const [rows] = await db.query(`
      SELECT 1 FROM projects p
      WHERE p.project_id = ? AND (
        p.user_id = ? OR 
        EXISTS (
          SELECT 1 FROM project_members pm 
          WHERE pm.project_id = ? AND pm.user_id = ?
        )
      )
    `, [projectId, userId, projectId, userId]);
    
    return rows.length > 0;
  } catch (error) {
    console.error('Erreur canViewProject:', error);
    return false;
  }
};

/**
 * Vérifie si un utilisateur peut modifier une note
 * Réplique la logique exacte du code hardcodé
 * @param {number} userId - ID utilisateur
 * @param {number} noteId - ID note
 * @returns {Promise<boolean>} - True si peut modifier
 */
const canEditNote = async (userId, noteId) => {
  try {
    // Admin peut tout modifier
    if (await isAdmin(userId)) {
      return true;
    }

    // Viewer ne peut jamais modifier - vérifier permission edit_notes
    const { hasPermission } = require('./rbac');
    if (!(await hasPermission(userId, 'edit_notes'))) {
      return false;
    }

    // Propriétaire de la note
    const [noteRows] = await db.query(`
      SELECT user_id, project_id FROM notes WHERE note_id = ?
    `, [noteId]);
    
    if (noteRows.length === 0) return false;
    
    const note = noteRows[0];
    if (note.user_id === userId) {
      return true;
    }

    // Si la note est dans un projet, vérifier si membre ET (Manager OU Developer)
    if (note.project_id) {
      const [projectRows] = await db.query(`
        SELECT 1 FROM project_members pm
        JOIN users u ON pm.user_id = u.user_id  
        WHERE pm.project_id = ? AND pm.user_id = ? AND u.role_id IN (2, 3)
      `, [note.project_id, userId]);
      
      return projectRows.length > 0;
    }

    return false;
  } catch (error) {
    console.error('Erreur canEditNote:', error);
    return false;
  }
};

/**
 * Vérifie si un utilisateur peut supprimer une ressource
 * Réplique: Admin OU propriétaire
 * @param {number} userId - ID utilisateur
 * @param {number} resourceId - ID de la ressource
 * @param {string} table - Table de la ressource ('notes', 'projects', etc.)
 * @returns {Promise<boolean>} - True si peut supprimer
 */
const canDelete = async (userId, resourceId, table) => {
  try {
    // Admin peut tout supprimer
    if (await isAdmin(userId)) {
      return true;
    }

    // Propriétaire de la ressource
    const [rows] = await db.query(`
      SELECT user_id FROM ?? WHERE ${table === 'notes' ? 'note_id' : 'project_id'} = ?
    `, [table, resourceId]);
    
    return rows.length > 0 && rows[0].user_id === userId;
  } catch (error) {
    console.error('Erreur canDelete:', error);
    return false;
  }
};

module.exports = {
  getUserPermissions,
  hasPermission,
  getUserRole,
  isAdmin,
  canViewProject,
  canEditNote,
  canDelete
};