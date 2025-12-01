const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { 
  createProjectController, 
  getAllProjectsController, 
  getProjectByIdController, 
  updateProjectController, 
  deleteProjectController 
} = require('../controllers/projectController');

// Toutes les routes projets nécessitent une authentification
router.use(protect);

// Routes CRUD pour les projets
router.post('/', createProjectController);           // POST /api/projects
router.get('/', getAllProjectsController);           // GET /api/projects  
router.get('/:id', getProjectByIdController);        // GET /api/projects/:id
router.put('/:id', updateProjectController);         // PUT /api/projects/:id
router.delete('/:id', deleteProjectController);      // DELETE /api/projects/:id

module.exports = router;
