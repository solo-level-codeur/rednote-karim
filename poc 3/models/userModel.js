const db = require('../config/db');
const bcrypt = require('bcryptjs');

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

// Créer un utilisateur avec rôle spécifique (pour l'admin)
const createUserWithRole = async (firstname, lastname, email, password, telephone, description, roleId) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.query(
        'INSERT INTO users (firstname, lastname, email, password, telephone, description, role_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [firstname, lastname, email, hashedPassword, telephone, description, roleId]
    );
    return result.insertId;
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

// Obtenir le profil complet d'un utilisateur avec ses statistiques
const getUserProfileWithStats = async (userId) => {
    try {
        // Profil utilisateur avec rôle
        const [userRows] = await db.query(
            `SELECT u.user_id, u.firstname, u.lastname, u.email, u.telephone, u.description, 
                    r.role_name as role
             FROM users u 
             LEFT JOIN roles r ON u.role_id = r.role_id 
             WHERE u.user_id = ?`,
            [userId]
        );
        
        if (userRows.length === 0) return null;
        
        const user = userRows[0];
        
        // Récupérer les statistiques
        const [notesCount] = await db.query(
            'SELECT COUNT(*) as total_notes FROM notes WHERE user_id = ?',
            [userId]
        );
        
        const [projectsCount] = await db.query(
            'SELECT COUNT(*) as total_projects FROM project_members WHERE user_id = ?',
            [userId]
        ).catch(() => [{ total_projects: 0 }]); // Fallback
        
        const [commentsCount] = await db.query(
            'SELECT COUNT(*) as total_comments FROM comments WHERE user_id = ?',
            [userId]
        ).catch(() => [{ total_comments: 0 }]); // Fallback
        
        const [sharedNotesCount] = await db.query(
            'SELECT COUNT(*) as shared_notes FROM note_shares WHERE user_id = ?',
            [userId]
        ).catch(() => [{ shared_notes: 0 }]); // Fallback
        
        return {
            ...user,
            stats: {
                total_notes: notesCount[0].total_notes,
                total_projects: projectsCount[0]?.total_projects || 0,
                total_comments: commentsCount[0]?.total_comments || 0,
                shared_notes: sharedNotesCount[0]?.shared_notes || 0
            }
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
        SELECT 1 FROM users u
        INNER JOIN roles r ON u.role_id = r.role_id  
        WHERE u.user_id = ? AND r.role_name = ?
    `, [userId, roleName]);
    return rows.length > 0;
};

// Récupérer le rôle d'un utilisateur
const getUserRole = async (userId) => {
    const [rows] = await db.query(`
        SELECT r.role_name FROM users u
        INNER JOIN roles r ON u.role_id = r.role_id
        WHERE u.user_id = ?
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
        SELECT s.skill_id, s.skill_name 
        FROM user_skills us
        INNER JOIN skills s ON us.skill_id = s.skill_id
        WHERE us.user_id = ?
        ORDER BY s.skill_name ASC
    `, [userId]);
    return rows;
};

module.exports = { 
    // Fonctions de base
    createUser, 
    findUserByEmail, 
    matchPassword, 
    getUserById, 
    createUserWithRole,
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
