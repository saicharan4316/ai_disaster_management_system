import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { ShieldAlert, LogIn, LogOut, LayoutDashboard, FileText, BellRing, PhoneCall } from 'lucide-react';

export const Navbar = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="rounded-lg bg-gradient-to-tr from-red-600 to-purple-600 p-2 shadow-lg shadow-purple-900/30 group-hover:scale-105 transition-transform duration-200">
            <ShieldAlert className="h-6 w-6 text-white animate-pulse" />
          </div>
          <span className="bg-gradient-to-r from-red-400 via-pink-400 to-purple-400 bg-clip-text text-xl font-bold tracking-wider text-transparent uppercase">
            Suraksha AI
          </span>
          <span className="hidden sm:inline-block rounded-full border border-purple-500/30 bg-purple-500/10 px-2 py-0.5 text-xs text-purple-400">
            Govt Portal
          </span>
        </Link>

        {/* Links */}
        <nav className="flex items-center gap-6">
          <Link to="/" className="text-sm font-medium text-slate-300 hover:text-purple-400 transition-colors">
            Emergency Feed
          </Link>
          
          {isAuthenticated ? (
            <>
              <Link 
                to="/admin" 
                className="flex items-center gap-1.5 text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
              <div className="h-4 w-px bg-slate-800"></div>
              <div className="flex items-center gap-3">
                <span className="hidden md:inline-block text-xs font-semibold text-slate-400">
                  {user?.username} (Admin)
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium text-red-400 hover:border-red-500 hover:bg-red-950/25 transition-all cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            </>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-purple-900/40 hover:from-purple-500 hover:to-indigo-500 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Admin Login</span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
