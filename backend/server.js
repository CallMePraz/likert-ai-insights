const express = require('express');
const { Pool } = require('pg');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev')); // Add request logging

// Create a connection pool
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'dev_likert',
  password: 'admin123',
  port: 5432,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});

// Test the connection
pool.query('SELECT NOW()')
  .then(() => {
    console.log('Database connection successful');
  })
  .catch(err => {
    console.error('Database connection error:', err);
  });

app.get('/api/survey-data', async (req, res) => {
  try {
    console.log('Received request with:', req.query);
    
    // Get query parameters
    const { limit = 10, offset = 0, sort, order = 'desc', startDate, endDate, search } = req.query;
    
    // Convert limit and offset to numbers
    const numLimit = parseInt(limit, 10);
    const numOffset = parseInt(offset, 10);
    
    // Validate parameters
    if (isNaN(numLimit) || numLimit <= 0) {
      return res.status(400).json({ error: 'Invalid limit parameter' });
    }
    if (isNaN(numOffset) || numOffset < 0) {
      return res.status(400).json({ error: 'Invalid offset parameter' });
    }

    // Get server's local time
    const serverTime = new Date();
    const serverDate = serverTime.toISOString().split('T')[0];

    // Build base query
    let query = 'SELECT id, date, rating, comment, branch, sentiment, Teller_ID as teller_id FROM surveyData';
    const params = [];

    // Add date filter if provided
    if (startDate || endDate) {
      query += ' WHERE DATE(date) BETWEEN $1 AND $2';
      params.push(startDate || serverDate);
      params.push(endDate || serverDate);
    }

    // Add search filter if provided
    if (search) {
      if (!query.includes('WHERE')) {
        query += ' WHERE';
      } else {
        query += ' AND';
      }
      query += ' (branch ILIKE $' + (params.length + 1) + ' OR comment ILIKE $' + (params.length + 2) + ')';
      params.push(`%${search}%`);
      params.push(`%${search}%`);
    }

    // Add sorting
    if (sort) {
      query += ` ORDER BY ${sort} ${order}`;
    } else {
      query += ' ORDER BY date DESC';
    }

    // Add limit and offset
    query += ' LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(numLimit);
    params.push(numOffset);

    // Get total count for pagination
    let totalCountQuery = 'SELECT COUNT(*) FROM surveyData';
    const countParams = [];

    if (startDate || endDate) {
      totalCountQuery += ' WHERE DATE(date) BETWEEN $1 AND $2';
      countParams.push(startDate || serverDate);
      countParams.push(endDate || serverDate);
    }

    if (search) {
      if (!totalCountQuery.includes('WHERE')) {
        totalCountQuery += ' WHERE';
      } else {
        totalCountQuery += ' AND';
      }
      totalCountQuery += ' (branch ILIKE $' + (countParams.length + 1) + ' OR comment ILIKE $' + (countParams.length + 2) + ')';
      countParams.push(`%${search}%`);
      countParams.push(`%${search}%`);
    }

    console.log('Total records:', await pool.query('SELECT COUNT(*) FROM surveyData'));
    console.log('Final query:', query);
    console.log('Final params:', params);

    // Execute queries
    const [countResult, rows] = await Promise.all([
      pool.query(totalCountQuery, countParams),
      pool.query(query, params)
    ]);

    console.log('Retrieved', rows.rows.length, 'records for page with offset', numOffset);

    res.json({
      data: rows.rows,
      totalCount: countResult.rows[0].count,
      serverDate: serverDate
    });
  } catch (error) {
    console.error('Error in /api/survey-data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- Sentiment Distribution Route ---
const sentimentRoutes = require('./routes/sentiment');
app.use('/api', sentimentRoutes);
// --- End Sentiment Distribution Route ---

// --- AI Sentiment Analysis Route ---
const aiSentimentRoutes = require('./routes/aiSentiment');
app.use('/api', aiSentimentRoutes);
// --- End AI Sentiment Analysis Route ---

// Endpoint to get average rating per region for Indonesia map
app.get('/api/region-averages', async (req, res) => {
  try {
    const client = await pool.connect();
    try {
      // Use 'branch' as the region column
      const query = `
        SELECT branch as region, AVG(rating) as average_rating
        FROM surveyData
        GROUP BY branch
      `;
      const { rows } = await client.query(query);
      res.json({ regions: rows });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching region averages:', error);
    res.status(500).json({ error: 'Failed to fetch region averages' });
  }
});

// --- Top Performance Route ---
app.get('/api/top-performance', async (req, res) => {
  try {
    const { limit = 10, offset = 0, sort, order = 'desc', startDate, endDate, search } = req.query;
    const numLimit = parseInt(limit, 10);
    const numOffset = parseInt(offset, 10);
    if (isNaN(numLimit) || numLimit <= 0) {
      return res.status(400).json({ error: 'Invalid limit parameter' });
    }
    if (isNaN(numOffset) || numOffset < 0) {
      return res.status(400).json({ error: 'Invalid offset parameter' });
    }
    const serverTime = new Date();
    const serverDate = serverTime.toISOString().split('T')[0];
    let query = 'SELECT id, date, rating, comment, branch, sentiment, teller_id FROM topPerformance';
    const params = [];
    let whereClauses = [];
    if (startDate && endDate) {
      whereClauses.push(`date BETWEEN $${params.length + 1} AND $${params.length + 2}`);
      params.push(startDate, endDate);
    }
    if (search) {
      whereClauses.push(`(branch ILIKE $${params.length + 1} OR comment ILIKE $${params.length + 2})`);
      params.push(`%${search}%`, `%${search}%`);
    }
    if (whereClauses.length > 0) {
      query += ' WHERE ' + whereClauses.join(' AND ');
    }
    if (sort) {
      query += ` ORDER BY ${sort} ${order}`;
    } else {
      query += ' ORDER BY date DESC';
    }
    query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(numLimit, numOffset);
    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) FROM topPerformance';
    let countParams = [];
    let countWhereClauses = [];
    if (startDate && endDate) {
      countWhereClauses.push(`date BETWEEN $${countParams.length + 1} AND $${countParams.length + 2}`);
      countParams.push(startDate, endDate);
    }
    if (search) {
      countWhereClauses.push(`(branch ILIKE $${countParams.length + 1} OR comment ILIKE $${countParams.length + 2})`);
      countParams.push(`%${search}%`, `%${search}%`);
    }
    if (countWhereClauses.length > 0) {
      countQuery += ' WHERE ' + countWhereClauses.join(' AND ');
    }
    const [countResult, rows] = await Promise.all([
      pool.query(countQuery, countParams),
      pool.query(query, params)
    ]);
    res.json({
      data: rows.rows,
      totalCount: parseInt(countResult.rows[0].count, 10),
      serverDate: serverDate
    });
  } catch (error) {
    console.error('Error in /api/top-performance:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// --- End Top Performance Route ---

// --- Bad Performance Route ---
app.get('/api/bad-performance', async (req, res) => {
  try {
    const { limit = 10, offset = 0, sort, order = 'desc', startDate, endDate, search } = req.query;
    const numLimit = parseInt(limit, 10);
    const numOffset = parseInt(offset, 10);
    if (isNaN(numLimit) || numLimit <= 0) {
      return res.status(400).json({ error: 'Invalid limit parameter' });
    }
    if (isNaN(numOffset) || numOffset < 0) {
      return res.status(400).json({ error: 'Invalid offset parameter' });
    }
    const serverTime = new Date();
    const serverDate = serverTime.toISOString().split('T')[0];
    let query = 'SELECT id, date, rating, comment, branch, sentiment, teller_id FROM badPerformance';
    const params = [];
    let whereClauses = [];
    if (startDate && endDate) {
      whereClauses.push(`date BETWEEN $${params.length + 1} AND $${params.length + 2}`);
      params.push(startDate, endDate);
    }
    if (search) {
      whereClauses.push(`(branch ILIKE $${params.length + 1} OR comment ILIKE $${params.length + 2})`);
      params.push(`%${search}%`, `%${search}%`);
    }
    if (whereClauses.length > 0) {
      query += ' WHERE ' + whereClauses.join(' AND ');
    }
    if (sort) {
      query += ` ORDER BY ${sort} ${order}`;
    } else {
      query += ' ORDER BY date DESC';
    }
    query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(numLimit, numOffset);
    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) FROM badPerformance';
    let countParams = [];
    let countWhereClauses = [];
    if (startDate && endDate) {
      countWhereClauses.push(`date BETWEEN $${countParams.length + 1} AND $${countParams.length + 2}`);
      countParams.push(startDate, endDate);
    }
    if (search) {
      countWhereClauses.push(`(branch ILIKE $${countParams.length + 1} OR comment ILIKE $${countParams.length + 2})`);
      countParams.push(`%${search}%`, `%${search}%`);
    }
    if (countWhereClauses.length > 0) {
      countQuery += ' WHERE ' + countWhereClauses.join(' AND ');
    }
    const [countResult, rows] = await Promise.all([
      pool.query(countQuery, countParams),
      pool.query(query, params)
    ]);
    res.json({
      data: rows.rows,
      totalCount: parseInt(countResult.rows[0].count, 10),
      serverDate: serverDate
    });
  } catch (error) {
    console.error('Error in /api/bad-performance:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// --- End Bad Performance Route ---

// --- Average Performance by Province for Indonesia Map ---
app.get('/api/averageperformance', async (req, res) => {
  try {
    const client = await pool.connect();
    try {
      // Query the averageperformance view, mapping branch -> province and average_rating -> value
      const query = `SELECT branch as province, average_rating as value FROM averageperformance`;
      const { rows } = await client.query(query);
      // Return as array of { province, value }
      res.json(rows);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching averageperformance:', error);
    res.status(500).json({ error: 'Failed to fetch average performance' });
  }
});

// --- Top Performance Route with Sorting ---
app.get('/api/top-performance/branch-averages', async (req, res) => {
  try {
    const { filter, sort, order, startDate, endDate } = req.query;
    let query = '';
    let params = [];
    let sortField = 'avg_rating';
    let sortOrder = 'DESC';

    // Whitelist allowed sort fields
    if (sort === 'total_surveys') sortField = 'total_surveys';
    if (sort === 'average_rating') sortField = 'average_rating';
    if (sort === 'avg_rating') sortField = 'avg_rating';
    // Whitelist order
    if (order && String(order).toUpperCase() === 'ASC') sortOrder = 'ASC';

    if (filter === 'today') {
      query = `SELECT s.branch, AVG(s.rating) as avg_rating, COUNT(*) as total_surveys FROM surveydata s WHERE s.date = CURRENT_DATE GROUP BY s.branch HAVING AVG(s.rating) >= 3 ORDER BY ${sortField} ${sortOrder}`;
    } else if (filter === 'last7') {
      query = `SELECT s.branch, AVG(s.rating) as avg_rating, COUNT(*) as total_surveys FROM surveydata s WHERE s.date >= CURRENT_DATE - INTERVAL '6 days' AND s.date <= CURRENT_DATE GROUP BY s.branch HAVING AVG(s.rating) >= 3 ORDER BY ${sortField} ${sortOrder}`;
    } else if (filter === 'custom' && startDate && endDate) {
      query = `SELECT s.branch, AVG(s.rating) as avg_rating, COUNT(*) as total_surveys FROM surveydata s WHERE s.date >= $1 AND s.date <= $2 GROUP BY s.branch HAVING AVG(s.rating) >= 3 ORDER BY ${sortField} ${sortOrder}`;
      params = [startDate, endDate];
    } else { // all time
      query = `SELECT ag.branch, ag.average_rating as avg_rating, br.total_surveys FROM averagegood ag JOIN branchrespondent br ON ag.branch = br.branch ORDER BY ${sortField} ${sortOrder}`;
    }
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error in /api/top-performance/branch-averages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- Bad Performance Route with Sorting ---
app.get('/api/bad-performance/branch-averages', async (req, res) => {
  try {
    const { filter, sort, order, startDate, endDate } = req.query;
    let query = '';
    let params = [];
    let sortField = 'avg_rating';
    let sortOrder = 'ASC';

    if (sort === 'total_surveys') sortField = 'total_surveys';
    if (sort === 'average_rating') sortField = 'average_rating';
    if (sort === 'avg_rating') sortField = 'avg_rating';
    if (order && String(order).toUpperCase() === 'DESC') sortOrder = 'DESC';

    if (filter === 'today') {
      query = `SELECT s.branch, AVG(s.rating) as avg_rating, COUNT(*) as total_surveys FROM surveydata s WHERE s.date = CURRENT_DATE GROUP BY s.branch HAVING AVG(s.rating) < 3 ORDER BY ${sortField} ${sortOrder}`;
    } else if (filter === 'last7') {
      query = `SELECT s.branch, AVG(s.rating) as avg_rating, COUNT(*) as total_surveys FROM surveydata s WHERE s.date >= CURRENT_DATE - INTERVAL '6 days' AND s.date <= CURRENT_DATE GROUP BY s.branch HAVING AVG(s.rating) < 3 ORDER BY ${sortField} ${sortOrder}`;
    } else if (filter === 'custom' && startDate && endDate) {
      query = `SELECT s.branch, AVG(s.rating) as avg_rating, COUNT(*) as total_surveys FROM surveydata s WHERE s.date >= $1 AND s.date <= $2 GROUP BY s.branch HAVING AVG(s.rating) < 3 ORDER BY ${sortField} ${sortOrder}`;
      params = [startDate, endDate];
    } else { // all time
      query = `SELECT ab.branch, ab.average_rating as avg_rating, br.total_surveys FROM averagebad ab JOIN branchrespondent br ON ab.branch = br.branch ORDER BY ${sortField} ${sortOrder}`;
    }
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error in /api/bad-performance/branch-averages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- Total Respondent Table API with Pagination, Sorting, Filtering, Search, and Date Filter ---
app.get('/api/branch-respondent', async (req, res) => {
  try {
    let { limit, offset, sort, order, search, dateFilter, from, to } = req.query;
    limit = parseInt(limit) || 5;
    offset = parseInt(offset) || 0;
    let sortField = 'branch';
    let sortOrder = 'ASC';
    if (sort === 'total_surveys') sortField = 'total_surveys';
    if (sort === 'branch') sortField = 'branch';
    if (order && String(order).toUpperCase() === 'DESC') sortOrder = 'DESC';

    // Search filter
    let whereClauses = [];
    let params = [];
    let paramIndex = 1;
    let useSurveyData = false;
    // Date filtering logic
    if (dateFilter && dateFilter !== 'all') {
      useSurveyData = true;
      if (dateFilter === 'today') {
        whereClauses.push(`date = CURRENT_DATE`);
      } else if (dateFilter === 'last7days') {
        // Fix: last 7 days should be inclusive of today and 6 days before (7 days total)
        whereClauses.push(`date >= CURRENT_DATE - INTERVAL '6 days' AND date <= CURRENT_DATE`);
      } else if (dateFilter === 'custom') {
        if (from) {
          whereClauses.push(`date >= $${paramIndex++}`);
          params.push(from);
        }
        if (to) {
          whereClauses.push(`date <= $${paramIndex++}`);
          params.push(to);
        }
      }
    }
    if (search) {
      whereClauses.push(`LOWER(branch) LIKE $${paramIndex++}`);
      params.push(`%${search.toString().toLowerCase()}%`);
    }
    let whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    if (useSurveyData) {
      // Use surveydata for date filtering
      // Count for pagination
      const countSql = `SELECT COUNT(DISTINCT branch) FROM surveydata ${whereSql}`;
      const countResult = await pool.query(countSql, params);
      const total = parseInt(countResult.rows[0].count, 10);
      // Data query
      const dataSql = `SELECT branch, COUNT(*) as total_surveys FROM surveydata ${whereSql} GROUP BY branch ORDER BY ${sortField} ${sortOrder} LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(limit, offset);
      const { rows } = await pool.query(dataSql, params);
      // Cast total_surveys to integer
      rows.forEach(row => row.total_surveys = parseInt(row.total_surveys, 10));
      res.json({ data: rows, total });
    } else {
      // Use branchrespondent view for all time
      const countResult = await pool.query(`SELECT COUNT(*) FROM branchrespondent ${whereSql}`, params);
      const total = parseInt(countResult.rows[0].count, 10);
      const dataSql = `SELECT branch, total_surveys FROM branchrespondent ${whereSql} ORDER BY ${sortField} ${sortOrder} LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(limit, offset);
      const { rows } = await pool.query(dataSql, params);
      res.json({ data: rows, total });
    }
  } catch (error) {
    console.error('Error in /api/branch-respondent:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- Branch Respondent Teller Table View API ---
app.get('/api/branchrespondent_teller', async (req, res) => {
  try {
    const { branch, startDate, endDate, date } = req.query;
    let query = `SELECT date, branch, teller_id, teller_id_count FROM branchrespondent_teller WHERE 1=1`;
    let params = [];
    let paramIndex = 1;
    if (branch) {
      query += ` AND branch = $${paramIndex++}`;
      params.push(branch);
    }
    // Support date range if provided
    if (startDate && endDate) {
      query += ` AND date >= $${paramIndex++} AND date <= $${paramIndex++}`;
      params.push(startDate, endDate);
    } else if (date) {
      query += ` AND date = $${paramIndex++}`;
      params.push(date);
    }
    query += ' ORDER BY teller_id';
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error in /api/branchrespondent_teller:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(3001, () => {
  console.log('Server is running on port 3001');
});
