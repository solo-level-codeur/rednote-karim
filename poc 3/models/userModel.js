const pool = require('../config/db');
const bcrypt = require('bcryptjs');

const createUser = async (username, email, password) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.execute(
        'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
        [username, email, hashedPassword]
      );
      return result.insertId;
    };

const findUserByEmail = async (email) => {
        const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0];
      };

const getUserById = async (userId) => {
    const [rows] = await pool.execute(
        'SELECT id, username, email FROM users WHERE id = ?',
        [userId]
    );
    return rows[0];
};
    
// Vérifier le mot de passe
const matchPassword = async (enteredPassword, hashedPassword) => {
    return await bcrypt.compare(enteredPassword, hashedPassword);
  };

  module.exports = { createUser, findUserByEmail, matchPassword, getUserById };
