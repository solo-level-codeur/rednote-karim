// Setup global pour les tests
const request = require('supertest');

// Mock de la base de données
const mockDb = {
  query: jest.fn()
};

// Mock du module de base de données
jest.mock('../../config/db', () => mockDb);

// Helper pour créer un token JWT valide (mock)
const createMockToken = (userId = 1, roleId = 3) => {
  return `mock-jwt-token-user-${userId}-role-${roleId}`;
};

// Helper pour créer une requête authentifiée
const authenticatedRequest = (app, token) => {
  return request(app).set('Cookie', [`authToken=${token}`]);
};

// Reset des mocks avant chaque test
beforeEach(() => {
  jest.clearAllMocks();
});

module.exports = {
  mockDb,
  createMockToken,
  authenticatedRequest
};