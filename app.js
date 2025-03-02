const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const cityRoutes = require('./routes/cityRoutes');
const quizRoutes = require('./routes/quizRoutes');
const challengeRoutes = require('./routes/challengeRoutes');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/cities', cityRoutes);
app.use('/quiz', quizRoutes);
app.use('/challenge', challengeRoutes);

module.exports = app;