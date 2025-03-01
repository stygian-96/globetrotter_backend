const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const cityRoutes = require('./routes/cityRoutes');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/cities', cityRoutes);

module.exports = app;