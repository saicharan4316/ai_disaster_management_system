import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './components/context/AuthContext';
import AppRoutes from './components/routes/AppRoutes';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
