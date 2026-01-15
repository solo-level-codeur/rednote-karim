const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { can } = require('../middlewares/rbacMiddleware');
const {
  createCommentController,
  getCommentsController,
  getCommentController,
  updateCommentController,
  deleteCommentController,
  getRecentCommentsController
} = require('../controllers/commentController');

// Toutes les routes de commentaires nécessitent une authentification
router.use(protect);

// Routes pour les commentaires
router.post('/note/:noteId', can('comment_notes'), createCommentController);          // POST /api/comments/note/1
router.get('/note/:noteId', getCommentsController);             // GET /api/comments/note/1 (lecture libre)
router.get('/recent', getRecentCommentsController);             // GET /api/comments/recent (lecture libre)
router.get('/:commentId', getCommentController);                // GET /api/comments/123 (lecture libre)
router.put('/:commentId', can('comment_notes'), updateCommentController);             // PUT /api/comments/123
router.delete('/:commentId', can('comment_notes'), deleteCommentController);          // DELETE /api/comments/123

module.exports = router;