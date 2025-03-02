const express = require('express');
const cityController = require('../controllers/cityController');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/create', auth, cityController.createCityFromData);

router.post('/create-multiple', auth, cityController.createMultipleCities);

router.get('/', cityController.getAllCities);

router.get('/:id', cityController.getCityDetails);

module.exports = router; 