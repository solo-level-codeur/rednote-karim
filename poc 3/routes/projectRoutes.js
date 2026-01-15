const express = require('express');
const router = express.Router();
const { protect, authorizeProjectDelete } = require('../middlewares/authMiddleware');
const { can } = require('../middlewares/rbacMiddleware'); // NOUVEAU RBAC
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
router.post('/', can('manage_projects'), createProjectController);           // POST /api/projects
router.get('/', can('view_projects'), getAllProjectsController);                                                // GET /api/projects - Authentifié  
router.get('/:id', can('view_projects'), getProjectByIdController);                                            // GET /api/projects/:id - Authentifié
router.put('/:id', can('manage_projects'), updateProjectController);                      // PUT /api/projects/:id - Manager seulement
router.delete('/:id', authorizeProjectDelete, deleteProjectController);                  // DELETE /api/projects/:id - Propriétaire ou Admin SEULEMENT

// Routes pour la gestion des membres de projet
router.get('/:projectId/members', can('view_projects'), getProjectMembersController);                                                     // GET /api/projects/:projectId/members
router.post('/:projectId/members', can('manage_project_members'), addProjectMemberController);         // POST /api/projects/:projectId/members
router.delete('/:projectId/members/:userId', can('manage_project_members'), removeProjectMemberController); // DELETE /api/projects/:projectId/members/:userId
router.put('/:projectId/members/:userId', can('manage_project_members'), updateMemberRoleController);       // PUT /api/projects/:projectId/members/:userId

module.exports = router;
