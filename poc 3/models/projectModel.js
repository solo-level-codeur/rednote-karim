const db = require('../config/db');
// Obtenir toutes les notes d'un utilisateur
const getAllProject = async () => {
  const [rows] = await db.query('SELECT * FROM projets');
  return rows;
};
