const db = require('../config/db');

// Obtenir toutes les notes d'un utilisateur
const getAllNotes = async (userId) => {
  const [rows] = await db.query('SELECT * FROM notes WHERE id_users = ?', [userId]);
  return rows;
};

// Obtenir une note spécifique par son ID et l'ID de l'utilisateur
const getNoteById = async (id, userId) => {
  const [rows] = await db.query('SELECT * FROM notes WHERE id = ? AND id_users = ?', [id, userId]);
  return rows[0];
};

// Créer une nouvelle note
const createNote = async (title, content, userId, projectId = null) => {
  // Si aucun projectId n'est fourni, créer ou utiliser un projet par défaut
  if (!projectId) {
    try {
      // Vérifier s'il existe un projet par défaut
      const [defaultProject] = await db.query(
        'SELECT id FROM projects WHERE name = "Projet par défaut" AND id_owner = ? LIMIT 1',
        [userId]
      );
      
      if (defaultProject.length === 0) {
        // Créer un projet par défaut
        const [projectResult] = await db.query(
          'INSERT INTO projects (name, description, creation_date, id_owner) VALUES (?, ?, CURDATE(), ?)',
          ['Projet par défaut', 'Notes personnelles', userId]
        );
        projectId = projectResult.insertId;
      } else {
        projectId = defaultProject[0].id;
      }
    } catch (error) {
      console.error('Erreur lors de la création du projet par défaut:', error);
      throw error;
    }
  }

  const [result] = await db.query(
    'INSERT INTO notes (title, content, id_users, id_projects) VALUES (?, ?, ?, ?)', 
    [title, content, userId, projectId]
  );
  return result.insertId;
};

// Mettre à jour une note
const updateNote = async (id, title, content, userId) => {
  const [result] = await db.query('UPDATE notes SET title = ?, content = ? WHERE id = ? AND id_users = ?', [title, content, id, userId]);
  return result.affectedRows;
};

// Supprimer une note
const deleteNote = async (id, userId) => {
  try {
    // D'abord supprimer toutes les relations liées à cette note
    
    // Supprimer les tags de la note
    await db.query('DELETE FROM note_tags WHERE id_notes = ?', [id]);
    
    // Supprimer les partages de la note
    await db.query('DELETE FROM note_shares WHERE id_notes = ?', [id]);
    
    // Supprimer les commentaires de la note
    await db.query('DELETE FROM comments WHERE id_notes = ?', [id]);
    
    // Supprimer les documents liés à la note
    await db.query('DELETE FROM note_documents WHERE id_notes = ?', [id]);
    
    // Enfin supprimer la note elle-même
    const [result] = await db.query('DELETE FROM notes WHERE id = ? AND id_users = ?', [id, userId]);
    
    return result.affectedRows;
  } catch (error) {
    console.error('Erreur lors de la suppression de la note:', error);
    throw error;
  }
};

// Rechercher des notes
const searchNotes = async (userId, searchTerm, projectId = null) => {
  let query = `
    SELECT n.*, p.name as project_name 
    FROM notes n 
    LEFT JOIN projects p ON n.id_projects = p.id 
    WHERE n.id_users = ? 
    AND (n.title LIKE ? OR n.content LIKE ?)
  `;
  let params = [userId, `%${searchTerm}%`, `%${searchTerm}%`];

  // Filtrer par projet si spécifié
  if (projectId) {
    query += ' AND n.id_projects = ?';
    params.push(projectId);
  }

  query += ' ORDER BY n.updated_date DESC';

  const [rows] = await db.query(query, params);
  return rows;
};

// Obtenir des notes avec filtres avancés
const getNotesWithFilters = async (userId, filters = {}) => {
  let query = `
    SELECT n.*, p.name as project_name 
    FROM notes n 
    LEFT JOIN projects p ON n.id_projects = p.id 
    WHERE n.id_users = ?
  `;
  let params = [userId];

  // Filtre par projet
  if (filters.projectId) {
    query += ' AND n.id_projects = ?';
    params.push(filters.projectId);
  }

  // Filtre par date
  if (filters.dateFrom) {
    query += ' AND n.creation_date >= ?';
    params.push(filters.dateFrom);
  }

  if (filters.dateTo) {
    query += ' AND n.creation_date <= ?';
    params.push(filters.dateTo);
  }

  // Tri
  const sortBy = filters.sortBy || 'updated_date';
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
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  searchNotes,
  getNotesWithFilters,
};
