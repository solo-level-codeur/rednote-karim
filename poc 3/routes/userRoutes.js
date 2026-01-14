const express = require('express');
const router = express.Router();
const { registerUser, loginUser, logoutUser, getUserProfile, getUsersAdmin, updateUserRoleAdmin, deleteUserAdmin, getUserProfileWithStatsController, updateUserProfileController } = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');
const { requireAdminAccess } = require('../middlewares/permissionMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/profile', protect, getUserProfile);

// Routes de profil étendues
router.get('/profile/stats', protect, getUserProfileWithStatsController);
router.put('/profile', protect, updateUserProfileController);

// Routes d'administration (nécessitent authentification + rôle admin)
router.get('/admin/users', protect, requireAdminAccess, getUsersAdmin);
router.put('/admin/users/role', protect, requireAdminAccess, updateUserRoleAdmin);
router.delete('/admin/users/:userId', protect, requireAdminAccess, deleteUserAdmin);

module.exports = router;