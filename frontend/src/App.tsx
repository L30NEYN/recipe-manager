import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import Login from './pages/Login'
import RecipeList from './pages/RecipeList'
import RecipeDetail from './pages/RecipeDetail'
import RecipeForm from './pages/RecipeForm'

function App() {
  const { token } = useAuthStore()

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!token ? <Login /> : <Navigate to="/" />} />
        <Route path="/" element={token ? <RecipeList /> : <Navigate to="/login" />} />
        <Route path="/recipes/:id" element={token ? <RecipeDetail /> : <Navigate to="/login" />} />
        <Route path="/recipes/new" element={token ? <RecipeForm /> : <Navigate to="/login" />} />
        <Route path="/recipes/:id/edit" element={token ? <RecipeForm /> : <Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
