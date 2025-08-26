// src/App.tsx
import { BrowserRouter, Routes, Route} from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ImageUpload from './pages/ImagesUpload'
import AnalyzeImages from './pages/AnalyzeImages'
import History from './pages/History'
import Landing from './pages/Landing/Landing.tsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/upload" element={<ImageUpload />} />
        <Route path="/analyzeImages" element={<AnalyzeImages />} />
        <Route path="/history" element={<History />} /> 
      </Routes>
    </BrowserRouter>
  )
}
