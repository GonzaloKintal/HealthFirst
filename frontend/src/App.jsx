import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-card">
          <AppRoutes />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;