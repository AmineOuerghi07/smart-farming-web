import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter, Routes, Route } from 'react-router'
import Profile from './pages/Profile.tsx'
import Dashboard from './pages/Dashboard.tsx'
import Settings from './pages/Settings.tsx'
import Weather from './pages/Weather.tsx'
import Land from './pages/Land.tsx'
import CropManagement from './pages/CropManagement.tsx'
import Login from './pages/Login.tsx'
import SignUp from './pages/SignUp.tsx'
import { AuthProvider } from './context/AuthContext'
import EditProfile from './pages/EditProfile.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<SignUp />} />
          <Route path='/' element={<App />}>
            <Route index element={<Dashboard />} />
            <Route path='profile' element={<Profile />} />
            <Route path='profile/edit/:id' element={<EditProfile />} />
            <Route path='land' element={<Land />} />
            <Route path='settings' element={<Settings />} />
            <Route path='weather' element={<Weather />} />
            <Route path='crop-management' element={<CropManagement />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
