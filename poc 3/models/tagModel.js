const db = require('../config/db');

// Créer un nouveau tag
const createTag = async (name, color = '#808080', userId) => {
  const [result] = await db.query(
    'INSERT INTO tags (tag_name) VALUES (?)',
    [name]
  );
  return result.insertId;
};

// Obtenir tous les tags
const getAllTags = async (userId) => {
  const [rows] = await db.query(
    'SELECT * FROM tags ORDER BY tag_name'
  );
  return rows;
};

// Obtenir un tag par ID
const getTagById = async (tagId, userId) => {
  const [rows] = await db.query(
    'SELECT * FROM tags WHERE tag_id = ?',
    [tagId]
  );
  return rows[0];
};

// Mettre à jour un tag
const updateTag = async (tagId, name, color, userId) => {
  const [result] = await db.query(
    'UPDATE tags SET tag_name = ? WHERE tag_id = ?',
    [name, tagId]
  );
  return result.affectedRows;
};

// Supprimer un tag
const deleteTag = async (tagId, userId) => {
  // D'abord supprimer les associations note-tag
  await db.query('DELETE FROM note_tags WHERE tag_id = ?', [tagId]);
  
  // Puis supprimer le tag
  const [result] = await db.query(
    'DELETE FROM tags WHERE tag_id = ?',
    [tagId]
  );
  return result.affectedRows;
};

// Ajouter un tag à une note
const addTagToNote = async (noteId, tagId) => {
  const [result] = await db.query(
    'INSERT IGNORE INTO note_tags (note_id, tag_id) VALUES (?, ?)',
    [noteId, tagId]
  );
  return result.affectedRows;
};

// Supprimer un tag d'une note
const removeTagFromNote = async (noteId, tagId) => {
  const [result] = await db.query(
    'DELETE FROM note_tags WHERE note_id = ? AND tag_id = ?',
    [noteId, tagId]
  );
  return result.affectedRows;
};

// Obtenir les tags d'une note
const getNoteTags = async (noteId) => {
  const [rows] = await db.query(`
    SELECT t.* FROM tags t 
    INNER JOIN note_tags nt ON t.tag_id = nt.tag_id 
    WHERE nt.note_id = ?
  `, [noteId]);
  return rows;
};

// Obtenir les notes avec un tag spécifique
const getNotesByTag = async (tagId, userId) => {
  const [rows] = await db.query(`
    SELECT n.*, p.project_name as project_name 
    FROM notes n 
    LEFT JOIN projects p ON n.project_id = p.project_id
    INNER JOIN note_tags nt ON n.note_id = nt.note_id 
    WHERE nt.tag_id = ? AND n.user_id = ?
    ORDER BY n.updated_at DESC
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