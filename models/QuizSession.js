const db = require('../config/db');

class QuizSession {
  static async create(userId) {
    const [result] = await db.query(
      'INSERT INTO quiz_session (user_id, start_time) VALUES (?, NOW())',
      [userId]
    );
    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await db.query(
      'SELECT * FROM quiz_session WHERE id = ?',
      [id]
    );
    if (!rows || rows.length === 0) {
      return null;
    }
    return rows[0];
  }

  static async findByUserId(userId) {
    const [rows] = await db.query(
      'SELECT * FROM quiz_session WHERE user_id = ?',
      [userId]
    );
    if (!rows || rows.length === 0) {
      return [];
    }
    return rows;
  }

  static async getQuizQuestionById(quizQuestionId) {
    const [rows] = await db.query(
        'SELECT * FROM quiz_question WHERE id = ?',
        [quizQuestionId]
    )
    if(!rows || rows.length === 0) {
        return null;
    }
    return rows[0];
  }

  static async getAskedCities(sessionId) {
    const [rows] = await db.query(
      'SELECT city_id FROM quiz_question WHERE quiz_session_id = ?',
      [sessionId]
    );
    return rows.map(row => row.city_id);
  }

  static async recordQuestion(sessionId, cityId) {
    const [results] = await db.query(
      'INSERT INTO quiz_question (quiz_session_id, city_id) VALUES (?, ?)',
      [sessionId, cityId]
    );
    return results.insertId;
  }

  static async recordQuestionOptions(cityId, quizQuestionId) {
    await db.query(
        'INSERT INTO quiz_question_option (quiz_question_id, city_id) VALUES (?, ?)',
        [quizQuestionId, cityId] 
    );
  }

  static async updateScore(sessionId, score) {
    const [result] = await db.query(
      'UPDATE quiz_session SET score = score + ? WHERE id = ?',
      [score, sessionId]
    );
    return result.affectedRows > 0;
  }

  static async endSession(sessionId, timeTaken) {
    const [result] = await db.query(
      'UPDATE quiz_session SET end_time = NOW(), time_taken = ? WHERE id = ?',
      [timeTaken, sessionId]
    );
    return result.affectedRows > 0;
  }

  static async getOrderedQuestions(sessionId) {
    const [rows] = await db.query(
      `SELECT qq.*, qo.city_id as option_city_id 
       FROM quiz_question qq
       LEFT JOIN quiz_question_option qo ON qq.id = qo.quiz_question_id
       WHERE qq.quiz_session_id = ?
       ORDER BY qq.id`,
      [sessionId]
    );
    
    const questions = [];
    let currentQuestion = null;
    
    for (const row of rows) {
      if (!currentQuestion || currentQuestion.id !== row.id) {
        currentQuestion = {
          id: row.id,
          city_id: row.city_id,
          options: []
        };
        questions.push(currentQuestion);
      }
      if (row.option_city_id) {
        currentQuestion.options.push(row.option_city_id);
      }
    }
    
    return questions;
  }

  static async createWithQuestions(userId, questions) {
    const connection = await db.getConnection();
    await connection.beginTransaction();
    
    try {
      const [result] = await connection.query(
        'INSERT INTO quiz_session (user_id, start_time) VALUES (?, NOW())',
        [userId]
      );
      const newSessionId = result.insertId;
      
      for (const question of questions) {
        const [questionResult] = await connection.query(
          'INSERT INTO quiz_question (quiz_session_id, city_id) VALUES (?, ?)',
          [newSessionId, question.city_id]
        );
        const newQuestionId = questionResult.insertId;
        
        for (const optionCityId of question.options) {
          await connection.query(
            'INSERT INTO quiz_question_option (quiz_question_id, city_id) VALUES (?, ?)',
            [newQuestionId, optionCityId]
          );
        }
      }
      
      await connection.commit();
      return newSessionId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = QuizSession;