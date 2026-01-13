const db = require('../config/db');

// Obtenir toutes les notes d'un utilisateur (compatible schema memo)
const getAllNotes = async (userId) => {
  const [rows] = await db.query(
    'SELECT note_id, title, content, user_id, project_id, created_at, updated_at FROM notes WHERE user_id = ? ORDER BY updated_at DESC', 
    [userId]
  );
  return rows;
};

// Obtenir toutes les notes d'un projet (compatible schema memo)
const getAllNotesFromProject = async (projectId, userId) => {
  // Vérifier l'accès au projet (utilisateur membre ou propriétaire)
  const [accessCheck] = await db.query(`
    SELECT 1 FROM projects p
    LEFT JOIN project_members pm ON p.project_id = pm.project_id
    WHERE p.project_id = ? AND (p.user_id = ? OR pm.user_id = ?)
    LIMIT 1
  `, [projectId, userId, userId]);
  
  if (accessCheck.length === 0) {
    throw new Error('Accès refusé au projet');
  }
  
  // Récupérer les notes du projet avec informations auteur
  const [rows] = await db.query(`
    SELECT n.note_id, n.title, n.content, n.user_id, n.project_id, n.created_at, n.updated_at,
           u.firstname as author_firstname,
           u.lastname as author_lastname,
           p.project_name,
           CASE WHEN n.user_id = ? THEN 'owner' ELSE 'member' END as note_role
    FROM notes n
    INNER JOIN users u ON n.user_id = u.user_id
    INNER JOIN projects p ON n.project_id = p.project_id
    WHERE n.project_id = ?
    ORDER BY n.updated_at DESC
  `, [userId, projectId]);
  
  return rows;
};

// Obtenir une note spécifique (compatible schema memo)
const getNoteById = async (id, userId) => {
  const [rows] = await db.query(
    'SELECT note_id, title, content, user_id, project_id, created_at, updated_at FROM notes WHERE note_id = ? AND user_id = ?', 
    [id, userId]
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
const updateNote = async (id, title, content, userId, projectId = null) => {
  const [result] = await db.query(
    'UPDATE notes SET title = ?, content = ?, project_id = ?, updated_at = CURRENT_TIMESTAMP WHERE note_id = ? AND user_id = ?', 
    [title, content, projectId, id, userId]
  );
  return result.affectedRows;
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
    SELECT n.note_id, n.title, n.content, n.user_id, n.project_id, n.created_at, n.updated_at,
           p.project_name 
    FROM notes n 
    LEFT JOIN projects p ON n.project_id = p.project_id 
    WHERE n.user_id = ? 
    AND (n.title LIKE ? OR n.content LIKE ?)
  `;
  let params = [userId, `%${searchTerm}%`, `%${searchTerm}%`];

  // Filtrer par projet
  if (projectId) {
    query += ' AND n.project_id = ?';
    params.push(projectId);
  }

  query += ' ORDER BY n.updated_at DESC';

  const [rows] = await db.query(query, params);
  return rows;
};

// Obtenir notes avec filtres avancés (compatible schema memo)
const getNotesWithFilters = async (userId, filters = {}) => {
  let query = `
    SELECT n.note_id, n.title, n.content, n.user_id, n.project_id, n.created_at, n.updated_at,
           p.project_name 
    FROM notes n 
    LEFT JOIN projects p ON n.project_id = p.project_id 
    WHERE n.user_id = ?
  `;
  let params = [userId];

  // Filtre par projet
  if (filters.projectId) {
    query += ' AND n.project_id = ?';
    params.push(filters.projectId);
  }

  // Filtre par date
  if (filters.dateFrom) {
    query += ' AND n.created_at >= ?';
    params.push(filters.dateFrom);
  }

  if (filters.dateTo) {
    query += ' AND n.created_at <= ?';
    params.push(filters.dateTo);
  }

  // Tri
  const sortBy = filters.sortBy || 'updated_at';
  const sortOrder = filters.sortOrder || 'DESC';
  query += ` ORDER BY n.${sortBy} ${sortOrder}`;

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
