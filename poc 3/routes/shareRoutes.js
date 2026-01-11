const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
  shareNoteController,
  unshareNoteController,
  getSharedNotesController,
  getNoteSharesController,
  updateSharePermissionController,
  getAllAccessibleNotesController
} = require('../controllers/shareController');

// Toutes les routes de partage nécessitent une authentification
router.use(protect);

// Routes pour partager des notes
router.post('/note/:noteId', shareNoteController);                    // POST /api/share/note/1
router.delete('/note/:noteId/user/:userId', unshareNoteController);   // DELETE /api/share/note/1/user/2
router.put('/note/:noteId/user/:userId', updateSharePermissionController); // PUT /api/share/note/1/user/2

// Routes pour récupérer des informations de partage
router.get('/notes', getSharedNotesController);              // GET /api/share/notes (notes partagées avec moi)
router.get('/note/:noteId', getNoteSharesController);        // GET /api/share/note/1 (qui a accès à cette note)
router.get('/accessible', getAllAccessibleNotesController);  // GET /api/share/accessible (toutes mes notes accessibles)
router.get('/accessible/project/:projectId', getAllAccessibleNotesController);  // GET /api/share/accessible/project/1 (notes accessibles pour un projet)

module.exports = router;