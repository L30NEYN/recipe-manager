import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../services/api'
import type { Recipe } from '../types'

export default function RecipeDetail() {
  const { id } = useParams()
  const [recipe, setRecipe] = useState<Recipe | null>(null)

  useEffect(() => {
    api.get(`/recipes/${id}`).then(({ data }) => setRecipe(data.recipe))
  }, [id])

  if (!recipe) return <div>Loading...</div>

  return (
    <div className="container">
      <h1>{recipe.title}</h1>
      <p>{recipe.description}</p>
      <h2>Ingredients</h2>
      <ul>
        {recipe.ingredients.map((ing, i) => (
          <li key={i}>{ing.amount} {ing.unit} {ing.ingredientName}</li>
        ))}
      </ul>
      <h2>Instructions</h2>
      <ol>
        {recipe.instructions.map((inst, i) => (
          <li key={i}>{inst.instruction}</li>
        ))}
      </ol>
    </div>
  )
}
