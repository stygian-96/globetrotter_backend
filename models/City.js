const db = require('../config/db');

class City {
  static async create(city, country) {
    const [result] = await db.query(
      'INSERT INTO city (city, country) VALUES (?, ?)',
      [city, country]
    );
    return result.insertId;
  }

  static async addClues(cityId, clues) {
    for (const clue of clues) {
      await db.query(
        'INSERT INTO clue (city_id, clue) VALUES (?, ?)',
        [cityId, clue]
      );
    }
  }

  static async addFunFacts(cityId, funFacts) {
    for (const fact of funFacts) {
      await db.query(
        'INSERT INTO fun_fact (city_id, fun_fact) VALUES (?, ?)',
        [cityId, fact]
      );
    }
  }

  static async addTrivia(cityId, triviaItems) {
    for (const trivia of triviaItems) {
      await db.query(
        'INSERT INTO trivia (city_id, trivia) VALUES (?, ?)',
        [cityId, trivia]
      );
    }
  }

  static async findByCity(cityName) {
    const [rows] = await db.query(
      'SELECT * FROM city WHERE LOWER(city) = LOWER(?)',
      [cityName]
    );
    if (!rows || rows.length === 0) {
      return null;
    }
    return rows[0];
  }

  static async getAllCities() {
    const [rows] = await db.query('SELECT * FROM city');
    if (!rows || rows.length === 0) {
      return [];
    }
    return rows;
  }

  static async getCityWithDetails(cityId) {
    const [city] = await db.query('SELECT * FROM city WHERE id = ?', [cityId]);
    if (!city || city.length === 0) {
      return null;
    }

    const [clues] = await db.query('SELECT clue FROM clue WHERE city_id = ?', [cityId]);
    const [funFacts] = await db.query('SELECT fun_fact FROM fun_fact WHERE city_id = ?', [cityId]);
    const [trivia] = await db.query('SELECT trivia FROM trivia WHERE city_id = ?', [cityId]);

    return {
      ...city[0],
      clues: clues && clues.length > 0 ? clues.map(c => c.clue) : [],
      fun_fact: funFacts && funFacts.length > 0 ? funFacts.map(f => f.fun_fact) : [],
      trivia: trivia && trivia.length > 0 ? trivia.map(t => t.trivia) : []
    };
  }

  static async getRandomCity(excludeIds = []) {
    let query = 'SELECT * FROM city';
    if (excludeIds.length > 0) {
      query += ` WHERE id NOT IN (${excludeIds.join(',')})`;
    }
    query += ' ORDER BY RAND() LIMIT 1';

    const [rows] = await db.query(query);
    if (!rows || rows.length === 0) {
      return null;
    }
    return rows[0];
  }

  static async getCityById(id) {
    const [rows] = await db.query('SELECT * FROM city WHERE id = ?', [id]);
    if (!rows || rows.length === 0) {
      return null;
    }
    return rows[0];
  }

  static async getRandomClue(cityId) {
    const [rows] = await db.query(
      'SELECT * FROM clue WHERE city_id = ? ORDER BY RAND() LIMIT 1',
      [cityId]
    );
    if (!rows || rows.length === 0) {
      return null;
    }
    return rows[0];
  }

  static async getRandomFunFact(cityId) {
    const [rows] = await db.query(
      'SELECT fun_fact FROM fun_fact WHERE city_id = ? ORDER BY RAND() LIMIT 1',
      [cityId]
    );
    if (!rows || rows.length === 0) {
      return null;
    }
    return rows[0].fun_fact;
  }

  static async getRandomTrivia(cityId) {
    const [rows] = await db.query(
      'SELECT trivia FROM trivia WHERE city_id = ? ORDER BY RAND() LIMIT 1',
      [cityId]
    );
    if (!rows || rows.length === 0) {
      return null;
    }
    return rows[0].trivia;
  }

  static async getRandomOptions(correctCityId, limit = 3) {
    const [rows] = await db.query(
      'SELECT * FROM city WHERE id != ? ORDER BY RAND() LIMIT ?',
      [correctCityId, limit]
    );
    if (!rows || rows.length === 0) {
      return [];
    }
    return rows;
  }
}

module.exports = City; 