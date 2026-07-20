import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import type { Recipe } from '../types'

export default function RecipeList() {
  const [recipes, setRecipes] = useState<Recipe[]>([])

  useEffect(() => {
    api.get('/recipes').then(({ data }) => setRecipes(data.recipes))
  }, [])

  return (
    <div className="container">
      <h1>Recipes</h1>
      <Link to="/recipes/new"><button>New Recipe</button></Link>
      <div>
        {recipes.map(recipe => (
          <div key={recipe.id}>
            <Link to={`/recipes/${recipe.id}`}>{recipe.title}</Link>
          </div>
        ))}
      </div>
    </div>
  )
}
