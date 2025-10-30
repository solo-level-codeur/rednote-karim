const express = require('express');
const router = express.Router();
const { getAllprojectsController} = require('../controllers/projectController');
const { registerUser, loginUser, getUserProfile } = require('../controllers/userController');
const { protect, authorizeprojectOwner } = require('../middlewares/authMiddleware');

// Routes utilisateur
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);

// Route pour récupérer toutes les projectss (protégée)
router.get('/', protect, getAllprojectsController);

// Route pour récupérer une project par ID (protégée)
router.get('/project/:id', protect, authorizeprojectOwner, getprojectByIdController);

// Route pour créer une nouvelle project (protégée)
router.post('/project', protect, createprojectController);

// Route pour mettre à jour une project par ID (protégée)
router.put('/project/:id', protect, authorizeprojectOwner, updateprojectController);

// Route pour supprimer une project par ID (protégée)
router.delete('/project/:id', protect, authorizeprojectOwner, deleteprojectController);

module.exports = router;
