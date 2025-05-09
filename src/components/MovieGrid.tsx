import { Link } from 'react-router-dom';
import type { Movie } from '../types/tmdb';
import { getPosterUrl } from '../services/tmdbApi';

interface MovieGridProps {
  movies: Movie[];
  isLoading: boolean;
}

export function MovieGrid({ movies, isLoading }: MovieGridProps) {
  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500'></div>
      </div>
    );
  }

  if (movies.length === 0) {
    return null;
  }

  return (
    <div className='grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-10 gap-2 p-3'>
      {movies.map((movie) => (
        <Link
          key={movie.id}
          to={`/movie/${movie.id}`}
          className='bg-[#18181A] rounded overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer'>
          <div className='relative pb-[130%]'>
            <img
              src={getPosterUrl(movie.poster_path)}
              alt={`${movie.title} poster`}
              className='absolute inset-0 w-full h-full object-cover'
              loading='lazy'
            />
          </div>
          <div className='p-2'>
            <h3 className='text-white text-sm font-semibold truncate'>
              {movie.title}
            </h3>
            <p className='text-slate-400 text-xs'>
              {movie.release_date?.split('-')[0] || 'Unknown'}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
