import express from 'express';
import { authMiddleware } from '../middleware/auth';
import { parseRecipeFromUrl } from '../services/recipeParser';

const router = express.Router();

router.post('/parse-url', authMiddleware, async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL required' });
    }
    const recipe = await parseRecipeFromUrl(url);
    res.json({ recipe });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to parse recipe' });
  }
});

export default router;
