const db = require('../config/db');
const bcrypt = require('bcrypt');

const createUser = async (firstname, lastname, email, password, telephone, description, roleId = 1) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.query(
        'INSERT INTO users (firstname, lastname, email, password, telephone, description, role_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [firstname, lastname, email, hashedPassword, telephone, description, roleId]
      );
      return result.insertId;
    };

const findUserByEmail = async (email) => {
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0];
      };

const getUserById = async (userId) => {
    const [rows] = await db.query(
        'SELECT user_id, firstname, lastname, email, telephone, description, role_id FROM users WHERE user_id = ?',
        [userId]
    );
    return rows[0];
};
    
// Vérifier le mot de passe
const matchPassword = async (enteredPassword, hashedPassword) => {
    return await bcrypt.compare(enteredPassword, hashedPassword);
};


// Récupérer tous les utilisateurs (pour admin)
const getAllUsers = async () => {
    const [rows] = await db.query(
        'SELECT u.user_id, u.firstname, u.lastname, u.email, u.telephone, u.description, u.created_at, r.role_name FROM users u LEFT JOIN roles r ON u.role_id = r.role_id ORDER BY u.user_id DESC'
    );
    return rows;
};

// Mettre à jour le rôle d'un utilisateur
const updateUserRole = async (userId, roleId) => {
    const [result] = await db.query(
        'UPDATE users SET role_id = ? WHERE user_id = ?',
        [roleId, userId]
    );
    return result.affectedRows > 0;
};

// Supprimer un utilisateur
const deleteUser = async (userId) => {
    const [result] = await db.query('DELETE FROM users WHERE user_id = ?', [userId]);
    return result.affectedRows > 0;
};

// Mettre à jour le profil utilisateur
const updateUserProfile = async (userId, profileData) => {
    const { firstname, lastname, email, telephone, description } = profileData;
    
    const [result] = await db.query(
        'UPDATE users SET firstname = ?, lastname = ?, email = ?, telephone = ?, description = ? WHERE user_id = ?',
        [firstname, lastname, email, telephone, description, userId]
    );
    return result.affectedRows > 0;
};

// Helper pour récupérer le profil utilisateur de base avec rôle
const getUserBasicProfile = async (userId) => {
    const [rows] = await db.query(`
        SELECT 
            users.user_id, 
            users.firstname, 
            users.lastname, 
            users.email, 
            users.telephone, 
            users.description,
            roles.role_name as role
        FROM users 
        LEFT JOIN roles ON users.role_id = roles.role_id 
        WHERE users.user_id = ?
    `, [userId]);
    
    return rows[0] || null;
};

// Helper pour récupérer toutes les stats en une seule requête
const getUserStats = async (userId) => {
    try {
        const [statsRows] = await db.query(`
            SELECT 
                (SELECT COUNT(*) FROM notes WHERE user_id = ?) as total_notes,
                (SELECT COUNT(*) FROM project_members WHERE user_id = ?) as total_projects,
                (SELECT COUNT(*) FROM comments WHERE user_id = ?) as total_comments,
                (SELECT COUNT(*) FROM note_shares WHERE user_id = ?) as shared_notes
        `, [userId, userId, userId, userId]);
        
        return statsRows[0] || {
            total_notes: 0,
            total_projects: 0, 
            total_comments: 0,
            shared_notes: 0
        };
    } catch (error) {
        // Fallback si une table n'existe pas
        return {
            total_notes: 0,
            total_projects: 0,
            total_comments: 0, 
            shared_notes: 0
        };
    }
};

// Obtenir le profil complet d'un utilisateur avec ses statistiques
const getUserProfileWithStats = async (userId) => {
    try {
        // Récupérer profil et stats en parallèle
        const [profile, stats] = await Promise.all([
            getUserBasicProfile(userId),
            getUserStats(userId)
        ]);
        
        if (!profile) return null;
        
        return {
            ...profile,
            stats
        };
    } catch (error) {
        console.error('Erreur getUserProfileWithStats:', error.message);
        return null;
    }
};

// ===== NOUVELLES FONCTIONS DE GESTION DES RÔLES =====

// Vérifier si un utilisateur a un rôle spécifique
const hasRole = async (userId, roleName) => {
    const [rows] = await db.query(`
        SELECT 1 
        FROM users 
        INNER JOIN roles ON users.role_id = roles.role_id  
        WHERE users.user_id = ? AND roles.role_name = ?
    `, [userId, roleName]);
    return rows.length > 0;
};

// Récupérer le rôle d'un utilisateur
const getUserRole = async (userId) => {
    const [rows] = await db.query(`
        SELECT roles.role_name 
        FROM users 
        INNER JOIN roles ON users.role_id = roles.role_id
        WHERE users.user_id = ?
    `, [userId]);
    return rows[0]?.role_name;
};

// Récupérer tous les rôles disponibles
const getAllRoles = async () => {
    const [rows] = await db.query('SELECT * FROM roles ORDER BY role_name ASC');
    return rows;
};

// Créer un nouveau rôle
const createRole = async (roleName) => {
    try {
        const [result] = await db.query(
            'INSERT INTO roles (role_name) VALUES (?)',
            [roleName]
        );
        return result.insertId;
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            throw new Error('Ce rôle existe déjà');
        }
        throw error;
    }
};

// Supprimer un rôle
const deleteRole = async (roleId) => {
    // Vérifier qu'aucun utilisateur n'a ce rôle
    const [userCheck] = await db.query(
        'SELECT COUNT(*) as count FROM users WHERE role_id = ?',
        [roleId]
    );
    
    if (userCheck[0].count > 0) {
        throw new Error('Impossible de supprimer un rôle assigné à des utilisateurs');
    }
    
    const [result] = await db.query('DELETE FROM roles WHERE role_id = ?', [roleId]);
    return result.affectedRows > 0;
};

// ===== GESTION DES COMPÉTENCES UTILISATEUR =====

// Ajouter une compétence à un utilisateur
const addUserSkill = async (userId, skillId) => {
    const [result] = await db.query(
        'INSERT IGNORE INTO user_skills (skill_id, user_id) VALUES (?, ?)',
        [skillId, userId]
    );
    return result.affectedRows > 0;
};

// Supprimer une compétence d'un utilisateur
const removeUserSkill = async (userId, skillId) => {
    const [result] = await db.query(
        'DELETE FROM user_skills WHERE skill_id = ? AND user_id = ?',
        [skillId, userId]
    );
    return result.affectedRows > 0;
};

// Récupérer les compétences d'un utilisateur
const getUserSkills = async (userId) => {
    const [rows] = await db.query(`
        SELECT 
            skills.skill_id, 
            skills.skill_name 
        FROM user_skills 
        INNER JOIN skills ON user_skills.skill_id = skills.skill_id
        WHERE user_skills.user_id = ?
        ORDER BY skills.skill_name ASC
    `, [userId]);
    return rows;
};

module.exports = { 
    // Fonctions de base
    createUser, 
    findUserByEmail, 
    matchPassword, 
    getUserById, 
    getAllUsers,
    updateUserRole,
    deleteUser,
    updateUserProfile,
    getUserProfileWithStats,
    
    // Gestion des rôles
    hasRole,
    getUserRole,
    getAllRoles,
    createRole,
    deleteRole,
    
    // Gestion des compétences
    addUserSkill,
    removeUserSkill,
    getUserSkills
};
