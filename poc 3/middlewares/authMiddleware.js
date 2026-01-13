const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// Middleware pour vérifier le token JWT
const protect = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Non autorisé, token invalide' });
    }
  } else {
    res.status(401).json({ message: 'Non autorisé, pas de token' });
  }
};

// Middleware pour vérifier si l'utilisateur est le créateur de la note
const authorizeNoteOwner = async (req, res, next) => {
  const noteId = req.params.id;
  const userId = req.user.id;

  try {
    const [rows] = await pool.query('SELECT user_id FROM notes WHERE note_id = ?', [noteId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Note non trouvée' });
    }
    if (rows[0].user_id !== userId) {
      return res.status(403).json({ message: 'Accès refusé, vous n\'êtes pas le créateur de cette note' });
    }
    next();
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'autorisation :', error);
    res.status(500).json({ message: 'Erreur du serveur' });
  }
};

module.exports = { protect, authorizeNoteOwner };
