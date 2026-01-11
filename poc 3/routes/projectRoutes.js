const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { 
  createProjectController, 
  getAllProjectsController, 
  getProjectByIdController, 
  updateProjectController, 
  deleteProjectController,
  addProjectMemberController,
  removeProjectMemberController,
  getProjectMembersController,
  updateMemberRoleController
} = require('../controllers/projectController');

// Toutes les routes projets nécessitent une authentification
router.use(protect);

// Routes CRUD pour les projets
router.post('/', createProjectController);           // POST /api/projects
router.get('/', getAllProjectsController);           // GET /api/projects  
router.get('/:id', getProjectByIdController);        // GET /api/projects/:id
router.put('/:id', updateProjectController);         // PUT /api/projects/:id
router.delete('/:id', deleteProjectController);      // DELETE /api/projects/:id

// Routes pour la gestion des membres de projet
router.get('/:projectId/members', getProjectMembersController);              // GET /api/projects/:projectId/members
router.post('/:projectId/members', addProjectMemberController);              // POST /api/projects/:projectId/members
router.delete('/:projectId/members/:userId', removeProjectMemberController); // DELETE /api/projects/:projectId/members/:userId
router.put('/:projectId/members/:userId', updateMemberRoleController);       // PUT /api/projects/:projectId/members/:userId

module.exports = router;
