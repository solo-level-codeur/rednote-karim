const { createUser, findUserByEmail, matchPassword, getUserById, getAllUsers, updateUserRole, deleteUser, updateUserProfile, getUserProfileWithStats } = require('../models/userModel');
const jwt = require('jsonwebtoken');

// Inscription d'un nouvel utilisateur
const registerUser = async (req, res) => {
  const { firstname, lastname, email, password, telephone, description, roleId } = req.body;
  const finalRoleId = roleId || 3;
  const finalTelephone = telephone || '';
  const finalDescription = description || '';


  try {
    const userExists = await findUserByEmail(email);
    if (userExists) {
      return res.status(400).json({ message: 'Utilisateur déjà existant' });
    }

    const userId = await createUser(firstname, lastname, email, password, finalTelephone, finalDescription, finalRoleId);
    const token = generateToken(userId);

    res.status(201).json({
      id: userId,
      firstname,
      lastname,
      email,
      token,
    });
  } catch (error) {
    console.error('Erreur Register:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }
    
    res.status(500).json({ 
      message: 'Erreur lors de l\'inscription',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
};

// Connexion d'un utilisateur
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await findUserByEmail(email);
    if (user && (await matchPassword(password, user.password))) {
      const token = generateToken(user.user_id);
      res.json({
        id: user.user_id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        role_id: user.role_id,
        token,
      });
    } else {
      res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }
  } catch (error) {
    console.error('Erreur Login:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la connexion',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
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
      id: user.user_id,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      telephone: user.telephone,
      description: user.description
    });
  } catch (error) {
    console.error('Erreur getUserProfile:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la récupération du profil',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
};

// ADMIN - Obtenir tous les utilisateurs
const getUsersAdmin = async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json({
      success: true,
      users: users
    });
  } catch (error) {
    console.error('Erreur getUsersAdmin:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la récupération des utilisateurs',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
};

// ADMIN - Mettre à jour le rôle d'un utilisateur
const updateUserRoleAdmin = async (req, res) => {
  try {
    const { userId, roleId } = req.body;

    const success = await updateUserRole(userId, roleId);
    if (success) {
      res.json({ 
        success: true, 
        message: 'Rôle utilisateur mis à jour avec succès' 
      });
    } else {
      res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
  } catch (error) {
    console.error('Erreur updateUserRole:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la mise à jour du rôle',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
};

// ADMIN - Supprimer un utilisateur
const deleteUserAdmin = async (req, res) => {
  try {
    const { userId } = req.params;

    // Empêcher de se supprimer soi-même
    if (parseInt(userId) === req.user.id) {
      return res.status(400).json({ message: 'Impossible de supprimer votre propre compte' });
    }

    const success = await deleteUser(userId);
    if (success) {
      res.json({ 
        success: true, 
        message: 'Utilisateur supprimé avec succès' 
      });
    } else {
      res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
  } catch (error) {
    console.error('Erreur deleteUser:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la suppression',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
};

// Générer un token JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// Obtenir le profil complet avec statistiques
const getUserProfileWithStatsController = async (req, res) => {
  try {
    const userProfile = await getUserProfileWithStats(req.user.id);
    if (!userProfile) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    res.json(userProfile);
  } catch (error) {
    console.error('Erreur getUserProfileWithStats:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la récupération du profil complet',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
};

// Mettre à jour le profil utilisateur
const updateUserProfileController = async (req, res) => {
  try {
    const { firstname, lastname, email, telephone, description } = req.body;
    
    // Vérifier que l'email n'est pas déjà utilisé par un autre utilisateur
    if (email) {
      const existingUser = await findUserByEmail(email);
      if (existingUser && existingUser.user_id !== req.user.id) {
        return res.status(400).json({ message: 'Cet email est déjà utilisé par un autre utilisateur' });
      }
    }
    
    const profileData = {
      firstname: firstname || null,
      lastname: lastname || null,
      email: email || null,
      telephone: telephone || null,
      description: description || null
    };
    
    const success = await updateUserProfile(req.user.id, profileData);
    
    if (success) {
      // Récupérer le profil mis à jour
      const updatedProfile = await getUserProfileWithStats(req.user.id);
      res.json({
        success: true,
        message: 'Profil mis à jour avec succès',
        user: updatedProfile
      });
    } else {
      res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
  } catch (error) {
    console.error('Erreur updateUserProfile:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la mise à jour du profil',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
};

module.exports = { 
  registerUser, 
  loginUser, 
  getUserProfile,
  getUsersAdmin,
  updateUserRoleAdmin,
  deleteUserAdmin,
  getUserProfileWithStatsController,
  updateUserProfileController
};
