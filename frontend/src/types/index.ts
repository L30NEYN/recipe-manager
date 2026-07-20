export interface User {
  id: string;
  username: string;
  email: string;
}

export interface Recipe {
  id: string;
  title: string;
  description?: string;
  servings: number;
  ingredients: Ingredient[];
  instructions: Instruction[];
}

export interface Ingredient {
  amount?: number;
  unit?: string;
  ingredientName: string;
}

export interface Instruction {
  stepNumber: number;
  instruction: string;
}
