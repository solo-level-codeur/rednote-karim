const pool = require('../config/db');

// ===== GESTION DES TAGS (Schema Memo) =====

// Créer un nouveau tag
const createTag = async (tag_name) => {
    try {
        const [result] = await pool.execute(
            'INSERT INTO tags (tag_name) VALUES (?)',
            [tag_name]
        );
        return result.insertId;
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            // Tag existe déjà, récupérer son ID
            const [rows] = await pool.execute(
                'SELECT tag_id FROM tags WHERE tag_name = ?',
                [tag_name]
            );
            return rows[0].tag_id;
        }
        throw error;
    }
};

// Récupérer tous les tags
const getAllTags = async () => {
    const [rows] = await pool.execute('SELECT * FROM tags ORDER BY tag_name ASC');
    return rows;
};

// Ajouter un tag à une note
const addTagToNote = async (noteId, tagId) => {
    const [result] = await pool.execute(
        'INSERT IGNORE INTO note_tags (tag_id, note_id) VALUES (?, ?)',
        [tagId, noteId]
    );
    return result.affectedRows > 0;
};

// Supprimer un tag d'une note
const removeTagFromNote = async (noteId, tagId) => {
    const [result] = await pool.execute(
        'DELETE FROM note_tags WHERE tag_id = ? AND note_id = ?',
        [tagId, noteId]
    );
    return result.affectedRows > 0;
};

// Récupérer les tags d'une note
const getNoteTags = async (noteId) => {
    const [rows] = await pool.execute(`
        SELECT t.tag_id, t.tag_name 
        FROM note_tags nt
        INNER JOIN tags t ON nt.tag_id = t.tag_id
        WHERE nt.note_id = ?
    `, [noteId]);
    return rows;
};

// ===== GESTION DES COMMENTAIRES (Schema Memo) =====

// Créer un commentaire sur une note
const createComment = async (noteId, userId, comment_text) => {
    const [result] = await pool.execute(
        'INSERT INTO comments (comment_text, note_id, user_id) VALUES (?, ?, ?)',
        [comment_text, noteId, userId]
    );
    return result.insertId;
};

// Récupérer les commentaires d'une note
const getNoteComments = async (noteId) => {
    const [rows] = await pool.execute(`
        SELECT c.comment_id, c.comment_text, c.created_at, c.user_id,
               u.firstname, u.lastname
        FROM comments c
        INNER JOIN users u ON c.user_id = u.user_id
        WHERE c.note_id = ?
        ORDER BY c.created_at ASC
    `, [noteId]);
    return rows;
};

// Supprimer un commentaire
const deleteComment = async (commentId, userId) => {
    const [result] = await pool.execute(
        'DELETE FROM comments WHERE comment_id = ? AND user_id = ?',
        [commentId, userId]
    );
    return result.affectedRows > 0;
};

// ===== GESTION DU PARTAGE DE NOTES (Schema Memo) =====

// Partager une note avec un utilisateur
const shareNote = async (noteId, ownerId, sharedWithUserId, permission = 'Read') => {
    // Vérifier que l'utilisateur est propriétaire de la note
    const [noteCheck] = await pool.execute(
        'SELECT user_id FROM notes WHERE note_id = ?',
        [noteId]
    );
    
    if (!noteCheck[0] || noteCheck[0].user_id !== ownerId) {
        throw new Error('Seul le propriétaire peut partager la note');
    }
    
    const [result] = await pool.execute(
        'INSERT INTO note_shares (user_id, note_id, permission) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE permission = ?',
        [sharedWithUserId, noteId, permission, permission]
    );
    return result.affectedRows > 0;
};

// Révoquer le partage d'une note
const unshareNote = async (noteId, ownerId, sharedWithUserId) => {
    const [noteCheck] = await pool.execute(
        'SELECT user_id FROM notes WHERE note_id = ?',
        [noteId]
    );
    
    if (!noteCheck[0] || noteCheck[0].user_id !== ownerId) {
        throw new Error('Seul le propriétaire peut révoquer le partage');
    }
    
    const [result] = await pool.execute(
        'DELETE FROM note_shares WHERE user_id = ? AND note_id = ?',
        [sharedWithUserId, noteId]
    );
    return result.affectedRows > 0;
};

// Récupérer les notes partagées avec un utilisateur
const getSharedNotes = async (userId) => {
    const [rows] = await pool.execute(`
        SELECT n.note_id, n.title, n.content, n.created_at, n.updated_at,
               u.firstname as owner_firstname, u.lastname as owner_lastname,
               ns.permission, ns.shared_at
        FROM note_shares ns
        INNER JOIN notes n ON ns.note_id = n.note_id
        INNER JOIN users u ON n.user_id = u.user_id
        WHERE ns.user_id = ?
        ORDER BY ns.shared_at DESC
    `, [userId]);
    return rows;
};

