import { pool } from '../config/database';

export const convertCupsToGrams = async (ingredient: string, cups: number): Promise<{ grams: number; isApproximate: boolean } | null> => {
  try {
    const result = await pool.query(
      'SELECT cups_to_grams, is_approximate FROM unit_conversions WHERE LOWER(ingredient_name) LIKE LOWER($1) LIMIT 1',
      [`%${ingredient}%`]
    );
    if (result.rows.length === 0) {
      return null;
    }
    const { cups_to_grams, is_approximate } = result.rows[0];
    return {
      grams: parseFloat(cups_to_grams) * cups,
      isApproximate: is_approximate
    };
  } catch (error) {
    return null;
  }
};
