const express = require('express');
const router = express.Router();
const { createNoteController, getAllNotesController, getAllNotesFromProjectController, getNoteByIdController, updateNoteController, deleteNoteController, getNoteAuthorController } = require('../controllers/noteController');
const { registerUser, loginUser, getUserProfile } = require('../controllers/userController');
const { protect, authorizeNoteOwner, authorizeNoteEdit, authorizeNoteDelete } = require('../middlewares/authMiddleware');
const { can } = require('../middlewares/rbacMiddleware');


// Route pour récupérer toutes les notes (protégée)
router.get('/', protect, getAllNotesController);

// Route pour récupérer une note par ID (protégée)
router.get('/note/:id', protect, authorizeNoteOwner, getNoteByIdController);

// Route pour créer une nouvelle note (Dev+ seulement)
router.post('/note', protect, can('create_notes'), createNoteController);

// Route pour mettre à jour une note par ID (protégée) - Dev+ peuvent modifier leurs notes, Admin/Manager toutes
router.put('/note/:id', protect, authorizeNoteEdit, updateNoteController);

// Route pour supprimer une note par ID (protégée) - Seuls les propriétaires et admins peuvent supprimer
router.delete('/note/:id', protect, authorizeNoteDelete, deleteNoteController);

// Route pour récupérer toutes les notes d'un projet
router.get('/project/:projectId', protect, getAllNotesFromProjectController);  // GET /api/notes/project/:projectId

// Route pour récupérer l'auteur d'une note
router.get('/note/:id/author', protect, getNoteAuthorController);  // GET /api/notes/note/:id/author

module.exports = router;
