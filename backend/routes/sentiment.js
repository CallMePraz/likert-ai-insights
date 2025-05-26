const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
require('dotenv').config();

// PostgreSQL connection pool
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'dev_likert',
  password: 'admin123',
  port: 5432
});

// GET /api/sentiment-distribution
router.get('/sentiment-distribution', async (req, res) => {
  try {
    const client = await pool.connect();
    try {
      console.log('Attempting to query sentiment distribution');
      const result = await client.query(
        `SELECT rating, COUNT(*) as count
         FROM surveydata
         GROUP BY rating
         ORDER BY rating DESC`
      );
      console.log('Query results:', result.rows);
      
      const total = result.rows.reduce((sum, row) => sum + parseInt(row.count), 0);
      const distribution = [5, 4, 3, 2, 1].map(star => {
        const found = result.rows.find(row => parseInt(row.rating) === star);
        return {
          star,
          count: found ? parseInt(found.count) : 0,
          percent: total > 0 ? Math.round((found ? parseInt(found.count) : 0) / total * 100) : 0
        };
      });
      
      console.log('Sending response:', { total, distribution });
      res.json({ total, distribution });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Detailed error:', err.stack);
    console.error('Error message:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
