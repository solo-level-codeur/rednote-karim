const express = require('express');
const router = express.Router();
const { registerUser, loginUser, logoutUser, getUserProfile, getUsersAdmin, updateUserRoleAdmin, deleteUserAdmin, getUserProfileWithStatsController, updateUserProfileController } = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');
const { can } = require('../middlewares/rbacMiddleware'); // NOUVEAU RBAC

router.post('/register', protect, can('manage_users'), registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/profile', protect, getUserProfile);

// Routes de profil étendues
router.get('/profile/stats', protect, getUserProfileWithStatsController);
router.put('/profile', protect, updateUserProfileController);

// Route RBAC pour frontend
router.get('/check-permission/:permission', protect, async (req, res) => {
  const { permission } = req.params;
  const { hasPermission } = require('../models/rbac');
  
  try {
    const hasAccess = await hasPermission(req.user.id, permission);
    res.json({ hasPermission: hasAccess });
  } catch (error) {
    res.status(500).json({ hasPermission: false, error: 'Erreur serveur' });
  }
});

// Routes d'administration 
router.get('/admin/users', protect, can('view_users'), getUsersAdmin); // Manager + Admin peuvent voir
router.put('/admin/users/role', protect, can('manage_users'), updateUserRoleAdmin); // Admin seulement
router.delete('/admin/users/:userId', protect, can('manage_users'), deleteUserAdmin); // Admin seulement

module.exports = router;