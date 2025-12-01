const { createUser, findUserByEmail, matchPassword, getUserById, getAllUsers, updateUserRole, deleteUser, updateUserProfile, getUserProfileWithStats } = require('../models/userModel');
const jwt = require('jsonwebtoken');

// Inscription d'un nouvel utilisateur
const registerUser = async (req, res) => {
  const { firstname, lastname, email, password, roleId = 3 } = req.body;

  try {
    const userExists = await findUserByEmail(email);
    if (userExists) {
      return res.status(400).json({ message: 'Utilisateur déjà existant' });
    }

    const userId = await createUser(firstname, lastname, email, password, roleId);
    const token = generateToken(userId);

    res.status(201).json({
      id: userId,
      firstname,
      lastname,
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
      const token = generateToken(user.id_users);
      res.json({
        id: user.id_users,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        role: user.id_roles === 1 ? 'Admin' : user.id_roles === 2 ? 'Manager' : user.id_roles === 3 ? 'Developer' : 'Viewer',
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
      id: user.id_users,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du profil utilisateur:', error);
    res.status(500).json({ message: 'Erreur du serveur' });
  }
};

// ADMIN - Obtenir tous les utilisateurs
const getUsersAdmin = async (req, res) => {
  try {
    // Vérifier que l'utilisateur est admin
    const user = await getUserById(req.user.id);
    if (!user || user.id_roles !== 1) {
      return res.status(403).json({ message: 'Accès refusé - Admin requis' });
    }

    const users = await getAllUsers();
    res.json({
      success: true,
      users: users
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    res.status(500).json({ message: 'Erreur du serveur' });
  }
};

// ADMIN - Mettre à jour le rôle d'un utilisateur
const updateUserRoleAdmin = async (req, res) => {
  try {
    const { userId, roleId } = req.body;

    // Vérifier que l'utilisateur est admin
    const user = await getUserById(req.user.id);
    if (!user || user.id_roles !== 1) {
      return res.status(403).json({ message: 'Accès refusé - Admin requis' });
    }

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
    console.error('Erreur lors de la mise à jour du rôle:', error);
    res.status(500).json({ message: 'Erreur du serveur' });
  }
};

// ADMIN - Supprimer un utilisateur
const deleteUserAdmin = async (req, res) => {
  try {
    const { userId } = req.params;

    // Vérifier que l'utilisateur est admin
    const user = await getUserById(req.user.id);
    if (!user || user.id_roles !== 1) {
      return res.status(403).json({ message: 'Accès refusé - Admin requis' });
    }

    // Empêcher l'admin de se supprimer lui-même
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
    console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    res.status(500).json({ message: 'Erreur du serveur' });
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
    console.error('Erreur lors de la récupération du profil avec stats:', error);
    res.status(500).json({ message: 'Erreur du serveur' });
  }
};

// Mettre à jour le profil utilisateur
const updateUserProfileController = async (req, res) => {
  try {
    const { firstname, lastname, email, bio, job_title, department, phone, avatar_url, linkedin_url, github_url } = req.body;
    
    // Vérifier que l'email n'est pas déjà utilisé par un autre utilisateur
    if (email) {
      const existingUser = await findUserByEmail(email);
      if (existingUser && existingUser.id_users !== req.user.id) {
        return res.status(400).json({ message: 'Cet email est déjà utilisé par un autre utilisateur' });
      }
    }
    
    const profileData = {
      firstname: firstname || null,
      lastname: lastname || null,
      email: email || null,
      bio: bio || null,
      job_title: job_title || null,
      department: department || null,
      phone: phone || null,
      avatar_url: avatar_url || null,
      linkedin_url: linkedin_url || null,
      github_url: github_url || null
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
    console.error('Erreur lors de la mise à jour du profil:', error);
    res.status(500).json({ message: 'Erreur du serveur' });
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
