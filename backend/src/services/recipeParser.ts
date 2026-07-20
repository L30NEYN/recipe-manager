import axios from 'axios';
import * as cheerio from 'cheerio';

export const parseRecipeFromUrl = async (url: string) => {
  const { data } = await axios.get(url, { timeout: 10000 });
  const $ = cheerio.load(data);
  
  let recipe: any = { title: '', description: '', ingredients: [], instructions: [], servings: 4 };
  
  // JSON-LD
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const json = JSON.parse($(el).html() || '{}');
      if (json['@type'] === 'Recipe') {
        recipe.title = json.name || '';
        recipe.description = json.description || '';
        recipe.servings = json.recipeYield || 4;
        recipe.prepTime = json.prepTime ? parseInt(json.prepTime.replace(/\D/g, '')) : null;
        recipe.cookTime = json.cookTime ? parseInt(json.cookTime.replace(/\D/g, '')) : null;
        recipe.ingredients = Array.isArray(json.recipeIngredient) ? json.recipeIngredient : [];
        recipe.instructions = Array.isArray(json.recipeInstructions) 
          ? json.recipeInstructions.map((i: any) => typeof i === 'string' ? i : i.text)
          : [];
      }
    } catch (e) {}
  });
  
  // Fallback
  if (!recipe.title) {
    recipe.title = $('h1').first().text().trim() || 'Imported Recipe';
  }
  
  return recipe;
};
