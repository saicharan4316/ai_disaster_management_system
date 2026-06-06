import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { ShieldAlert, KeyRound, Mail, AlertCircle, RefreshCw } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState('');
  const { login, isAuthenticated, loading, error } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (!email || !password) {
      setValidationError('Please fill in all fields.');
      return;
    }

    try {
      await login(email, password);
      navigate('/admin');
    } catch (err) {
      // Handled by AuthContext and displayed via useAuth error
    }
  };

  const autofillCredentials = () => {
    setEmail('admin@disaster.gov.in');
    setPassword('adminpassword123');
  };

  return (
    <div className="flex min-y-screen flex-col items-center justify-center bg-slate-950 px-4 py-20">
      {/* Background radial glow */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_40%,rgba(99,102,241,0.08),rgba(0,0,0,0))]"></div>

      <div className="z-10 w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/60 p-8 shadow-2xl backdrop-blur-xl">
        {/* Header */}
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 shadow-lg shadow-purple-900/40">
            <ShieldAlert className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-2xl font-bold tracking-tight text-white">
            Official Access
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Govt officials & administrator portal sign-in
          </p>
        </div>

        {/* Credentials Reminder Alert Box */}
        <div className="mt-6 rounded-lg border border-purple-500/30 bg-purple-500/10 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-purple-400" />
            <div className="text-left">
              <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300">
                Seeded Administrator Account
              </h4>
              <p className="mt-1 text-xs text-slate-300">
                Email: <span className="font-mono text-purple-200">admin@disaster.gov.in</span>
              </p>
              <p className="text-xs text-slate-300">
                Password: <span className="font-mono text-purple-200">adminpassword123</span>
              </p>
              <button
                onClick={autofillCredentials}
                className="mt-2 text-xs font-bold text-purple-400 hover:text-purple-300 underline cursor-pointer"
              >
                Autofill Credentials
              </button>
            </div>
          </div>
        </div>

        {/* Form */}
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          {/* Error messages */}
          {(error || validationError) && (
            <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-950/20 p-3 text-xs text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{validationError || error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-slate-400">
              Official Email
            </label>
            <div className="relative mt-1">
              <Mail className="absolute top-3 left-3 h-5 w-5 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@disaster.gov.in"
                className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-slate-400">
              Security Password
            </label>
            <div className="relative mt-1">
              <KeyRound className="absolute top-3 left-3 h-5 w-5 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 py-3 text-sm font-semibold text-white shadow-md shadow-purple-900/20 hover:from-purple-500 hover:to-indigo-500 focus:outline-none active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              'Access Dashboard'
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">
          Unauthorized registration is strictly prohibited. Protected by Role-Based Access Control.
        </p>
      </div>
    </div>
  );
};

export default Login;
