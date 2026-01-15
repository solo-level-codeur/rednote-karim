const db = require('../config/db');

// Créer un nouveau projet (compatible schema memo)
const createProject = async (name, description, userId) => {
  const [result] = await db.query(`
    INSERT INTO projects (
      project_name, 
      description, 
      start_date, 
      user_id
    ) VALUES (?, ?, CURDATE(), ?)
  `, [name, description, userId]);
  return result.insertId;
};

// Obtenir tous les projets d'un utilisateur (compatible schema memo)
const getAllProjects = async (userId, isAdminAccess = false) => {
  if (isAdminAccess) {
    // Admin et Manager voient tous les projets
    const [rows] = await db.query(`
      SELECT DISTINCT 
        projects.project_id, 
        projects.project_name, 
        projects.description, 
        projects.start_date, 
        projects.end_date,
        projects.user_id, 
        projects.created_at, 
        projects.updated_at,
        CASE 
          WHEN projects.user_id = ? THEN 'owner' 
          ELSE 'admin_access' 
        END as user_role
      FROM projects 
      ORDER BY projects.project_name ASC
    `, [userId]);
    return rows;
  } else {
    // Developer et Viewer voient seulement leurs projets invités
    const [rows] = await db.query(`
      SELECT DISTINCT 
        projects.project_id, 
        projects.project_name, 
        projects.description, 
        projects.start_date, 
        projects.end_date,
        projects.user_id, 
        projects.created_at, 
        projects.updated_at,
        CASE 
          WHEN projects.user_id = ? THEN 'owner' 
          ELSE 'member' 
        END as user_role
      FROM projects 
      LEFT JOIN project_members ON projects.project_id = project_members.project_id
      WHERE projects.user_id = ? OR project_members.user_id = ?
      ORDER BY projects.project_name ASC
    `, [userId, userId, userId]);
    return rows;
  }
};

// Obtenir un projet spécifique (compatible schema memo)
const getProjectById = async (projectId, userId, isAdminAccess = false) => {
  if (isAdminAccess) {
    // Admin et Manager peuvent voir tous les projets
    const [rows] = await db.query(`
      SELECT 
        project_id,
        project_name,
        description,
        start_date,
        end_date,
        user_id,
        created_at,
        updated_at
      FROM projects 
      WHERE project_id = ?
    `, [projectId]);
    return rows[0];
  } else {
    // Developer et Viewer voient seulement leurs projets invités
    const [rows] = await db.query(`
      SELECT 
        projects.project_id,
        projects.project_name,
        projects.description,
        projects.start_date,
        projects.end_date,
        projects.user_id,
        projects.created_at,
        projects.updated_at
      FROM projects 
      LEFT JOIN project_members ON projects.project_id = project_members.project_id
      WHERE projects.project_id = ? 
        AND (projects.user_id = ? OR project_members.user_id = ?)
      LIMIT 1
    `, [projectId, userId, userId]);
    return rows[0];
  }
};

// Mettre à jour un projet (compatible schema memo)
const updateProject = async (projectId, name, description, status, userId) => {
  const [result] = await db.query(`
    UPDATE projects 
    SET 
      project_name = ?, 
      description = ?, 
      updated_at = CURRENT_TIMESTAMP 
    WHERE project_id = ? AND user_id = ?
  `, [name, description, projectId, userId]);
  return result.affectedRows;
};

// Supprimer un projet et toutes ses notes associées (compatible schema memo)
const deleteProject = async (projectId, userId, isAdminRequest = false) => {
  try {
    // D'abord, supprimer toutes les notes du projet avec leurs relations
    const [notesToDelete] = await db.query(
      'SELECT note_id FROM notes WHERE project_id = ?',
      [projectId]
    );

    // Pour chaque note, supprimer ses relations puis la note
    for (const note of notesToDelete) {
      const noteId = note.note_id;
      
      // Supprimer les relations de la note
      await db.query('DELETE FROM note_tags WHERE note_id = ?', [noteId]);
      await db.query('DELETE FROM note_shares WHERE note_id = ?', [noteId]);
      await db.query('DELETE FROM comments WHERE note_id = ?', [noteId]);
      await db.query('DELETE FROM note_documents WHERE note_id = ?', [noteId]);
      
      // Supprimer la note
      await db.query('DELETE FROM notes WHERE note_id = ?', [noteId]);
    }

    // Supprimer les membres du projet
    await db.query('DELETE FROM project_members WHERE project_id = ?', [projectId]);
    
    // Supprimer les tags du projet
    await db.query('DELETE FROM project_tags WHERE project_id = ?', [projectId]);
    
    // Finalement, supprimer le projet
    let result;
    if (isAdminRequest) {
      // Admin peut supprimer n'importe quel projet
      [result] = await db.query(
        'DELETE FROM projects WHERE project_id = ?', 
        [projectId]
      );
    } else {
      // Utilisateur normal peut seulement supprimer ses propres projets
      [result] = await db.query(
        'DELETE FROM projects WHERE project_id = ? AND user_id = ?', 
        [projectId, userId]
      );
    }
    
    return result.affectedRows;
  } catch (error) {
    console.error('Erreur lors de la suppression du projet:', error);
    throw error;
  }
};

// Ajouter un membre à un projet (compatible schema memo)
const addProjectMember = async (projectId, userId) => {
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
const removeProjectMember = async (projectId, userId, requesterId, isAdminRequest = false) => {
  // Admin peut toujours retirer des membres
  if (!isAdminRequest) {
    // Vérifier que le demandeur est propriétaire du projet
    const [ownerCheck] = await db.query(
      'SELECT 1 FROM projects WHERE project_id = ? AND user_id = ?',
      [projectId, requesterId]
    );
    
    if (ownerCheck.length === 0) {
      throw new Error('Seul le propriétaire peut retirer des membres');
    }
  }

  const [result] = await db.query(
    'DELETE FROM project_members WHERE project_id = ? AND user_id = ?',
    [projectId, userId]
  );
  return result.affectedRows > 0;
};

// Obtenir tous les membres d'un projet (compatible schema memo)
const getProjectMembers = async (projectId, userId, isAdminAccess = false) => {
  // Admin peut accéder à tous les projets
  if (!isAdminAccess) {
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
const updateMemberRole = async (projectId, userId, newRole, requesterId, isAdminRequest = false) => {
  // Admin peut toujours modifier les rôles
  if (!isAdminRequest) {
    // Vérifier que le demandeur est propriétaire du projet
    const [ownerCheck] = await db.query(
      'SELECT 1 FROM projects WHERE project_id = ? AND user_id = ?',
      [projectId, requesterId]
    );
    
    if (ownerCheck.length === 0) {
      throw new Error('Seul le propriétaire peut modifier les rôles');
    }
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
