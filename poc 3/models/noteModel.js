const db = require('../config/db');

// Obtenir toutes les notes d'un utilisateur
const getAllNotes = async (userId) => {
  const [rows] = await db.query('SELECT * FROM notes WHERE user_id = ?', [userId]);
  return rows;
};

// Obtenir une note spécifique par son ID et l'ID de l'utilisateur
const getNoteById = async (id, userId) => {
  const [rows] = await db.query('SELECT * FROM notes WHERE id = ? AND user_id = ?', [id, userId]);
  return rows[0];
};

// Créer une nouvelle note
const createNote = async (title, content, userId) => {
  const [result] = await db.query('INSERT INTO notes (title, content, user_id) VALUES (?, ?, ?)', [title, content, userId]);
  return result.insertId;
};

// Mettre à jour une note
const updateNote = async (id, title, content, userId) => {
  const [result] = await db.query('UPDATE notes SET title = ?, content = ? WHERE id = ? AND user_id = ?', [title, content, id, userId]);
  return result.affectedRows;
};

// Supprimer une note
const deleteNote = async (id, userId) => {
  const [result] = await db.query('DELETE FROM notes WHERE id = ? AND user_id = ?', [id, userId]);
  return result.affectedRows;
};

module.exports = {
  getAllNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
};
