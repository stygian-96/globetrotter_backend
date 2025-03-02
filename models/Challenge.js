const db = require('../config/db');
const crypto = require('crypto');
const QuizSession = require('./QuizSession');

class Challenge {
    static async createChallenge(quizSessionId, inviterId) {
        const inviteLink = crypto.randomBytes(16).toString('hex');
        
        const [result] = await db.query(
            'INSERT INTO Challenge (inviter_session_id, inviter_id, invite_link) VALUES (?, ?, ?)',
            [quizSessionId, inviterId, inviteLink]
        );
        
        return {
            id: result.insertId,
            inviteLink
        };
    }

    static async getChallengeByInviteLink(inviteLink) {
        const [rows] = await db.query(
            `SELECT * FROM Challenge WHERE invite_link = ?`,
            [inviteLink]
        );
        return rows[0] || null;
    }

    static async getChallengeWithDetails(challengeId) {
        const [rows] = await db.query(
            `SELECT 
                c.*,
                u.username as inviter_username,
                qs.user_id as quiz_user_id,
                qs.score as inviter_score
             FROM Challenge c 
             JOIN user u ON c.inviter_id = u.id
             JOIN quiz_session qs ON c.inviter_session_id = qs.id
             WHERE c.id = ?`,
            [challengeId]
        );
        return rows[0] || null;
    }

    static async hasExistingChallenge(inviteeId, inviterSessionId) {
        const [rows] = await db.query(
            `SELECT COUNT(*) as count 
             FROM Challenge 
             WHERE invitee_id = ? 
             AND inviter_session_id = ? 
             AND status = 'accepted'`,
            [inviteeId, inviterSessionId]
        );
        return rows[0].count > 0;
    }

    static async acceptChallenge(challengeId, inviteeId) {
        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            const [[challenge]] = await connection.query(
                'SELECT * FROM Challenge WHERE id = ?',
                [challengeId]
            );
            
            if (!challenge) {
                throw new Error('Challenge not found');
            }

            const hasExisting = await this.hasExistingChallenge(inviteeId, challenge.inviter_session_id);
            if (hasExisting) {
                throw new Error('You have already accepted a challenge for this quiz');
            }

            const originalQuestions = await QuizSession.getOrderedQuestions(challenge.inviter_session_id);
            
            const newSessionId = await QuizSession.createWithQuestions(inviteeId, originalQuestions);
            
            await connection.query(
                'UPDATE Challenge SET invitee_id = ?, invitee_session_id = ?, status = "accepted" WHERE id = ?',
                [inviteeId, newSessionId, challengeId]
            );

            await connection.commit();
            return newSessionId;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    static async getChallengeResults(challengeId) {
        const [rows] = await db.query(
            `SELECT 
                c.*,
                inviter.username as inviter_username,
                inviter_session.score as inviter_score,
                invitee.username as invitee_username,
                invitee_session.score as invitee_score
             FROM Challenge c
             JOIN user inviter ON c.inviter_id = inviter.id
             JOIN quiz_session inviter_session ON c.inviter_session_id = inviter_session.id
             LEFT JOIN user invitee ON c.invitee_id = invitee.id
             LEFT JOIN quiz_session invitee_session ON c.invitee_session_id = invitee_session.id
             WHERE c.id = ?`,
            [challengeId]
        );
        return rows[0] || null;
    }

    static async getUserChallenges(userId) {
        const [rows] = await db.query(
            `SELECT 
                c.*,
                inviter.username as inviter_username,
                invitee.username as invitee_username,
                inviter_session.score as inviter_score,
                invitee_session.score as invitee_score
             FROM Challenge c
             JOIN user inviter ON c.inviter_id = inviter.id
             JOIN quiz_session inviter_session ON c.inviter_session_id = inviter_session.id
             LEFT JOIN user invitee ON c.invitee_id = invitee.id
             LEFT JOIN quiz_session invitee_session ON c.invitee_session_id = invitee_session.id
             WHERE c.inviter_id = ? OR c.invitee_id = ?
             ORDER BY c.created_at DESC`,
            [userId, userId]
        );
        return rows;
    }
}

module.exports = Challenge; 