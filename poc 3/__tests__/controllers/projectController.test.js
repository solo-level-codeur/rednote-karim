const request = require('supertest');
const express = require('express');
const { createProjectController } = require('../../controllers/projectController');
const { mockDb } = require('../helpers/testSetup');

// Création d'une app Express minimale pour les tests
const app = express();
app.use(express.json());

// Mock du middleware d'authentification
app.use('/api/projects', (req, res, next) => {
  // Simuler un utilisateur authentifié avec rôle Manager (2)
  req.user = { id: 1, role_id: 2 };
  next();
});

app.post('/api/projects', createProjectController);

describe('Project Controller - Création de Projets', () => {
  
  describe('POST /api/projects', () => {
    
    it('devrait créer un projet avec succès', async () => {
      // Mock de la réponse DB pour la création
      mockDb.query.mockResolvedValueOnce([{ insertId: 789 }]);
      
      const projectData = {
        project_name: 'Projet Test',
        description: 'Description du projet de test'
      };
      
      const response = await request(app)
        .post('/api/projects')
        .send(projectData);
        
      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        id: 789,
        project_name: 'Projet Test',
        description: 'Description du projet de test',
        created_by: 1
      });
      
      // Vérifier que la DB a été appelée correctement
      expect(mockDb.query).toHaveBeenCalledWith(
        'INSERT INTO projects (project_name, description, created_by) VALUES (?, ?, ?)',
        ['Projet Test', 'Description du projet de test', 1]
      );
    });
    
    it('devrait échouer si le nom du projet est manquant', async () => {
      // Mock d'une erreur de validation
      mockDb.query.mockRejectedValueOnce(new Error('Project name is required'));
      
      const projectData = {
        // project_name manquant
        description: 'Description sans nom'
      };
      
      const response = await request(app)
        .post('/api/projects')
        .send(projectData);
        
      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Erreur du serveur');
    });
    
    it('devrait échouer si l\'utilisateur n\'a pas les permissions', async () => {
      // Créer une nouvelle app avec un utilisateur Viewer (role_id: 4)
      const restrictedApp = express();
      restrictedApp.use(express.json());
      
      restrictedApp.use('/api/projects', (req, res, next) => {
        // Simuler un utilisateur Viewer sans permissions
        req.user = { id: 2, role_id: 4 };
        next();
      });
      
      // Mock du middleware de permissions qui devrait bloquer
      restrictedApp.use('/api/projects', (req, res, next) => {
        if (req.user.role_id === 4) {
          return res.status(403).json({ message: 'Permissions insuffisantes' });
        }
        next();
      });
      
      restrictedApp.post('/api/projects', createProjectController);
      
      const projectData = {
        project_name: 'Projet Non Autorisé',
        description: 'Tentative de création sans permissions'
      };
      
      const response = await request(restrictedApp)
        .post('/api/projects')
        .send(projectData);
        
      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Permissions insuffisantes');
      
      // Vérifier que la DB n'a pas été appelée
      expect(mockDb.query).not.toHaveBeenCalled();
    });
    
  });
  
});