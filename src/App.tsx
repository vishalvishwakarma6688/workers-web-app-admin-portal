import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { AdminLayout } from './components/layout/AdminLayout/AdminLayout';
import { Login } from './pages/Login/Login';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { Workers } from './pages/Workers/Workers';
import { Customers } from './pages/Customers/Customers';
import { Categories } from './pages/Categories/Categories';
import { Jobs } from './pages/Jobs/Jobs';
import { SettingsPage } from './pages/Settings/Settings';
import './styles/theme.css';

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route path="/" element={<AdminLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="workers" element={<Workers />} />
              <Route path="customers" element={<Customers />} />
              <Route path="categories" element={<Categories />} />
              <Route path="jobs" element={<Jobs />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
