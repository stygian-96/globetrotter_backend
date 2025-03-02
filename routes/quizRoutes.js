const express = require('express');
const quizController = require('../controllers/quizController');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/start', auth, quizController.startQuizSession);
router.get('/random/:sessionId', auth, quizController.getRandomQuiz);
router.post('/submit', auth, quizController.submitAnswer);

module.exports = router;