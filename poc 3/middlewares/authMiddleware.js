const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// Middleware pour vérifier le token JWT et récupérer les informations de rôle
const protect = async (req, res, next) => {
  let token;

  // Lire le token depuis les cookies httpOnly
  token = req.cookies.authToken;

  if (token) {
    try {
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

  console.log(`🔍 DEBUG - Note Access: User ${userId} (role ${userRole}) trying to access note ${noteId}`);

  try {
    
    const [rows] = await pool.query(
      'SELECT user_id, project_id FROM notes WHERE note_id = ?', 
      [noteId]
    );

    console.log(`🔍 DEBUG - Note query result:`, rows);
    
    if (rows.length === 0) {
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
      console.log(`🔍 DEBUG - Checking project ${note.project_id} access for user ${userId}`);
      
      const [projectAccess] = await pool.query(`
        SELECT 1 FROM projects p
        LEFT JOIN project_members pm ON p.project_id = pm.project_id
        WHERE p.project_id = ? AND (p.user_id = ? OR pm.user_id = ?)
        LIMIT 1
      `, [note.project_id, userId, userId]);

      console.log(`🔍 DEBUG - Project access query result:`, projectAccess);

      if (projectAccess.length > 0) {
        console.log(`✅ DEBUG - Project access granted`);
        return next();
      } else {
        console.log(`❌ DEBUG - Project access denied - user not owner or member`);
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

  console.log(`✏️ DEBUG - Note Edit: User ${userId} (role ${userRole}) trying to edit note ${noteId}`);

  try {
    
    // Viewer ne peut jamais modifier
    if (userRole === ROLES.VIEWER) {
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
    console.log(`✏️ DEBUG - Note belongs to user ${note.user_id}, current user is ${userId}`);

    // 1. Admin peut toujours modifier
    if (userRole === ROLES.ADMIN) {
      console.log(`✅ DEBUG - Edit access granted (Admin)`);
      return next();
    }

    // 2. Propriétaire de la note peut toujours modifier
    if (note.user_id === userId) {
      console.log(`✅ DEBUG - Edit access granted (Owner)`);
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
        console.log(`✅ DEBUG - Edit access granted (Project member with role ${userRole})`);
        return next();
      } else {
        console.log(`❌ DEBUG - Project access denied - not member or insufficient role`);
      }
    }

    // Accès refusé
    console.log(`❌ DEBUG - Edit access denied for note ${noteId}`);
    return res.status(403).json({ 
      message: 'Accès refusé, vous n\'avez pas les permissions pour modifier cette note' 
    });
    
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'autorisation :', error);
    res.status(500).json({ message: 'Erreur du serveur' });
  }
};

// Middleware pour vérifier les permissions de suppression de notes (propriétaire ou admin seulement)
const authorizeNoteDelete = async (req, res, next) => {
  const noteId = req.params.id;
  const userId = req.user.id;
  const userRole = req.user.role_id;
  const { ROLES } = require('./permissionMiddleware');

  console.log(`🗑️ DEBUG - Note Delete: User ${userId} (role ${userRole}) trying to delete note ${noteId}`);

  try {
    
    const [rows] = await pool.query(
      'SELECT user_id, project_id FROM notes WHERE note_id = ?', 
      [noteId]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Note non trouvée' });
    }

    const note = rows[0];
    console.log(`🗑️ DEBUG - Note to delete belongs to user ${note.user_id}, current user is ${userId}`);

    // 1. Admin peut toujours supprimer
    if (userRole === ROLES.ADMIN) {
      console.log(`✅ DEBUG - Delete access granted (Admin)`);
      return next();
    }

    // 2. SEULEMENT le propriétaire de la note peut la supprimer
    if (note.user_id === userId) {
      console.log(`✅ DEBUG - Delete access granted (Owner)`);
      return next();
    }

    // 3. Refuser l'accès à tous les autres (même les membres du projet)
    console.log(`❌ DEBUG - Delete access denied - only owner or admin can delete notes`);
    return res.status(403).json({ 
      message: 'Accès refusé, seul le propriétaire de la note peut la supprimer' 
    });
    
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'autorisation de suppression :', error);
    res.status(500).json({ message: 'Erreur du serveur' });
  }
};

// Middleware pour vérifier les permissions de suppression de projets (propriétaire ou admin seulement)
const authorizeProjectDelete = async (req, res, next) => {
  const projectId = req.params.id;
  const userId = req.user.id;
  const userRole = req.user.role_id;
  const { ROLES } = require('./permissionMiddleware');

  console.log(`🗑️ DEBUG - Project Delete: User ${userId} (role ${userRole}) trying to delete project ${projectId}`);

  try {
    
    const [rows] = await pool.query(
      'SELECT user_id FROM projects WHERE project_id = ?', 
      [projectId]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Projet non trouvé' });
    }

    const project = rows[0];
    console.log(`🗑️ DEBUG - Project to delete belongs to user ${project.user_id}, current user is ${userId}`);

    // 1. Admin peut toujours supprimer
    if (userRole === ROLES.ADMIN) {
      console.log(`✅ DEBUG - Delete access granted (Admin)`);
      return next();
    }

    // 2. SEULEMENT le propriétaire du projet peut le supprimer
    if (project.user_id === userId) {
      console.log(`✅ DEBUG - Delete access granted (Owner)`);
      return next();
    }

    // 3. Refuser l'accès à tous les autres (même les managers et membres du projet)
    console.log(`❌ DEBUG - Delete access denied - only owner or admin can delete projects`);
    return res.status(403).json({ 
      message: 'Accès refusé, seul le propriétaire du projet peut le supprimer' 
    });
    
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'autorisation de suppression du projet :', error);
    res.status(500).json({ message: 'Erreur du serveur' });
  }
};

module.exports = { protect, authorizeNoteOwner, authorizeNoteEdit, authorizeNoteDelete, authorizeProjectDelete };
