import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
} from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Contexts
import { AuthProvider } from './context/AuthContext';

// Pages & Components
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import TvPage from './pages/TvPage';
import GamesPage from './pages/GamesPage';
import MovieDetailPage from './pages/MovieDetailPage';
import GameDetailPage from './pages/GameDetailPage';
import SettingsPage from './pages/SettingsPage';
import { ProtectedRoute } from './components/ProtectedRoute';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

function Layout() {
  return (
    <div className='min-h-screen bg-white text-black flex flex-col'>
      <Outlet />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path='/auth' element={<AuthPage />} />
            <Route path='/' element={<Layout />}>
              <Route
                index
                element={
                  <ProtectedRoute>
                    <HomePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path='tv'
                element={
                  <ProtectedRoute>
                    <TvPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path='games'
                element={
                  <ProtectedRoute>
                    <GamesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path='movie/:id'
                element={
                  <ProtectedRoute>
                    <MovieDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path='game/:id'
                element={
                  <ProtectedRoute>
                    <GameDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path='settings'
                element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
