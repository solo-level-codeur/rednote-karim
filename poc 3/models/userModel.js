const pool = require('../config/db');
const bcrypt = require('bcryptjs');

const createUser = async (firstname, lastname, email, password, roleId = 3) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.execute(
        'INSERT INTO users (firstname, lastname, email, password, id_roles) VALUES (?, ?, ?, ?, ?)',
        [firstname, lastname, email, hashedPassword, roleId]
      );
      return result.insertId;
    };

const findUserByEmail = async (email) => {
        const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0];
      };

const getUserById = async (userId) => {
    try {
        const [rows] = await pool.execute(
            'SELECT id_users, firstname, lastname, email, id_roles, bio, job_title, department, phone, avatar_url, linkedin_url, github_url, created_at FROM users WHERE id_users = ?',
            [userId]
        );
        return rows[0];
    } catch (error) {
        // Fallback si les colonnes de profil n'existent pas encore
        const [rows] = await pool.execute(
            'SELECT id_users, firstname, lastname, email, id_roles, created_at FROM users WHERE id_users = ?',
            [userId]
        );
        return rows[0];
    }
};
    
// Vérifier le mot de passe
const matchPassword = async (enteredPassword, hashedPassword) => {
    return await bcrypt.compare(enteredPassword, hashedPassword);
};

// Créer un utilisateur avec rôle admin (pour l'admin)
const createUserWithRole = async (firstname, lastname, email, password, roleId) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.execute(
        'INSERT INTO users (firstname, lastname, email, password, id_roles) VALUES (?, ?, ?, ?, ?)',
        [firstname, lastname, email, hashedPassword, roleId]
    );
    return result.insertId;
};

// Récupérer tous les utilisateurs (pour admin)
const getAllUsers = async () => {
    const [rows] = await pool.execute(
        'SELECT u.id_users, u.firstname, u.lastname, u.email, u.created_at, r.role_name FROM users u LEFT JOIN roles r ON u.id_roles = r.id ORDER BY u.created_at DESC'
    );
    return rows;
};

// Mettre à jour le rôle d'un utilisateur
const updateUserRole = async (userId, roleId) => {
    const [result] = await pool.execute(
        'UPDATE users SET id_roles = ? WHERE id_users = ?',
        [roleId, userId]
    );
    return result.affectedRows > 0;
};

// Supprimer un utilisateur
const deleteUser = async (userId) => {
    const [result] = await pool.execute('DELETE FROM users WHERE id_users = ?', [userId]);
    return result.affectedRows > 0;
};

// Mettre à jour le profil utilisateur
const updateUserProfile = async (userId, profileData) => {
    const { firstname, lastname, email, bio, job_title, department, phone, avatar_url, linkedin_url, github_url } = profileData;
    
    const [result] = await pool.execute(
        'UPDATE users SET firstname = ?, lastname = ?, email = ?, bio = ?, job_title = ?, department = ?, phone = ?, avatar_url = ?, linkedin_url = ?, github_url = ? WHERE id_users = ?',
        [firstname, lastname, email, bio, job_title, department, phone, avatar_url, linkedin_url, github_url, userId]
    );
    return result.affectedRows > 0;
};

// Obtenir le profil complet d'un utilisateur avec ses statistiques
const getUserProfileWithStats = async (userId) => {
    try {
        // Essayer d'abord avec tous les champs
        const [userRows] = await pool.execute(
            `SELECT u.id_users, u.firstname, u.lastname, u.email, u.bio, u.job_title, u.department, 
                    u.phone, u.avatar_url, u.linkedin_url, u.github_url, u.created_at, 
                    r.role_name as role
             FROM users u 
             LEFT JOIN roles r ON u.id_roles = r.id 
             WHERE u.id_users = ?`,
            [userId]
        );
        
        if (userRows.length === 0) return null;
        
        const user = userRows[0];
        
        // Récupérer les statistiques
        const [notesCount] = await pool.execute(
            'SELECT COUNT(*) as total_notes FROM notes WHERE id_users = ?',
            [userId]
        );
        
        const [projectsCount] = await pool.execute(
            'SELECT COUNT(*) as total_projects FROM project_members WHERE id_users = ?',
            [userId]
        ).catch(() => [{ total_projects: 0 }]); // Fallback si la table n'existe pas
        
        const [commentsCount] = await pool.execute(
            'SELECT COUNT(*) as total_comments FROM comments WHERE id_users = ?',
            [userId]
        ).catch(() => [{ total_comments: 0 }]); // Fallback si la table n'existe pas
        
        const [sharedNotesCount] = await pool.execute(
            'SELECT COUNT(*) as shared_notes FROM note_shares WHERE id_users = ?',
            [userId]
        ).catch(() => [{ shared_notes: 0 }]); // Fallback si la table n'existe pas
        
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
        // Fallback : profil basique sans colonnes étendues
        const [userRows] = await pool.execute(
            `SELECT u.id_users, u.firstname, u.lastname, u.email, u.created_at, 
                    r.role_name as role
             FROM users u 
             LEFT JOIN roles r ON u.id_roles = r.id 
             WHERE u.id_users = ?`,
            [userId]
        );
        
        if (userRows.length === 0) return null;
        
        const user = userRows[0];
        
        // Statistiques basiques
        const [notesCount] = await pool.execute(
            'SELECT COUNT(*) as total_notes FROM notes WHERE id_users = ?',
            [userId]
        );
        
        return {
            ...user,
            bio: null,
            job_title: null,
            department: null,
            phone: null,
            avatar_url: null,
            linkedin_url: null,
            github_url: null,
            stats: {
                total_notes: notesCount[0].total_notes,
                total_projects: 0,
                total_comments: 0,
                shared_notes: 0
            }
        };
    }
};

module.exports = { 
    createUser, 
    findUserByEmail, 
    matchPassword, 
    getUserById, 
    createUserWithRole,
    getAllUsers,
    updateUserRole,
    deleteUser,
    updateUserProfile,
    getUserProfileWithStats
};
