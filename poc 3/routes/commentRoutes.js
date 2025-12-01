const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
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
router.post('/note/:noteId', createCommentController);          // POST /api/comments/note/1
router.get('/note/:noteId', getCommentsController);             // GET /api/comments/note/1
router.get('/recent', getRecentCommentsController);             // GET /api/comments/recent
router.get('/:commentId', getCommentController);                // GET /api/comments/123
router.put('/:commentId', updateCommentController);             // PUT /api/comments/123
router.delete('/:commentId', deleteCommentController);          // DELETE /api/comments/123

module.exports = router;