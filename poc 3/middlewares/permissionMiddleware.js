// Middleware de gestion des permissions basé sur les rôles
// Rôles: 1=Admin, 2=Manager, 3=Developer, 4=Viewer

const ROLES = {
  ADMIN: 1,
  MANAGER: 2, 
  DEVELOPER: 3,
  VIEWER: 4
};

const PERMISSIONS = {
  VIEW_INVITED_PROJECTS: [ROLES.ADMIN, ROLES.MANAGER, ROLES.DEVELOPER, ROLES.VIEWER],
  EDIT_NOTES: [ROLES.ADMIN, ROLES.MANAGER, ROLES.DEVELOPER],
  CREATE_PROJECTS: [ROLES.MANAGER],
  ADMIN_ACCESS: [ROLES.ADMIN, ROLES.MANAGER],
  MANAGE_PROJECT_MEMBERS: [ROLES.MANAGER],
  MANAGE_TAGS: [ROLES.ADMIN, ROLES.MANAGER, ROLES.DEVELOPER]
};

const checkPermission = (action) => {
  return (req, res, next) => {
    const userRole = req.user?.role_id;
    
    if (!userRole) {
      return res.status(401).json({ message: 'Utilisateur non authentifié' });
    }
    
    if (!PERMISSIONS[action]) {
      return res.status(500).json({ message: 'Permission inconnue' });
    }
    
    if (PERMISSIONS[action].includes(userRole)) {
      next();
    } else {
      const roleNames = {
        1: 'Admin',
        2: 'Manager', 
        3: 'Developer',
        4: 'Viewer'
      };
      
      res.status(403).json({ 
        message: 'Accès refusé',
        detail: `Action réservée aux rôles autorisés. Votre rôle: ${roleNames[userRole]}`
      });
    }
  };
};

// Helper pour vérifier si l'utilisateur peut gérer un projet spécifique
const canManageProject = (req, res, next) => {
  const userRole = req.user?.role_id;
  const userId = req.user?.id;
  
  // Admin et Manager peuvent gérer tous les projets
  if ([ROLES.ADMIN, ROLES.MANAGER].includes(userRole)) {
    req.isProjectManager = true;
    return next();
  }
  
  // Pour les autres, ils ne peuvent gérer que leurs propres projets
  req.isProjectManager = false;
  next();
};

// Helper pour vérifier l'accès global admin
const requireAdminAccess = checkPermission('ADMIN_ACCESS');

module.exports = {
  ROLES,
  PERMISSIONS,
  checkPermission,
  canManageProject,
  requireAdminAccess
};