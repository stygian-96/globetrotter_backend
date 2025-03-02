const db = require('../config/db');

class User {
  static async create(username, email, passwordHash) {
    const [result] = await db.query(
      'INSERT INTO user (username, email, password_hash) VALUES (?, ?, ?)',
      [username, email, passwordHash]
    );
    return result.insertId;
  }

  static async findByEmail(email) {
    const [rows] = await db.query('SELECT * FROM user WHERE email = ?', [email]);
    if (!rows || rows.length === 0) {
      return null;
    }
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await db.query('SELECT * FROM user WHERE id = ?', [id]);
    if (!rows || rows.length === 0) {
      return null;
    }
    return rows[0];
  }

  static async updateScore(userId, points) {
    await db.query(
      'UPDATE user SET score = score + ? WHERE id = ?',
      [points, userId]
    );
  }
}

module.exports = User;