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
import Store from './pages/Store.tsx'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
    <Routes>
      <Route path='/' element={<App />}>
      <Route index element={<Dashboard />} />
        <Route path='profile' element={<Profile />} />
        <Route path='land' element={<Land />} />
        <Route path='settings' element={<Settings />} />
        <Route path='weather' element={<Weather />} />
        <Route path='store' element={<Store />} />
      </Route>
    </Routes>
    </BrowserRouter>
  </StrictMode>,
)
