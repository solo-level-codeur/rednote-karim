const db = require('../config/db');

// Créer un nouveau projet
const createProject = async (name, description, userId) => {
  const [result] = await db.query(
    'INSERT INTO projects (name, description, creation_date, id_owner) VALUES (?, ?, CURDATE(), ?)',
    [name, description, userId]
  );
  return result.insertId;
};

// Obtenir tous les projets d'un utilisateur
const getAllProjects = async (userId) => {
  const [rows] = await db.query('SELECT * FROM projects WHERE id_owner = ?', [userId]);
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

module.exports = {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject
};
