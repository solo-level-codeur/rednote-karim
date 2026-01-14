const express = require('express');
const router = express.Router();
const { protect, authorizeProjectDelete } = require('../middlewares/authMiddleware');
const { checkPermission } = require('../middlewares/permissionMiddleware');
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
router.post('/', checkPermission('CREATE_PROJECTS'), createProjectController);           // POST /api/projects - Manager seulement
router.get('/', getAllProjectsController);                                                // GET /api/projects - Tous les rôles  
router.get('/:id', getProjectByIdController);                                            // GET /api/projects/:id - Selon permissions
router.put('/:id', updateProjectController);                                             // PUT /api/projects/:id - Propriétaire ou Manager
router.delete('/:id', authorizeProjectDelete, deleteProjectController);                  // DELETE /api/projects/:id - Propriétaire ou Admin SEULEMENT

// Routes pour la gestion des membres de projet
router.get('/:projectId/members', getProjectMembersController);                                                     // GET /api/projects/:projectId/members
router.post('/:projectId/members', checkPermission('MANAGE_PROJECT_MEMBERS'), addProjectMemberController);         // POST /api/projects/:projectId/members - Manager seulement
router.delete('/:projectId/members/:userId', checkPermission('MANAGE_PROJECT_MEMBERS'), removeProjectMemberController); // DELETE /api/projects/:projectId/members/:userId - Manager seulement
router.put('/:projectId/members/:userId', checkPermission('MANAGE_PROJECT_MEMBERS'), updateMemberRoleController);       // PUT /api/projects/:projectId/members/:userId - Manager seulement

module.exports = router;
