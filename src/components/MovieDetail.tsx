import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMovieDetails, getBackdropUrl } from '../services/tmdb/tmdbApi';
import {
  addToWatched,
  removeFromWatched,
  isMovieWatched,
  updateMovieRating,
  getWatchedMovie,
} from '../services/watchedMovies';
import {
  addToWatchlist,
  removeFromWatchlist,
  isMovieInWatchlist,
} from '../services/movieWatchlist';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { RatingModal } from './RatingModal';

export function MovieDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const movieId = parseInt(id || '0', 10);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);

  const {
    data: movie,
    isLoading: isLoadingMovie,
    error: movieError,
  } = useQuery({
    queryKey: ['movie', movieId],
    queryFn: () => getMovieDetails(movieId),
    enabled: !!movieId,
  });

  const { data: watchedMovie, isLoading: isLoadingWatched } = useQuery({
    queryKey: ['watchedMovies', movieId],
    queryFn: () => getWatchedMovie(movieId),
    enabled: !!movieId,
  });

  const { data: isWatched } = useQuery({
    queryKey: ['isWatched', movieId],
    queryFn: () => isMovieWatched(movieId),
    enabled: !!movieId,
  });

  const { data: isInWatchlist } = useQuery({
    queryKey: ['isInWatchlist', movieId],
    queryFn: () => isMovieInWatchlist(movieId),
    enabled: !!movieId,
  });

  const addWatchedMutation = useMutation({
    mutationFn: addToWatched,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchedMovies'] });
      queryClient.invalidateQueries({ queryKey: ['isWatched', movieId] });
      navigate('/');
    },
  });

  const removeWatchedMutation = useMutation({
    mutationFn: removeFromWatched,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchedMovies'] });
      queryClient.invalidateQueries({ queryKey: ['isWatched', movieId] });
    },
  });

  const addWatchlistMutation = useMutation({
    mutationFn: addToWatchlist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlistMovies'] });
      queryClient.invalidateQueries({ queryKey: ['isInWatchlist', movieId] });
    },
  });

  const removeWatchlistMutation = useMutation({
    mutationFn: removeFromWatchlist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlistMovies'] });
      queryClient.invalidateQueries({ queryKey: ['isInWatchlist', movieId] });
    },
  });

  const ratingMutation = useMutation({
    mutationFn: async (rating: number) => {
      await updateMovieRating(movieId, rating);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchedMovies'] });
      queryClient.invalidateQueries({ queryKey: ['watchedMovies', movieId] });
    },
  });

  const handleWatchedClick = async () => {
    if (isWatched) {
      await removeWatchedMutation.mutateAsync(movieId);
    } else {
      await addWatchedMutation.mutateAsync({ ...movie!, rating: 0 });
    }
  };

  const handleWatchlistClick = async () => {
    if (isInWatchlist) {
      await removeWatchlistMutation.mutateAsync(movieId);
    } else {
      await addWatchlistMutation.mutateAsync(movie!);
    }
  };

  const handleRatingClick = () => {
    setIsRatingModalOpen(true);
  };

  const handleRatingSubmit = async (rating: number) => {
    await ratingMutation.mutateAsync(rating);
  };

  const isLoading = isLoadingMovie || isLoadingWatched;

  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-screen bg-white'>
        <div className='text-black'>Loading...</div>
      </div>
    );
  }

  if (movieError || !movie) {
    return (
      <div className='flex justify-center items-center h-screen bg-white text-black'>
        <p>Failed to load movie details</p>
      </div>
    );
  }

  return (
    <div className='flex flex-col md:flex-row min-h-screen bg-white'>
      <Sidebar />
      <div className='relative min-h-screen bg-white flex-1 pb-12 md:pb-0 md:ml-12'>
        <Header hideSearch={true} />

        {/* Backdrop image */}
        <div className='absolute inset-0 z-0 opacity-60'>
          <img
            src={getBackdropUrl(movie.backdrop_path)}
            alt={`${movie.title} backdrop`}
            className='w-full h-full object-cover'
          />
        </div>

        {/* Light gradient overlay */}
        <div className='absolute inset-0 z-10 bg-gradient-to-r from-white/95 via-white/85 to-white/10'></div>

        {/* Content */}
        <div className='relative z-20 container mx-auto px-4 py-16 flex flex-col h-screen'>
          <div className='max-w-2xl text-black mt-16'>
            <div className='flex items-start justify-between mb-6'>
              <h1 className='text-4xl font-bold'>{movie.title}</h1>
              <div className='flex gap-2 ml-4'>
                {!isWatched && (
                  <button
                    onClick={handleWatchlistClick}
                    disabled={
                      addWatchlistMutation.isPending ||
                      removeWatchlistMutation.isPending
                    }
                    className={`px-4 py-2 border border-black text-black hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed ${
                      isInWatchlist ? 'bg-gray-200' : 'bg-white'
                    }`}>
                    {addWatchlistMutation.isPending ||
                    removeWatchlistMutation.isPending
                      ? 'Loading...'
                      : isInWatchlist
                      ? 'In Watchlist'
                      : 'Add to Watchlist'}
                  </button>
                )}
                <button
                  onClick={handleWatchedClick}
                  disabled={
                    removeWatchedMutation.isPending ||
                    addWatchedMutation.isPending
                  }
                  className='bg-white text-black px-4 py-2 border border-black hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed'>
                  {removeWatchedMutation.isPending ||
                  addWatchedMutation.isPending
                    ? 'Loading...'
                    : isWatched
                    ? 'Remove from Watched'
                    : 'Add to Watched'}
                </button>
              </div>
            </div>

            <div className='mb-4 flex items-center gap-4 text-sm'>
              {movie.release_date && (
                <span className='text-gray-700'>
                  {movie.release_date.split('-')[0]}
                </span>
              )}
              {movie.runtime && (
                <span className='text-gray-700'>• {movie.runtime} min</span>
              )}
              {movie.vote_average && (
                <span className='bg-white text-black px-2 py-1 border border-black text-xs'>
                  TMDB: {movie.vote_average.toFixed(1)}
                </span>
              )}
              {isWatched && (
                <div className='flex items-center gap-2'>
                  <button
                    onClick={handleRatingClick}
                    className='bg-white text-black px-3 py-1 border border-black hover:bg-gray-100 text-xs'>
                    {watchedMovie?.rating
                      ? `Your Rating: ${watchedMovie.rating.toFixed(1)}`
                      : 'Rate Movie'}
                  </button>
                </div>
              )}
            </div>

            {movie.genres && (
              <div className='flex flex-wrap gap-2 mb-6'>
                {movie.genres.map((genre) => (
                  <span
                    key={genre.id}
                    className='bg-white text-black text-xs px-2 py-1 border border-gray-300'>
                    {genre.name}
                  </span>
                ))}
              </div>
            )}

            <p className='text-base text-gray-800 leading-relaxed bg-white/80 p-4 border border-gray-300'>
              {movie.overview}
            </p>
          </div>
        </div>

        <RatingModal
          isOpen={isRatingModalOpen}
          onClose={() => setIsRatingModalOpen(false)}
          onSubmit={handleRatingSubmit}
          initialRating={watchedMovie?.rating ?? 0}
        />
      </div>
    </div>
  );
}
