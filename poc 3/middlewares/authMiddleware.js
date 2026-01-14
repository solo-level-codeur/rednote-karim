const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// Middleware pour vérifier le token JWT et récupérer les informations de rôle
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Récupérer les informations utilisateur avec le rôle
      const [rows] = await pool.query(
        'SELECT user_id, firstname, lastname, email, role_id FROM users WHERE user_id = ?',
        [decoded.id]
      );
      
      if (rows.length === 0) {
        return res.status(401).json({ message: 'Utilisateur non trouvé' });
      }
      
      req.user = {
        id: rows[0].user_id,
        firstname: rows[0].firstname,
        lastname: rows[0].lastname,
        email: rows[0].email,
        role_id: rows[0].role_id
      };
      
      next();
    } catch (error) {
      console.error('Erreur d\'authentification:', error);
      res.status(401).json({ message: 'Non autorisé, token invalide' });
    }
  } else {
    res.status(401).json({ message: 'Non autorisé, pas de token' });
  }
};

// Middleware pour vérifier l'accès en lecture à une note (propriétaire ou membre du projet)
const authorizeNoteOwner = async (req, res, next) => {
  const noteId = req.params.id;
  const userId = req.user.id;
  const userRole = req.user.role_id;
  const { ROLES } = require('./permissionMiddleware');

  try {
    console.log(`DEBUG authorizeNoteOwner - User: ${req.user.email}, Role: ${userRole}, Note ID: ${noteId}`);
    
    const [rows] = await pool.query(
      'SELECT user_id, project_id FROM notes WHERE note_id = ?', 
      [noteId]
    );
    
    if (rows.length === 0) {
      console.log(`DEBUG - Note ${noteId} not found in database`);
      return res.status(404).json({ message: 'Note non trouvée' });
    }

    const note = rows[0];

    // 1. Admin peut toujours voir
    if (userRole === ROLES.ADMIN) {
      return next();
    }

    // 2. Propriétaire de la note peut toujours voir
    if (note.user_id === userId) {
      return next();
    }

    // 3. Vérifier si l'utilisateur est membre du projet de la note
    if (note.project_id) {
      const [projectAccess] = await pool.query(`
        SELECT 1 FROM projects p
        LEFT JOIN project_members pm ON p.project_id = pm.project_id
        WHERE p.project_id = ? AND (p.user_id = ? OR pm.user_id = ?)
        LIMIT 1
      `, [note.project_id, userId, userId]);

      if (projectAccess.length > 0) {
        return next();
      }
    }

    return res.status(403).json({ message: 'Accès refusé, vous n\'êtes pas le créateur de cette note' });
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'autorisation :', error);
    res.status(500).json({ message: 'Erreur du serveur' });
  }
};

// Middleware pour vérifier les permissions de modification de notes basé sur les rôles et projets
const authorizeNoteEdit = async (req, res, next) => {
  const noteId = req.params.id;
  const userId = req.user.id;
  const userRole = req.user.role_id;
  const { ROLES } = require('./permissionMiddleware');

  try {
    // DEBUG: Log des informations utilisateur
    console.log(`DEBUG authorizeNoteEdit - User: ${req.user.email}, Role: ${userRole}, Note ID: ${noteId}`);
    
    // Viewer ne peut jamais modifier
    if (userRole === ROLES.VIEWER) {
      console.log('DEBUG - Access denied: VIEWER role');
      return res.status(403).json({ 
        message: 'Accès refusé, les Viewers ne peuvent pas modifier les notes' 
      });
    }

    // Récupérer la note avec ses informations de projet
    const [rows] = await pool.query(
      'SELECT user_id, project_id FROM notes WHERE note_id = ?', 
      [noteId]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Note non trouvée' });
    }

    const note = rows[0];

    // 1. Admin peut toujours modifier
    if (userRole === ROLES.ADMIN) {
      console.log('DEBUG - Admin access granted for note edit');
      return next();
    }

    // 2. Propriétaire de la note peut toujours modifier
    if (note.user_id === userId) {
      return next();
    }

    // 3. Vérifier si l'utilisateur est membre du projet de la note
    if (note.project_id) {
      const [projectAccess] = await pool.query(`
        SELECT 1 FROM projects p
        LEFT JOIN project_members pm ON p.project_id = pm.project_id
        WHERE p.project_id = ? AND (p.user_id = ? OR pm.user_id = ?)
        LIMIT 1
      `, [note.project_id, userId, userId]);

      // Si membre du projet et role Manager/Developer, peut modifier
      if (projectAccess.length > 0 && [ROLES.MANAGER, ROLES.DEVELOPER].includes(userRole)) {
        return next();
      }
    }

    // Accès refusé
    return res.status(403).json({ 
      message: 'Accès refusé, vous n\'avez pas les permissions pour modifier cette note' 
    });
    
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'autorisation :', error);
    res.status(500).json({ message: 'Erreur du serveur' });
  }
};

module.exports = { protect, authorizeNoteOwner, authorizeNoteEdit };
