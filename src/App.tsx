import { useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
} from 'react-router-dom';
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from '@tanstack/react-query';
import { Header } from './components/Header';
import { MovieGrid } from './components/MovieGrid';
import { MovieDetail } from './components/MovieDetail';
import { searchMovies } from './services/tmdbApi';
import type { Movie } from './types/tmdb';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['movies', searchQuery],
    queryFn: () => searchMovies(searchQuery),
    enabled: searchQuery.trim().length > 0,
  });

  const movies: Movie[] = data?.results || [];

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className='min-h-screen bg-[#161616] text-white flex flex-col'>
      <Header onSearch={handleSearch} />
      <main className='flex-1'>
        <MovieGrid movies={movies} isLoading={isLoading} />
      </main>
    </div>
  );
}

function Layout() {
  return (
    <div className='min-h-screen bg-[#161616] text-white flex flex-col'>
      <Outlet />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path='/' element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path='movie/:id' element={<MovieDetail />} />
          </Route>
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