// ===== GESTION DES COMPÉTENCES (Schema Memo) =====

// Créer une nouvelle compétence
const createSkill = async (skill_name) => {
    try {
        const [result] = await pool.execute(
            'INSERT INTO skills (skill_name) VALUES (?)',
            [skill_name]
        );
        return result.insertId;
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            const [rows] = await pool.execute(
                'SELECT skill_id FROM skills WHERE skill_name = ?',
                [skill_name]
            );
            return rows[0].skill_id;
        }
        throw error;
    }
};

// Récupérer toutes les compétences
const getAllSkills = async () => {
    const [rows] = await pool.execute('SELECT * FROM skills ORDER BY skill_name ASC');
    return rows;
};

// Ajouter une compétence à un utilisateur
const addUserSkill = async (userId, skillId) => {
    const [result] = await pool.execute(
        'INSERT IGNORE INTO user_skills (skill_id, user_id) VALUES (?, ?)',
        [skillId, userId]
    );
    return result.affectedRows > 0;
};

// Supprimer une compétence d'un utilisateur
const removeUserSkill = async (userId, skillId) => {
    const [result] = await pool.execute(
        'DELETE FROM user_skills WHERE skill_id = ? AND user_id = ?',
        [skillId, userId]
    );
    return result.affectedRows > 0;
};

// Récupérer les compétences d'un utilisateur
const getUserSkills = async (userId) => {
    const [rows] = await pool.execute(`
        SELECT s.skill_id, s.skill_name 
        FROM user_skills us
        INNER JOIN skills s ON us.skill_id = s.skill_id
        WHERE us.user_id = ?
        ORDER BY s.skill_name ASC
    `, [userId]);
    return rows;
};

// ===== GESTION DES TÂCHES (Schema Memo) =====

// Créer une nouvelle tâche dans un projet
const createTask = async (task_name, description, due_date, projectId) => {
    const [result] = await pool.execute(
        'INSERT INTO tasks (task_name, description, due_date, project_id) VALUES (?, ?, ?, ?)',
        [task_name, description, due_date, projectId]
    );
    return result.insertId;
};

// Récupérer les tâches d'un projet
const getProjectTasks = async (projectId, userId) => {
    // Vérifier l'accès au projet
    const [accessCheck] = await pool.execute(`
        SELECT 1 FROM projects p
        LEFT JOIN project_members pm ON p.project_id = pm.project_id
        WHERE p.project_id = ? AND (p.user_id = ? OR pm.user_id = ?)
        LIMIT 1
    `, [projectId, userId, userId]);
    
    if (accessCheck.length === 0) {
        throw new Error('Accès refusé au projet');
    }
    
    const [rows] = await pool.execute(`
        SELECT t.*, 
               GROUP_CONCAT(CONCAT(u.firstname, ' ', u.lastname)) as assignees
        FROM tasks t
        LEFT JOIN user_task ut ON t.task_id = ut.task_id
        LEFT JOIN users u ON ut.user_id = u.user_id
        WHERE t.project_id = ?
        GROUP BY t.task_id
        ORDER BY t.due_date ASC
    `, [projectId]);
    return rows;
};

// Assigner un utilisateur à une tâche
const assignUserToTask = async (taskId, userId) => {
    const [result] = await pool.execute(
        'INSERT IGNORE INTO user_task (task_id, user_id) VALUES (?, ?)',
        [taskId, userId]
    );
    return result.affectedRows > 0;
};

// Mettre à jour le statut d'une tâche
const updateTaskStatus = async (taskId, status) => {
    const validStatuses = ['TODO', 'IN_PROGRESS', 'DONE'];
    if (!validStatuses.includes(status)) {
        throw new Error('Statut invalide');
    }
    
    const [result] = await pool.execute(
        'UPDATE tasks SET status = ? WHERE task_id = ?',
        [status, taskId]
    );
    return result.affectedRows > 0;
};

module.exports = {
    // Tags
    createTag,
    getAllTags,
    addTagToNote,
    removeTagFromNote,
    getNoteTags,
    
    // Commentaires
    createComment,
    getNoteComments,
    deleteComment,
    
    // Partage
    shareNote,
    unshareNote,
    getSharedNotes,
    
    // Compétences
    createSkill,
    getAllSkills,
    addUserSkill,
    removeUserSkill,
    getUserSkills,
    
    // Tâches
    createTask,
    getProjectTasks,
    assignUserToTask,
    updateTaskStatus
};