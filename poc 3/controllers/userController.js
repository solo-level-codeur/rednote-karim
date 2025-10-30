const { createUser, findUserByEmail, matchPassword, getUserById } = require('../models/userModel');
const jwt = require('jsonwebtoken');

// Inscription d'un nouvel utilisateur
const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const userExists = await findUserByEmail(email);
    if (userExists) {
      return res.status(400).json({ message: 'Utilisateur déjà existant' });
    }

    const userId = await createUser(username, email, password);
    const token = generateToken(userId);

    res.status(201).json({
      id: userId,
      username,
      email,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur du serveur' });
  }
};

// Connexion d'un utilisateur
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await findUserByEmail(email);
    if (user && (await matchPassword(password, user.password))) {
      const token = generateToken(user.id);
      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        token,
      });
    } else {
      res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erreur du serveur' });
  }
};

// Obtenir les informations de l'utilisateur connecté
const getUserProfile = async (req, res) => {
  try {
    const user = await getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    res.json({
      id: user.id,
      username: user.username,
      email: user.email
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du profil utilisateur:', error);
    res.status(500).json({ message: 'Erreur du serveur' });
  }
};

// Générer un token JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

module.exports = { registerUser, loginUser, getUserProfile };
