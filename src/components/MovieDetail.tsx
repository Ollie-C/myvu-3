import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getMovieDetails, getBackdropUrl } from '../services/tmdbApi';
import type { Movie } from '../types/tmdb';
import { Header } from './Header';

export function MovieDetail() {
  const { id } = useParams<{ id: string }>();
  const movieId = parseInt(id || '0', 10);

  const {
    data: movie,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['movie', movieId],
    queryFn: () => getMovieDetails(movieId),
    enabled: !!movieId,
  });

  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-screen bg-[#161616]'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white'></div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className='flex justify-center items-center h-screen bg-[#161616] text-white'>
        <p>Failed to load movie details</p>
      </div>
    );
  }

  return (
    <div className='relative min-h-screen bg-[#161616]'>
      <Header hideSearch={true} />

      {/* Backdrop image */}
      <div className='absolute inset-0 z-0 opacity-70'>
        <img
          src={getBackdropUrl(movie.backdrop_path)}
          alt={`${movie.title} backdrop`}
          className='w-full h-full object-cover'
        />
      </div>

      {/* Gradient overlay */}
      <div className='absolute inset-0 z-10 bg-gradient-to-r from-black/95 via-black/85 to-black/10'></div>

      {/* Content */}
      <div className='relative z-20 container mx-auto px-4 py-16 flex flex-col h-screen'>
        <div className='max-w-2xl text-white mt-16'>
          <h1 className='text-4xl font-bold mb-2'>{movie.title}</h1>
          <div className='mb-4 flex items-center gap-2'>
            {movie.release_date && (
              <span className='text-gray-300'>
                {movie.release_date.split('-')[0]}
              </span>
            )}
            {movie.runtime && (
              <span className='text-gray-300'>• {movie.runtime} min</span>
            )}
            {movie.vote_average && (
              <span className='bg-[#424343] text-white px-2 py-1 rounded-md text-sm font-bold'>
                {movie.vote_average.toFixed(1)}
              </span>
            )}
          </div>

          {movie.genres && (
            <div className='flex flex-wrap gap-2 mb-6'>
              {movie.genres.map((genre) => (
                <span
                  key={genre.id}
                  className='bg-[#333333] text-white text-sm px-3 py-1 rounded-full'>
                  {genre.name}
                </span>
              ))}
            </div>
          )}

          <p className='text-lg text-gray-200 leading-relaxed'>
            {movie.overview}
          </p>
        </div>
      </div>
    </div>
  );
}
