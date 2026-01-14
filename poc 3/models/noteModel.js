const db = require('../config/db');

// Obtenir toutes les notes d'un utilisateur + notes des projets où il est membre (compatible schema memo)
const getAllNotes = async (userId) => {
  const [rows] = await db.query(`
    SELECT DISTINCT 
      notes.note_id, 
      notes.title, 
      notes.content, 
      notes.user_id, 
      notes.project_id, 
      notes.created_at, 
      notes.updated_at,
      CASE WHEN notes.user_id = ? THEN 'owner' ELSE 'shared' END as note_role,
      projects.project_name,
      users.firstname as author_firstname,
      users.lastname as author_lastname
    FROM notes 
    LEFT JOIN projects ON notes.project_id = projects.project_id
    LEFT JOIN users ON notes.user_id = users.user_id
    WHERE notes.user_id = ?
    OR (notes.project_id IN (
      SELECT DISTINCT projects_sub.project_id 
      FROM projects projects_sub
      LEFT JOIN project_members ON projects_sub.project_id = project_members.project_id
      WHERE projects_sub.user_id = ? OR project_members.user_id = ?
    ))
    ORDER BY notes.updated_at DESC
  `, [userId, userId, userId, userId]);
  return rows;
};

// Obtenir toutes les notes d'un projet (compatible schema memo)
const getAllNotesFromProject = async (projectId, userId, isAdminAccess = false) => {
  // Bypass pour les admins
  if (!isAdminAccess) {
    // Vérifier l'accès au projet (utilisateur membre ou propriétaire) 
    const [accessCheck] = await db.query(`
      SELECT 1 FROM projects 
      LEFT JOIN project_members ON projects.project_id = project_members.project_id
      WHERE projects.project_id = ? AND (projects.user_id = ? OR project_members.user_id = ?)
      LIMIT 1
    `, [projectId, userId, userId]);
    
    if (accessCheck.length === 0) {
      throw new Error('Accès refusé au projet');
    }
  }
  
  // Récupérer les notes du projet avec informations auteur
  const [rows] = await db.query(`
    SELECT 
      notes.note_id, 
      notes.title, 
      notes.content, 
      notes.user_id, 
      notes.project_id, 
      notes.created_at, 
      notes.updated_at,
      users.firstname as author_firstname,
      users.lastname as author_lastname,
      projects.project_name,
      CASE WHEN notes.user_id = ? THEN 'owner' ELSE 'member' END as note_role
    FROM notes 
    INNER JOIN users ON notes.user_id = users.user_id
    INNER JOIN projects ON notes.project_id = projects.project_id
    WHERE notes.project_id = ?
    ORDER BY notes.updated_at DESC
  `, [userId, projectId]);
  
  return rows;
};

// Obtenir une note spécifique (compatible schema memo)
const getNoteById = async (id, userId, isAdminAccess = false) => {
  // L'autorisation est déjà gérée par le middleware authorizeNoteOwner
  // Donc on récupère directement la note par son ID
  const [rows] = await db.query(
    'SELECT note_id, title, content, user_id, project_id, created_at, updated_at FROM notes WHERE note_id = ?', 
    [id]
  );
  return rows[0];
};

// Créer une nouvelle note (compatible schema memo)
const createNote = async (title, content, userId, projectId = null) => {
  // Si aucun projectId, créer ou récupérer projet par défaut
  if (!projectId) {
    try {
      const [defaultProject] = await db.query(
        'SELECT project_id FROM projects WHERE project_name = "Projet par défaut" AND user_id = ? LIMIT 1',
        [userId]
      );
      
      if (defaultProject.length === 0) {
        // Créer projet par défaut
        const [projectResult] = await db.query(
          'INSERT INTO projects (project_name, description, start_date, user_id) VALUES (?, ?, CURDATE(), ?)',
          ['Projet par défaut', 'Notes personnelles', userId]
        );
        projectId = projectResult.insertId;
      } else {
        projectId = defaultProject[0].project_id;
      }
    } catch (error) {
      console.error('Erreur création projet par défaut:', error);
      throw error;
    }
  }

  const [result] = await db.query(
    'INSERT INTO notes (title, content, user_id, project_id) VALUES (?, ?, ?, ?)', 
    [title, content, userId, projectId]
  );
  return result.insertId;
};

