const db = require('../config/db');

// Créer un nouveau projet
const createProject = async (name, description, userId) => {
  const [result] = await db.query(
    'INSERT INTO projects (name, description, creation_date, id_owner) VALUES (?, ?, CURDATE(), ?)',
    [name, description, userId]
  );
  return result.insertId;
};

// Obtenir tous les projets d'un utilisateur (possédés + membre)
const getAllProjects = async (userId) => {
  const [rows] = await db.query(`
    SELECT DISTINCT p.*, 
           CASE WHEN p.id_owner = ? THEN 'owner' ELSE 'member' END as user_role
    FROM projects p
    LEFT JOIN project_members pm ON p.id = pm.id_projects
    WHERE p.id_owner = ? OR pm.id_users = ?
    ORDER BY p.name ASC
  `, [userId, userId, userId]);
  return rows;
};

// Obtenir un projet spécifique
const getProjectById = async (projectId, userId) => {
  const [rows] = await db.query('SELECT * FROM projects WHERE id = ? AND id_owner = ?', [projectId, userId]);
  return rows[0];
};

// Mettre à jour un projet
const updateProject = async (projectId, name, description, status, userId) => {
  const [result] = await db.query(
    'UPDATE projects SET name = ?, description = ?, status = ? WHERE id = ? AND id_owner = ?',
    [name, description, status, projectId, userId]
  );
  return result.affectedRows;
};

// Supprimer un projet
const deleteProject = async (projectId, userId) => {
  const [result] = await db.query('DELETE FROM projects WHERE id = ? AND id_owner = ?', [projectId, userId]);
  return result.affectedRows;
};

// Ajouter un membre à un projet avec un rôle
const addProjectMember = async (projectId, userId, role = 'Member') => {
  try {
    const [result] = await db.query(
      'INSERT INTO project_members (id_projects, id_users, role, joined_date) VALUES (?, ?, ?, CURDATE())',
      [projectId, userId, role]
    );
    return result.affectedRows > 0;
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      // L'utilisateur est déjà membre du projet, mettre à jour son rôle
      const [updateResult] = await db.query(
        'UPDATE project_members SET role = ? WHERE id_projects = ? AND id_users = ?',
        [role, projectId, userId]
      );
      return updateResult.affectedRows > 0;
    }
    throw error;
  }
};

// Retirer un membre d'un projet
const removeProjectMember = async (projectId, userId, requesterId) => {
  // Vérifier que le demandeur est propriétaire du projet
  const [ownerCheck] = await db.query(
    'SELECT 1 FROM projects WHERE id = ? AND id_owner = ?',
    [projectId, requesterId]
  );
  
  if (ownerCheck.length === 0) {
    throw new Error('Seul le propriétaire peut retirer des membres');
  }

  const [result] = await db.query(
    'DELETE FROM project_members WHERE id_projects = ? AND id_users = ?',
    [projectId, userId]
  );
  return result.affectedRows > 0;
};

// Obtenir tous les membres d'un projet
const getProjectMembers = async (projectId, userId) => {
  // Vérifier que l'utilisateur a accès au projet
  const [accessCheck] = await db.query(`
    SELECT 1 FROM projects p
    LEFT JOIN project_members pm ON p.id = pm.id_projects
    WHERE p.id = ? AND (p.id_owner = ? OR pm.id_users = ?)
    LIMIT 1
  `, [projectId, userId, userId]);
  
  if (accessCheck.length === 0) {
    throw new Error('Accès refusé au projet');
  }

  // Récupérer tous les membres avec leurs informations
  const [members] = await db.query(`
    SELECT 
      u.id_users as id,
      u.firstname,
      u.lastname, 
      u.email,
      pm.role,
      pm.joined_date,
      CASE WHEN p.id_owner = u.id_users THEN 'owner' ELSE 'member' END as user_type
    FROM users u
    LEFT JOIN project_members pm ON u.id_users = pm.id_users AND pm.id_projects = ?
    INNER JOIN projects p ON p.id = ?
    WHERE (p.id_owner = u.id_users OR pm.id_users IS NOT NULL)
    ORDER BY 
      CASE WHEN p.id_owner = u.id_users THEN 0 ELSE 1 END,
      pm.joined_date ASC
  `, [projectId, projectId]);

  return members;
};

// Mettre à jour le rôle d'un membre
const updateMemberRole = async (projectId, userId, newRole, requesterId) => {
  // Vérifier que le demandeur est propriétaire du projet
  const [ownerCheck] = await db.query(
    'SELECT 1 FROM projects WHERE id = ? AND id_owner = ?',
    [projectId, requesterId]
  );
  
  if (ownerCheck.length === 0) {
    throw new Error('Seul le propriétaire peut modifier les rôles');
  }

  const [result] = await db.query(
    'UPDATE project_members SET role = ? WHERE id_projects = ? AND id_users = ?',
    [newRole, projectId, userId]
  );
  return result.affectedRows > 0;
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
