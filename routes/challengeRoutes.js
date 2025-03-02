const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ChallengeController = require('../controllers/challengeController');

// Create a new challenge
router.post('/create', auth, ChallengeController.createChallenge);

// Get challenge details by invite link
router.get('/:inviteLink', auth, ChallengeController.getChallengeByLink);

// Accept a challenge
router.post('/:inviteLink/accept', auth, ChallengeController.acceptChallenge);

// Get challenge results
router.get('/:challengeId/results', auth, ChallengeController.getChallengeResults);

// Get user's challenges
router.get('/user/challenges', auth, ChallengeController.getUserChallenges);

module.exports = router; 