const db = require('../config/db');

// Créer un nouveau projet (compatible schema memo)
const createProject = async (name, description, userId) => {
  const [result] = await db.query(
    'INSERT INTO projects (project_name, description, start_date, user_id) VALUES (?, ?, CURDATE(), ?)',
    [name, description, userId]
  );
  return result.insertId;
};

// Obtenir tous les projets d'un utilisateur (compatible schema memo)
const getAllProjects = async (userId) => {
  const [rows] = await db.query(`
    SELECT DISTINCT p.project_id, p.project_name, p.description, p.start_date, p.end_date, 
           p.user_id, p.created_at, p.updated_at,
           CASE WHEN p.user_id = ? THEN 'owner' ELSE 'member' END as user_role
    FROM projects p
    LEFT JOIN project_members pm ON p.project_id = pm.project_id
    WHERE p.user_id = ? OR pm.user_id = ?
    ORDER BY p.project_name ASC
  `, [userId, userId, userId]);
  return rows;
};

// Obtenir un projet spécifique (compatible schema memo)
const getProjectById = async (projectId, userId) => {
  const [rows] = await db.query(
    'SELECT * FROM projects WHERE project_id = ? AND user_id = ?', 
    [projectId, userId]
  );
  return rows[0];
};

// Mettre à jour un projet (compatible schema memo)
const updateProject = async (projectId, name, description, status, userId) => {
  const [result] = await db.query(
    'UPDATE projects SET project_name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE project_id = ? AND user_id = ?',
    [name, description, projectId, userId]
  );
  return result.affectedRows;
};

// Supprimer un projet (compatible schema memo)
const deleteProject = async (projectId, userId) => {
  const [result] = await db.query(
    'DELETE FROM projects WHERE project_id = ? AND user_id = ?', 
    [projectId, userId]
  );
  return result.affectedRows;
};

// Ajouter un membre à un projet (compatible schema memo)
const addProjectMember = async (projectId, userId, role = 'Member') => {
  try {
    const [result] = await db.query(
      'INSERT INTO project_members (project_id, user_id) VALUES (?, ?)',
      [projectId, userId]
    );
    return result.affectedRows > 0;
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      // L'utilisateur est déjà membre du projet
      return false;
    }
    throw error;
  }
};

// Retirer un membre d'un projet (compatible schema memo)
const removeProjectMember = async (projectId, userId, requesterId) => {
  // Vérifier que le demandeur est propriétaire du projet
  const [ownerCheck] = await db.query(
    'SELECT 1 FROM projects WHERE project_id = ? AND user_id = ?',
    [projectId, requesterId]
  );
  
  if (ownerCheck.length === 0) {
    throw new Error('Seul le propriétaire peut retirer des membres');
  }

  const [result] = await db.query(
    'DELETE FROM project_members WHERE project_id = ? AND user_id = ?',
    [projectId, userId]
  );
  return result.affectedRows > 0;
};

// Obtenir tous les membres d'un projet (compatible schema memo)
const getProjectMembers = async (projectId, userId) => {
  // Vérifier que l'utilisateur a accès au projet
  const [accessCheck] = await db.query(`
    SELECT 1 FROM projects p
    LEFT JOIN project_members pm ON p.project_id = pm.project_id
    WHERE p.project_id = ? AND (p.user_id = ? OR pm.user_id = ?)
    LIMIT 1
  `, [projectId, userId, userId]);
  
  if (accessCheck.length === 0) {
    throw new Error('Accès refusé au projet');
  }

  // Récupérer tous les membres avec leurs informations
  const [members] = await db.query(`
    SELECT 
      u.user_id as id,
      u.firstname,
      u.lastname, 
      u.email,
      pm.joined_at,
      CASE WHEN p.user_id = u.user_id THEN 'owner' ELSE 'member' END as user_type
    FROM users u
    LEFT JOIN project_members pm ON u.user_id = pm.user_id AND pm.project_id = ?
    INNER JOIN projects p ON p.project_id = ?
    WHERE (p.user_id = u.user_id OR pm.user_id IS NOT NULL)
    ORDER BY 
      CASE WHEN p.user_id = u.user_id THEN 0 ELSE 1 END,
      pm.joined_at ASC
  `, [projectId, projectId]);

  return members;
};

// Mettre à jour le rôle d'un membre (simplifié pour schema memo)
const updateMemberRole = async (projectId, userId, newRole, requesterId) => {
  // Vérifier que le demandeur est propriétaire du projet
  const [ownerCheck] = await db.query(
    'SELECT 1 FROM projects WHERE project_id = ? AND user_id = ?',
    [projectId, requesterId]
  );
  
  if (ownerCheck.length === 0) {
    throw new Error('Seul le propriétaire peut modifier les rôles');
  }

  // Dans le nouveau schéma, on peut juste vérifier l'existence du membre
  const [memberCheck] = await db.query(
    'SELECT 1 FROM project_members WHERE project_id = ? AND user_id = ?',
    [projectId, userId]
  );
  return memberCheck.length > 0;
};

module.exports = {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addProjectMember,
  removeProjectMember,
  getProjectMembers,
  updateMemberRole
};
