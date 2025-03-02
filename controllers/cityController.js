const City = require('../models/City');

const normalizeCity = (cityData) => {
  return {
    ...cityData,
    city: cityData.city
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' '),
    country: cityData.country
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
  };
};

const createCityFromData = async (req, res) => {
  try {
    const cityData = req.body;

    if (!cityData || !cityData.city || !cityData.country || !cityData.clues || !cityData.fun_fact || !cityData.trivia) {
      return res.status(400).json({ 
        message: 'Invalid data format. Required fields: city, country, clues, fun_fact, trivia',
        expectedFormat: {
          "city": "City Name",
          "country": "Country Name",
          "clues": ["clue1", "clue2"],
          "fun_fact": ["fact1", "fact2"],
          "trivia": ["trivia1", "trivia2"]
        }
      });
    }

    const normalizedData = normalizeCity(cityData);

    const existingCity = await City.findByCity(normalizedData.city);
    if (existingCity) {
      return res.status(400).json({ message: 'City already exists in database' });
    }

    const cityId = await City.create(normalizedData.city, normalizedData.country);
    await City.addClues(cityId, normalizedData.clues);
    await City.addFunFacts(cityId, normalizedData.fun_fact);
    await City.addTrivia(cityId, normalizedData.trivia);

    const newCity = await City.getCityWithDetails(cityId);
    res.status(201).json(newCity);
  } catch (error) {
    console.error('Error creating city:', error);
    res.status(500).json({ message: 'Error creating city' });
  }
};

const createMultipleCities = async (req, res) => {
  try {
    const citiesData = req.body;

    if (!Array.isArray(citiesData)) {
      return res.status(400).json({ 
        message: 'Invalid input. Expected an array of city objects',
        expectedFormat: [{
          "city": "City Name",
          "country": "Country Name",
          "clues": ["clue1", "clue2"],
          "fun_fact": ["fact1", "fact2"],
          "trivia": ["trivia1", "trivia2"]
        }]
      });
    }

    const results = {
      successful: [],
      failed: [],
      skipped: []
    };

    for (const cityData of citiesData) {
      try {
        if (!cityData.city || !cityData.country || !cityData.clues || !cityData.fun_fact || !cityData.trivia) {
          results.failed.push({
            city: cityData.city || 'Unknown',
            reason: 'Missing required fields'
          });
          continue;
        }

        const normalizedData = normalizeCity(cityData);

        const existingCity = await City.findByCity(normalizedData.city);
        if (existingCity) {
          results.skipped.push({
            city: normalizedData.city,
            reason: 'City already exists'
          });
          continue;
        }

        const cityId = await City.create(normalizedData.city, normalizedData.country);
        await City.addClues(cityId, normalizedData.clues);
        await City.addFunFacts(cityId, normalizedData.fun_fact);
        await City.addTrivia(cityId, normalizedData.trivia);

        const newCity = await City.getCityWithDetails(cityId);
        results.successful.push(newCity);
      } catch (error) {
        console.error(`Error creating city ${cityData.city}:`, error);
        results.failed.push({
          city: cityData.city || 'Unknown',
          reason: 'Database error'
        });
      }
    }

    res.status(201).json({
      message: `Processed ${citiesData.length} cities`,
      summary: {
        total: citiesData.length,
        successful: results.successful.length,
        failed: results.failed.length,
        skipped: results.skipped.length
      },
      results
    });
  } catch (error) {
    console.error('Error processing cities:', error);
    res.status(500).json({ message: 'Error processing cities' });
  }
};

const getAllCities = async (req, res) => {
  try {
    const cities = await City.getAllCities();
    res.json(cities);
  } catch (error) {
    console.error('Error fetching cities:', error);
    res.status(500).json({ message: 'Error fetching cities' });
  }
};

const getCityDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const city = await City.getCityWithDetails(id);
    
    if (!city) {
      return res.status(404).json({ message: 'City not found' });
    }
    
    res.json(city);
  } catch (error) {
    console.error('Error fetching city details:', error);
    res.status(500).json({ message: 'Error fetching city details' });
  }
};

module.exports = {
  createCityFromData,
  createMultipleCities,
  getAllCities,
  getCityDetails
}; 