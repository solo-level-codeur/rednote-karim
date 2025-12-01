const db = require('../config/db');

// Créer un nouveau tag
const createTag = async (name, color = '#808080', userId) => {
  const [result] = await db.query(
    'INSERT INTO tags (name, color) VALUES (?, ?)',
    [name, color]
  );
  return result.insertId;
};

// Obtenir tous les tags
const getAllTags = async (userId) => {
  const [rows] = await db.query(
    'SELECT * FROM tags ORDER BY name'
  );
  return rows;
};

// Obtenir un tag par ID
const getTagById = async (tagId, userId) => {
  const [rows] = await db.query(
    'SELECT * FROM tags WHERE id = ?',
    [tagId]
  );
  return rows[0];
};

// Mettre à jour un tag
const updateTag = async (tagId, name, color, userId) => {
  const [result] = await db.query(
    'UPDATE tags SET name = ?, color = ? WHERE id = ?',
    [name, color, tagId]
  );
  return result.affectedRows;
};

// Supprimer un tag
const deleteTag = async (tagId, userId) => {
  // D'abord supprimer les associations note-tag
  await db.query('DELETE FROM note_tags WHERE id_tags = ?', [tagId]);
  
  // Puis supprimer le tag
  const [result] = await db.query(
    'DELETE FROM tags WHERE id = ?',
    [tagId]
  );
  return result.affectedRows;
};

// Ajouter un tag à une note
const addTagToNote = async (noteId, tagId) => {
  const [result] = await db.query(
    'INSERT IGNORE INTO note_tags (id_notes, id_tags) VALUES (?, ?)',
    [noteId, tagId]
  );
  return result.affectedRows;
};

// Supprimer un tag d'une note
const removeTagFromNote = async (noteId, tagId) => {
  const [result] = await db.query(
    'DELETE FROM note_tags WHERE id_notes = ? AND id_tags = ?',
    [noteId, tagId]
  );
  return result.affectedRows;
};

// Obtenir les tags d'une note
const getNoteTags = async (noteId) => {
  const [rows] = await db.query(`
    SELECT t.* FROM tags t 
    INNER JOIN note_tags nt ON t.id = nt.id_tags 
    WHERE nt.id_notes = ?
  `, [noteId]);
  return rows;
};

// Obtenir les notes avec un tag spécifique
const getNotesByTag = async (tagId, userId) => {
  const [rows] = await db.query(`
    SELECT n.*, p.name as project_name 
    FROM notes n 
    LEFT JOIN projects p ON n.id_projects = p.id
    INNER JOIN note_tags nt ON n.id = nt.id_notes 
    WHERE nt.id_tags = ? AND n.id_users = ?
    ORDER BY n.updated_date DESC
  `, [tagId, userId]);
  return rows;
};

module.exports = {
  createTag,
  getAllTags,
  getTagById,
  updateTag,
  deleteTag,
  addTagToNote,
  removeTagFromNote,
  getNoteTags,
  getNotesByTag
};