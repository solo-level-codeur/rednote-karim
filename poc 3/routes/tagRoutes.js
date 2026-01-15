const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { can } = require('../middlewares/rbacMiddleware'); // NOUVEAU RBAC
const {
  createTagController,
  getAllTagsController,
  getTagByIdController,
  updateTagController,
  deleteTagController,
  addTagToNoteController,
  removeTagFromNoteController,
  getNoteTagsController,
  getNotesByTagController
} = require('../controllers/tagController');

// Toutes les routes tags nécessitent une authentification
router.use(protect);

// Routes CRUD pour les tags
router.post('/', can('manage_tags'), createTagController);              // POST /api/tags
router.get('/', getAllTagsController);              // GET /api/tags (tous peuvent voir)
router.get('/:id', getTagByIdController);           // GET /api/tags/:id (tous peuvent voir)
router.put('/:id', can('manage_tags'), updateTagController);            // PUT /api/tags/:id
router.delete('/:id', can('manage_tags'), deleteTagController);         // DELETE /api/tags/:id

// Routes pour associer tags et notes (Dev+ seulement)
router.post('/note/:noteId/tag/:tagId', can('edit_notes'), addTagToNoteController);     // POST /api/tags/note/1/tag/2
router.delete('/note/:noteId/tag/:tagId', can('edit_notes'), removeTagFromNoteController); // DELETE /api/tags/note/1/tag/2

// Routes pour récupérer des associations
router.get('/note/:noteId', getNoteTagsController);     // GET /api/tags/note/1
router.get('/:tagId/notes', getNotesByTagController);   // GET /api/tags/2/notes

module.exports = router;