const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile, getUsersAdmin, updateUserRoleAdmin, deleteUserAdmin, getUserProfileWithStatsController, updateUserProfileController } = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);

// Routes de profil étendues
router.get('/profile/stats', protect, getUserProfileWithStatsController);
router.put('/profile', protect, updateUserProfileController);

// Routes d'administration (nécessitent authentification + rôle admin)
router.get('/admin/users', protect, getUsersAdmin);
router.put('/admin/users/role', protect, updateUserRoleAdmin);
router.delete('/admin/users/:userId', protect, deleteUserAdmin);

module.exports = router;