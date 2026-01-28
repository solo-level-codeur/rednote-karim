const db = require('../config/db');

// Obtenir toutes les notes d'un utilisateur
const getAllNotes = async (userId) => {
  // Récupérer les notes
  const [notes] = await db.query(`
    SELECT 
      notes.note_id, 
      notes.title, 
      notes.content, 
      notes.user_id,
      notes.project_id, 
      notes.created_at, 
      notes.updated_at
    FROM notes
    WHERE notes.user_id = ?
    ORDER BY notes.updated_at DESC
  `, [userId]);
  
  // Pour chaque note, récupérer ses tags
  for (let note of notes) {
    const [tags] = await db.query(`
      SELECT 
        tags.tag_id as id, 
        tags.tag_name as name
      FROM note_tags
      JOIN tags ON note_tags.tag_id = tags.tag_id
      WHERE note_tags.note_id = ?
    `, [note.note_id]);
    note.tags = tags;
  }
  
  return notes;
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
  const [notes] = await db.query(`
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
  
  // Pour chaque note, récupérer ses tags
  for (let note of notes) {
    const [tags] = await db.query(`
      SELECT 
        tags.tag_id as id, 
        tags.tag_name as name
      FROM note_tags
      JOIN tags ON note_tags.tag_id = tags.tag_id
      WHERE note_tags.note_id = ?
    `, [note.note_id]);
    note.tags = tags;
  }
  
  return notes;
};

// Obtenir une note spécifique (compatible schema memo)
const getNoteById = async (id, userId, isAdminAccess = false) => {
  // L'autorisation est déjà gérée par le middleware authorizeNoteOwner
  // Donc on récupère directement la note par son ID
  const [rows] = await db.query(
    'SELECT note_id, title, content, user_id, project_id, created_at, updated_at FROM notes WHERE note_id = ?', 
    [id]
  );
  
  if (rows[0]) {
    // Récupérer les tags de cette note
    const [tags] = await db.query(`
      SELECT 
        tags.tag_id as id, 
        tags.tag_name as name
      FROM note_tags
      JOIN tags ON note_tags.tag_id = tags.tag_id
      WHERE note_tags.note_id = ?
    `, [id]);
    rows[0].tags = tags;
  }
  
  return rows[0];
};

// Créer une nouvelle note
const createNote = async (title, content, userId, projectId = null) => {
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


// Obtenir l'auteur d'une note spécifique  
const getNoteAuthor = async (noteId) => {
  const [rows] = await db.query(`
    SELECT 
      users.firstname,
      users.lastname
    FROM notes 
    INNER JOIN users ON notes.user_id = users.user_id
    WHERE notes.note_id = ?
  `, [noteId]);
  
  return rows[0];
};

module.exports = {
  getAllNotes,
  getAllNotesFromProject,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  getNoteAuthor,
};
