const City = require('../models/City');
const QuizSession = require('../models/QuizSession');

const startQuizSession = async (req, res) => {
  const userId = req.user.id;

  try {
    const sessionId = await QuizSession.create(userId);
    res.json({ sessionId });
  } catch (err) {
    res.status(500).json({ message: 'Error starting quiz session.' });
  }
};

const getRandomQuiz = async (req, res) => {
  const { sessionId } = req.params;
  const userId = req.user.id;

  try {
    const session = await QuizSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: 'Quiz session not found.' });
    }
    if (session.user_id !== userId) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const city = await City.getRandomCity();
    const clue = await City.getRandomClue(city.id);
    const options = await City.getRandomOptions(city.id);
    options.push(city);
    const shuffledOptions = options.sort(() => Math.random() - 0.5);

    const quizQuestionId = await QuizSession.recordQuestion(sessionId, city.id);

    for(const option of shuffledOptions) {
        await QuizSession.recordQuestionOptions(option.id, quizQuestionId);
    }

    res.json({
        id: quizQuestionId,
        cityId: city.id,
        clue,
        options: shuffledOptions.map(opt => ({
            id: opt.id,
            city: opt.city,
            country: opt.country,
        }))
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching quiz.' });
  }
};

const submitAnswer = async (req, res) => {
  const { sessionId, quizQuestionId, userAnswerCityId } = req.body;

  try {
    const quizQuestion = await QuizSession.getQuizQuestionById(quizQuestionId);
    if (!quizQuestion) {
      return res.status(404).json({ message: 'Quiz question not found.' });
    }

    const isCorrect = quizQuestion.city_id === userAnswerCityId;
    const funFact = await City.getRandomFunFact(quizQuestion.city_id);
    const trivia = await City.getRandomTrivia(quizQuestion.city_id);

    if (isCorrect) {
      await QuizSession.updateScore(sessionId, 1);
    }

    res.json({
      isCorrect,
      funFact,
      trivia,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error submitting answer.' });
  }
};

module.exports = {
  startQuizSession,
  getRandomQuiz,
  submitAnswer,
};