import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import ProtectedRoute from '../common/ProtectedRoute';
import Navbar from '../common/Navbar';

const MainLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950">
      <Navbar />
      <div className="flex-grow">{children}</div>
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        &copy; {new Date().getFullYear()} National Suraksha Disaster Alert Network. Government of India.
      </footer>
    </div>
  );
};

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route 
        path="/" 
        element={
          <MainLayout>
            <Home />
          </MainLayout>
        } 
      />
      <Route path="/login" element={<Login />} />

      {/* Protected Admin Routes */}
      <Route element={<ProtectedRoute />}>
        <Route 
          path="/admin" 
          element={
            <MainLayout>
              <Dashboard />
            </MainLayout>
          } 
        />
      </Route>

      {/* Fallback Catch-all Route */}
      <Route 
        path="*" 
        element={
          <MainLayout>
            <div className="flex h-[60vh] flex-col items-center justify-center text-center px-4">
              <h1 className="text-4xl font-extrabold text-white">404</h1>
              <p className="mt-2 text-sm text-slate-400">The page you are looking for does not exist.</p>
              <a href="/" className="mt-6 rounded-lg bg-purple-600 px-4 py-2 text-xs font-semibold text-white hover:bg-purple-500">
                Back to Feed
              </a>
            </div>
          </MainLayout>
        } 
      />
    </Routes>
  );
};

export default AppRoutes;
