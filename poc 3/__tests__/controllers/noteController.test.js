const request = require('supertest');
const express = require('express');
const { createNoteController } = require('../../controllers/noteController');
const { mockDb, createMockToken } = require('../helpers/testSetup');

// Création d'une app Express minimale pour les tests
const app = express();
app.use(express.json());

// Mock du middleware d'authentification
app.use('/api/notes/note', (req, res, next) => {
  // Simuler un utilisateur authentifié
  req.user = { id: 1 };
  next();
});

app.post('/api/notes/note', createNoteController);

describe('Note Controller - Création de Notes', () => {
  
  describe('POST /api/notes/note', () => {
    
    it('devrait créer une note personnelle avec succès (projectId = null)', async () => {
      // Mock de la réponse DB pour la création
      mockDb.query.mockResolvedValueOnce([{ insertId: 123 }]);
      
      const noteData = {
        title: 'Ma note personnelle',
        content: 'Contenu de test'
        // projectId non fourni (null par défaut)
      };
      
      const response = await request(app)
        .post('/api/notes/note')
        .send(noteData);
        
      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        id: 123,
        title: 'Ma note personnelle',
        content: 'Contenu de test',
        userId: 1,
        projectId: null
      });
      
      // Vérifier que la DB a été appelée correctement
      expect(mockDb.query).toHaveBeenCalledWith(
        'INSERT INTO notes (title, content, user_id, project_id) VALUES (?, ?, ?, ?)',
        ['Ma note personnelle', 'Contenu de test', 1, null]
      );
    });
    
    it('devrait créer une note de projet avec succès (projectId = 5)', async () => {
      // Mock de la réponse DB
      mockDb.query.mockResolvedValueOnce([{ insertId: 456 }]);
      
      const noteData = {
        title: 'Note de projet',
        content: 'Contenu projet',
        projectId: 5
      };
      
      const response = await request(app)
        .post('/api/notes/note')
        .send(noteData);
        
      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        id: 456,
        title: 'Note de projet',
        content: 'Contenu projet',
        userId: 1,
        projectId: 5
      });
    });
    
    it('devrait échouer si le titre est manquant', async () => {
      // Mock d'une erreur de validation
      mockDb.query.mockRejectedValueOnce(new Error('Title is required'));
      
      const noteData = {
        // title manquant
        content: 'Contenu sans titre'
      };
      
      const response = await request(app)
        .post('/api/notes/note')
        .send(noteData);
        
      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Erreur du serveur');
    });
    
    it('devrait échouer si le contenu est manquant', async () => {
      // Mock d'une erreur de validation
      mockDb.query.mockRejectedValueOnce(new Error('Content is required'));
      
      const noteData = {
        title: 'Titre sans contenu'
        // content manquant
      };
      
      const response = await request(app)
        .post('/api/notes/note')
        .send(noteData);
        
      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Erreur du serveur');
    });
    
  });
  
});