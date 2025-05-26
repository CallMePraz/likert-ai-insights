const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'dev_likert',
  password: 'admin123',
  port: 5432
});

// GET /api/ai-sentiment-analysis
router.get('/ai-sentiment-analysis', async (req, res) => {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT rating, COUNT(*) as count FROM surveydata GROUP BY rating`
      );
      let positive = 0, neutral = 0, negative = 0, total = 0;
      result.rows.forEach(row => {
        const rating = parseInt(row.rating);
        const count = parseInt(row.count);
        total += count;
        if (rating >= 4) positive += count;
        else if (rating === 3) neutral += count;
        else if (rating <= 2) negative += count;
      });
      const percent = (n) => total > 0 ? Math.round((n / total) * 100) : 0;
      res.json({
        positive: percent(positive),
        neutral: percent(neutral),
        negative: percent(negative),
        total
      });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('AI Sentiment API error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