// Mettre à jour une note (compatible schema memo)
const updateNote = async (id, title, content, userId, projectId = null, isAdminAccess = false) => {
  // Construire la requête dynamiquement selon les champs à mettre à jour
  let updateFields = ['title = ?', 'content = ?', 'updated_at = CURRENT_TIMESTAMP'];
  let params = [title, content];
  
  // Ne mettre à jour project_id que si explicitement fourni et différent de null
  if (projectId !== null && projectId !== undefined) {
    updateFields.push('project_id = ?');
    params.push(projectId);
  }
  
  if (isAdminAccess) {
    // Admin peut modifier toutes les notes
    const query = `UPDATE notes SET ${updateFields.join(', ')} WHERE note_id = ?`;
    params.push(id);
    const [result] = await db.query(query, params);
    return result.affectedRows;
  } else {
    // Utilisateurs normaux modifient seulement leurs notes (mais l'autorisation est gérée par le middleware)
    const query = `UPDATE notes SET ${updateFields.join(', ')} WHERE note_id = ?`;
    params.push(id);
    const [result] = await db.query(query, params);
    return result.affectedRows;
  }
};

// Supprimer une note et ses relations (compatible schema memo)
const deleteNote = async (id, userId) => {
  try {
    // Supprimer les relations liées (schema memo)
    
    // Supprimer les tags de la note
    await db.query('DELETE FROM note_tags WHERE note_id = ?', [id]);
    
    // Supprimer les partages de la note
    await db.query('DELETE FROM note_shares WHERE note_id = ?', [id]);
    
    // Supprimer les commentaires de la note
    await db.query('DELETE FROM comments WHERE note_id = ?', [id]);
    
    // Supprimer les documents liés à la note
    await db.query('DELETE FROM note_documents WHERE note_id = ?', [id]);
    
    // Supprimer la note
    const [result] = await db.query('DELETE FROM notes WHERE note_id = ? AND user_id = ?', [id, userId]);
    
    return result.affectedRows;
  } catch (error) {
    console.error('Erreur suppression note:', error);
    throw error;
  }
};

// Rechercher des notes (compatible schema memo)
const searchNotes = async (userId, searchTerm, projectId = null) => {
  let query = `
    SELECT 
      notes.note_id, 
      notes.title, 
      notes.content, 
      notes.user_id, 
      notes.project_id, 
      notes.created_at, 
      notes.updated_at,
      projects.project_name 
    FROM notes 
    LEFT JOIN projects ON notes.project_id = projects.project_id 
    WHERE notes.user_id = ? 
    AND (notes.title LIKE ? OR notes.content LIKE ?)
  `;
  let params = [userId, `%${searchTerm}%`, `%${searchTerm}%`];

  // Filtrer par projet
  if (projectId) {
    query += ' AND notes.project_id = ?';
    params.push(projectId);
  }

  query += ' ORDER BY notes.updated_at DESC';

  const [rows] = await db.query(query, params);
  return rows;
};

// Obtenir notes avec filtres avancés (compatible schema memo)
const getNotesWithFilters = async (userId, filters = {}) => {
  let query = `
    SELECT 
      notes.note_id, 
      notes.title, 
      notes.content, 
      notes.user_id, 
      notes.project_id, 
      notes.created_at, 
      notes.updated_at,
      projects.project_name 
    FROM notes 
    LEFT JOIN projects ON notes.project_id = projects.project_id 
    WHERE notes.user_id = ?
  `;
  let params = [userId];

  // Filtre par projet
  if (filters.projectId) {
    query += ' AND notes.project_id = ?';
    params.push(filters.projectId);
  }

  // Filtre par date
  if (filters.dateFrom) {
    query += ' AND notes.created_at >= ?';
    params.push(filters.dateFrom);
  }

  if (filters.dateTo) {
    query += ' AND notes.created_at <= ?';
    params.push(filters.dateTo);
  }

  // Tri
  const sortBy = filters.sortBy || 'updated_at';
  const sortOrder = filters.sortOrder || 'DESC';
  query += ` ORDER BY notes.${sortBy} ${sortOrder}`;

  // Limite
  if (filters.limit) {
    query += ' LIMIT ?';
    params.push(parseInt(filters.limit));
  }

  const [rows] = await db.query(query, params);
  return rows;
};

module.exports = {
  getAllNotes,
  getAllNotesFromProject,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  searchNotes,
  getNotesWithFilters,
};
