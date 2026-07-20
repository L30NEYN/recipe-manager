import express from 'express';
import { pool } from '../config/database';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

router.get('/search', authMiddleware, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Search query required' });
    }
    const result = await pool.query(
      'SELECT id, username, email FROM users WHERE username ILIKE $1 OR email ILIKE $1 LIMIT 20',
      [`%${q}%`]
    );
    res.json({ users: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
