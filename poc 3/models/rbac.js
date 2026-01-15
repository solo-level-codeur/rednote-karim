const db = require('../config/db');

// =====================================
// RBAC ULTRA-SIMPLE - Une seule fonction
// =====================================

/**
 * Vérifie si un utilisateur peut faire une action
 * @param {number} userId - ID utilisateur  
 * @param {string} permission - Nom de la permission ('view_projects', 'create_notes', etc.)
 * @returns {Promise<boolean>} - True si autorisé
 */
const hasPermission = async (userId, permission) => {
  try {
    const [rows] = await db.query(`
      SELECT 1 
      FROM users u
      JOIN role_permissions rp ON u.role_id = rp.role_id
      JOIN permissions p ON rp.permission_id = p.permission_id
      WHERE u.user_id = ? AND p.permission_name = ?
    `, [userId, permission]);
    
    return rows.length > 0;
  } catch (error) {
    console.error('Erreur RBAC:', error);
    return false;
  }
};

module.exports = { hasPermission };