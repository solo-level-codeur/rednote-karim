const { hasPermission } = require('../models/rbac');

// =====================================
// MIDDLEWARE RBAC - VERSION ULTRA-MINIMALISTE
// =====================================

/**
 * SEUL middleware nécessaire - Version la plus simple possible
 * @param {string} permission - Permission requise
 * @returns {Function} - Middleware Express
 */
const can = (permission) => {
  return async (req, res, next) => {
    const route = `${req.method} ${req.route?.path || req.originalUrl}`;
    console.log(`🔐 RBAC CHECK - Route: ${route}`);
    console.log(`🔐 RBAC CHECK - User ${req.user.id} (${req.user.email}) checking '${permission}'`);
    
    try {
      const allowed = await hasPermission(req.user.id, permission);
      console.log(`🔐 RBAC RESULT - ${allowed ? '✅ AUTORISÉ' : '❌ REFUSÉ'} pour '${permission}'`);
      
      if (allowed) {
        next();
      } else {
        console.log(`🚫 RBAC DENIED - User ${req.user.email} n'a pas '${permission}' pour ${route}`);
        res.status(403).json({
          error: `Permission ${permission} requise`,
          user: req.user.email,
          route: route
        });
      }
    } catch (error) {
      console.error(`💥 RBAC ERROR - Erreur vérification permission '${permission}':`, error);
      res.status(500).json({error: 'Erreur serveur RBAC'});
    }
  };
};

module.exports = { can };