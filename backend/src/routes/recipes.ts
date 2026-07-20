import express from 'express';
import { pool } from '../config/database';
import { authMiddleware, optionalAuth, AuthRequest } from '../middleware/auth';
import { upload } from '../middleware/upload';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { generateToken } from '../utils/helpers';

const router = express.Router();

// List recipes
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { search, category, tags, favorite } = req.query;
    let query = `SELECT r.*, c.name as category_name FROM recipes r 
                 LEFT JOIN categories c ON r.category_id = c.id 
                 WHERE r.user_id = $1 AND r.is_archived = false`;
    const params: any[] = [req.user!.id];
    let paramIndex = 2;
    
    if (search) {
      query += ` AND (r.title ILIKE $${paramIndex} OR r.description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    if (category) {
      query += ` AND r.category_id = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }
    if (favorite === 'true') {
      query += ` AND r.is_favorite = true`;
    }
    
    query += ` ORDER BY r.created_at DESC`;
    
    const result = await pool.query(query, params);
    res.json({ recipes: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single recipe
router.get('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { servings } = req.query;
    
    const recipeResult = await pool.query(
      `SELECT r.*, c.name as category_name FROM recipes r 
       LEFT JOIN categories c ON r.category_id = c.id 
       WHERE r.id = $1 AND r.user_id = $2`,
      [id, req.user!.id]
    );
    
    if (recipeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    
    const recipe = recipeResult.rows[0];
    const originalServings = recipe.servings || 4;
    const targetServings = servings ? parseInt(servings as string) : originalServings;
    const multiplier = targetServings / originalServings;
    
    // Get ingredients
    const ingredientsResult = await pool.query(
      'SELECT * FROM recipe_ingredients WHERE recipe_id = $1 ORDER BY position',
      [id]
    );
    recipe.ingredients = ingredientsResult.rows.map(ing => ({
      ...ing,
      amount: ing.amount ? ing.amount * multiplier : null
    }));
    
    // Get instructions
    const instructionsResult = await pool.query(
      'SELECT * FROM recipe_instructions WHERE recipe_id = $1 ORDER BY step_number',
      [id]
    );
    recipe.instructions = instructionsResult.rows;
    
    // Get images
    const imagesResult = await pool.query(
      'SELECT * FROM recipe_images WHERE recipe_id = $1 ORDER BY position',
      [id]
    );
    recipe.images = imagesResult.rows;
    
    // Get tags
    const tagsResult = await pool.query(
      `SELECT t.* FROM tags t 
       JOIN recipe_tags rt ON t.id = rt.tag_id 
       WHERE rt.recipe_id = $1`,
      [id]
    );
    recipe.tags = tagsResult.rows;
    
    recipe.scaled_servings = targetServings;
    res.json({ recipe });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create recipe
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const { title, description, servings, prepTime, cookTime, totalTime, difficulty, categoryId, 
            ingredients, instructions, tags, visibility } = req.body;
    
    const publicToken = visibility === 'public' ? generateToken(64) : null;
    
    const recipeResult = await client.query(
      `INSERT INTO recipes (user_id, title, description, servings, prep_time, cook_time, total_time, 
       difficulty, category_id, visibility, public_token) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [req.user!.id, title, description, servings, prepTime, cookTime, totalTime, 
       difficulty, categoryId, visibility || 'private', publicToken]
    );
    
    const recipe = recipeResult.rows[0];
    
    // Insert ingredients
    if (ingredients && Array.isArray(ingredients)) {
      for (let i = 0; i < ingredients.length; i++) {
        const ing = ingredients[i];
        await client.query(
          `INSERT INTO recipe_ingredients (recipe_id, position, amount, unit, ingredient_name, preparation) 
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [recipe.id, i, ing.amount, ing.unit, ing.ingredientName, ing.preparation]
        );
      }
    }
    
    // Insert instructions
    if (instructions && Array.isArray(instructions)) {
      for (let i = 0; i < instructions.length; i++) {
        const inst = instructions[i];
        await client.query(
          `INSERT INTO recipe_instructions (recipe_id, step_number, instruction) VALUES ($1, $2, $3)`,
          [recipe.id, i + 1, inst]
        );
      }
    }
    
    await client.query('COMMIT');
    res.status(201).json({ recipe });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

// Update recipe
router.put('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { title, description, servings, isFavorite } = req.body;
    
    const result = await pool.query(
      `UPDATE recipes SET title = COALESCE($1, title), description = COALESCE($2, description), 
       servings = COALESCE($3, servings), is_favorite = COALESCE($4, is_favorite), updated_at = CURRENT_TIMESTAMP 
       WHERE id = $5 AND user_id = $6 RETURNING *`,
      [title, description, servings, isFavorite, id, req.user!.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    
    res.json({ recipe: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete recipe
router.delete('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM recipes WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.user!.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    
    res.json({ message: 'Recipe deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Public recipe by token
router.get('/public/:token', optionalAuth, async (req, res) => {
  try {
    const { token } = req.params;
    
    const recipeResult = await pool.query(
      'SELECT * FROM recipes WHERE public_token = $1 AND visibility = \'public\'',
      [token]
    );
    
    if (recipeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    
    const recipe = recipeResult.rows[0];
    
    // Get full recipe data (ingredients, instructions, images)
    const ingredientsResult = await pool.query(
      'SELECT * FROM recipe_ingredients WHERE recipe_id = $1 ORDER BY position',
      [recipe.id]
    );
    recipe.ingredients = ingredientsResult.rows;
    
    const instructionsResult = await pool.query(
      'SELECT * FROM recipe_instructions WHERE recipe_id = $1 ORDER BY step_number',
      [recipe.id]
    );
    recipe.instructions = instructionsResult.rows;
    
    res.json({ recipe });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Upload image
router.post('/:id/images', authMiddleware, upload.single('image'), async (req: AuthRequest, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const { id } = req.params;
    
    // Optimize image
    const optimizedPath = `uploads/optimized_${req.file.filename}`;
    await sharp(req.file.path)
      .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toFile(optimizedPath);
    
    // Delete original
    fs.unlinkSync(req.file.path);
    
    const result = await pool.query(
      `INSERT INTO recipe_images (recipe_id, filename, filepath, mimetype, size, is_primary) 
       VALUES ($1, $2, $3, $4, $5, false) RETURNING *`,
      [id, req.file.filename, optimizedPath, req.file.mimetype, req.file.size]
    );
    
    res.json({ image: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
