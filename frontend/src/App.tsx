import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import TextToImage from './pages/TextToImage';
import ImageToImage from './pages/ImageToImage';
import Avatar from './pages/Avatar';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/text-to-image"
          element={
            <PrivateRoute>
              <TextToImage />
            </PrivateRoute>
          }
        />
        <Route
          path="/image-to-image"
          element={
            <PrivateRoute>
              <ImageToImage />
            </PrivateRoute>
          }
        />
        <Route
          path="/avatar"
          element={
            <PrivateRoute>
              <Avatar />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}
