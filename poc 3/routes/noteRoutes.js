const express = require('express');
const router = express.Router();
const { createNoteController, getAllNotesController, getNoteByIdController, updateNoteController, deleteNoteController } = require('../controllers/noteController');
const { registerUser, loginUser, getUserProfile } = require('../controllers/userController');
const { protect, authorizeNoteOwner } = require('../middlewares/authMiddleware');

// Routes utilisateur
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);

// Route pour récupérer toutes les notes (protégée)
router.get('/', protect, getAllNotesController);

// Route pour récupérer une note par ID (protégée)
router.get('/note/:id', protect, authorizeNoteOwner, getNoteByIdController);

// Route pour créer une nouvelle note (protégée)
router.post('/note', protect, createNoteController);

// Route pour mettre à jour une note par ID (protégée)
router.put('/note/:id', protect, authorizeNoteOwner, updateNoteController);

// Route pour supprimer une note par ID (protégée)
router.delete('/note/:id', protect, authorizeNoteOwner, deleteNoteController);

module.exports = router;
