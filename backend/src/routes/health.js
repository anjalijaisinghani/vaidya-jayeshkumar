import { Router } from 'express';
import { testConnection } from '../config/database.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    await testConnection();
    res.json({ success: true, data: { status: 'ok', database: 'connected' } });
  } catch (err) {
    console.error('Health check failed:', err.code || err.message);
    res.status(503).json({
      success: false,
      error: { message: 'Database unavailable' },
    });
  }
});

export default router;