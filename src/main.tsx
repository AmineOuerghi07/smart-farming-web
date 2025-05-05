
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { Provider } from 'react-redux';
import { store, persistor } from './state/store';
import App from './App';
import { BrowserRouter, Routes, Route } from 'react-router';
import { PersistGate } from 'redux-persist/integration/react';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import Weather from './pages/Weather';
import Land from './pages/Land';
import Store from './pages/Store';
import ProductDetailPage from './pages/ProductDetailPage';
import ShoppingCart from './pages/ShoppingCart';
import OrderHistoryPage from './pages/OrderHistoryPage';
import CropManagement from './pages/CropManagement';
import Login from './pages/Login.tsx'
import SignUp from './pages/SignUp.tsx'
import { AuthProvider } from './context/AuthContext'
import EditProfile from './pages/EditProfile.tsx'
        
        
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter>
          <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
          <Route path="/register" element={<SignUp />} />

            <Route path="/" element={<App />}>
              <Route index element={<Dashboard />} />
              <Route path="profile" element={<Profile />} />
              <Route path='profile/edit/:id' element={<EditProfile />} />
              <Route path="land" element={<Land />} />
              <Route path="settings" element={<Settings />} />
              <Route path="weather" element={<Weather />} />
              <Route path="store" element={<Store />} />
              <Route path="product_details/:id" element={<ProductDetailPage />} />
              <Route path="ShoppingCart" element={<ShoppingCart />} />
              <Route path="MyBills" element={<OrderHistoryPage />} />
               <Route path='crop-management' element={<CropManagement />} />
            </Route>
          </Routes>
           </AuthProvider>

        </BrowserRouter>
      </PersistGate>
    </Provider>
  </StrictMode>
);
