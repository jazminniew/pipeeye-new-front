// src/App.tsx
import { BrowserRouter, Routes, Route} from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ImageUpload from './pages/ImagesUpload'
import AnalyzeImages from './pages/AnalyzeImages'
import History from './pages/History'
import Landing from './pages/Landing/Landing.tsx'
import Administrar from '@/pages/Administrar';
import '@/services'; 
import ContactPage from './pages/ContactPage.tsx'
import Proyectos from './pages/Proyectos.tsx' 
import Radiografias from './pages/Radiografias.tsx' 

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/upload" element={<ImageUpload />} />
        <Route path="/analyzeImages" element={<AnalyzeImages />} />
        <Route path="/contacto" element={<ContactPage />} />
        <Route path="/history" element={<History />} /> 
        <Route path="/administrar" element={<Administrar />} />
        <Route path="/proyectos" element={<Proyectos />} />
        <Route path="/proyectos/:empresa" element={<Proyectos />} />
        <Route path="/radiografias/:proyectoId" element={<Radiografias />} />
      </Routes>
    </BrowserRouter>
  )
}
