const Challenge = require('../models/Challenge');
const QuizSession = require('../models/QuizSession');
const db = require('../config/db');

class ChallengeController {
    // Create a new challenge
    static async createChallenge(req, res) {
        try {
            const { quizSessionId } = req.body;
            const inviterId = req.user.id;  // from auth middleware

            const quizSession = await QuizSession.findById(quizSessionId);

            if (!quizSession || quizSession.user_id !== inviterId) {
                return res.status(403).json({ message: 'Invalid quiz session' });
            }

            const challenge = await Challenge.createChallenge(quizSessionId, inviterId);

            res.json({
                id: challenge.id,
                inviteLink: challenge.inviteLink
            });
        } catch (error) {
            res.status(500).json({ message: 'Failed to create challenge' });
        }
    }

    // Get challenge details by invite link
    static async getChallengeByLink(req, res) {
        try {
            const { inviteLink } = req.params;
            const challenge = await Challenge.getChallengeByInviteLink(inviteLink);

            if (!challenge) {
                return res.status(404).json({ message: 'Challenge not found' });
            }

            const challengeDetails = await Challenge.getChallengeWithDetails(challenge.id);

            if (challengeDetails.inviter_id === req.user.id) {
                challengeDetails.isOwnChallenge = true;
            }

            if (challengeDetails.status === 'accepted' && challengeDetails.invitee_id === req.user.id) {
                challengeDetails.isAlreadyAccepted = true;
            }

            res.json(challengeDetails);
        } catch (error) {
            res.status(500).json({ message: 'Failed to get challenge details' });
        }
    }

    // Accept a challenge
    static async acceptChallenge(req, res) {
        try {
            const { inviteLink } = req.params;
            const inviteeId = req.user.id;

            const challenge = await Challenge.getChallengeByInviteLink(inviteLink);
            
            if (!challenge) {
                return res.status(404).json({ message: 'Challenge not found' });
            }

            if (challenge.inviter_id === inviteeId) {
                return res.status(400).json({ message: 'Cannot accept your own challenge' });
            }

            if (challenge.status === 'accepted') {
                return res.status(400).json({ message: 'Challenge already accepted' });
            }

            try {
                const newSessionId = await Challenge.acceptChallenge(challenge.id, inviteeId);
                const quizSession = await QuizSession.findById(newSessionId);

                res.json({
                    message: 'Challenge accepted',
                    quizSession: {
                        id: quizSession.id,
                        start_time: quizSession.start_time
                    }
                });
            } catch (error) {
                if (error.message === 'You have already accepted a challenge for this quiz') {
                    return res.status(400).json({ message: error.message });
                }
                throw error;
            }
        } catch (error) {
            res.status(500).json({ message: 'Failed to accept challenge' });
        }
    }

    // Get challenge results
    static async getChallengeResults(req, res) {
        try {
            const { challengeId } = req.params;
            const userId = req.user.id;

            const results = await Challenge.getChallengeResults(challengeId);

            if (!results) {
                return res.status(404).json({ message: 'Challenge results not found' });
            }

            if (results.inviter_id !== userId && results.invitee_id !== userId) {
                return res.status(403).json({ message: 'Not authorized to view these results' });
            }

            const formattedResults = {
                id: results.id,
                status: results.status,
                inviter: {
                    username: results.inviter_username,
                    score: results.inviter_score,
                    completion_time: results.inviter_completion_time
                },
                invitee: results.invitee_username ? {
                    username: results.invitee_username,
                    score: results.invitee_score,
                    completion_time: results.invitee_completion_time
                } : null
            };

            res.json(formattedResults);
        } catch (error) {
            res.status(500).json({ message: 'Failed to get challenge results' });
        }
    }

    // Get user's challenges (both sent and received)
    static async getUserChallenges(req, res) {
        try {
            const userId = req.user.id;
            const challenges = await Challenge.getUserChallenges(userId);

            const formattedChallenges = challenges.map(challenge => ({
                id: challenge.id,
                status: challenge.status,
                created_at: challenge.created_at,
                isInviter: challenge.inviter_id === userId,
                inviter: {
                    username: challenge.inviter_username,
                    score: challenge.inviter_score
                },
                invitee: challenge.invitee_username ? {
                    username: challenge.invitee_username,
                    score: challenge.invitee_score
                } : null
            }));

            res.json(formattedChallenges);
        } catch (error) {
            res.status(500).json({ message: 'Failed to get user challenges' });
        }
    }
}

module.exports = ChallengeController; 