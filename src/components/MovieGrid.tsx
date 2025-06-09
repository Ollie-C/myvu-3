import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import type { Movie } from '../types/tmdb';
import { searchMovies, getPosterUrl } from '../services/tmdb/tmdbApi';
import {
  getWatchedMovies,
  addToWatched,
  removeFromWatched,
} from '../services/watchedMovies';
import {
  getWatchlistMovies,
  addToWatchlist,
  removeFromWatchlist,
} from '../services/movieWatchlist';
import { BoxRating } from './BoxRating';

interface MovieGridProps {
  searchQuery: string;
  showWatchlist: boolean;
  onMovieAdded?: () => void;
}

export function MovieGrid({
  searchQuery,
  showWatchlist,
  onMovieAdded,
}: MovieGridProps) {
  const queryClient = useQueryClient();

  const isShowingSearchResults = searchQuery.trim().length > 0;

  const { data: searchResults } = useQuery({
    queryKey: ['movies', searchQuery],
    queryFn: () => searchMovies(searchQuery),
    enabled: isShowingSearchResults,
  });

  const { data: watchedMovies } = useQuery({
    queryKey: ['watchedMovies'],
    queryFn: getWatchedMovies,
    enabled: !isShowingSearchResults && !showWatchlist,
  });

  const { data: watchlistMovies } = useQuery({
    queryKey: ['watchlistMovies'],
    queryFn: getWatchlistMovies,
    enabled: !isShowingSearchResults && showWatchlist,
  });

  const addWatchedMutation = useMutation({
    mutationFn: addToWatched,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchedMovies'] });
      if (onMovieAdded && isShowingSearchResults) {
        onMovieAdded();
      }
    },
  });

  const removeWatchedMutation = useMutation({
    mutationFn: removeFromWatched,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchedMovies'] });
    },
  });

  const addWatchlistMutation = useMutation({
    mutationFn: addToWatchlist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlistMovies'] });
      if (onMovieAdded && isShowingSearchResults) {
        onMovieAdded();
      }
    },
  });

  const removeWatchlistMutation = useMutation({
    mutationFn: removeFromWatchlist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlistMovies'] });
    },
  });

  const handleAddToWatched = async (movie: Movie, e: React.MouseEvent) => {
    e.preventDefault();
    await addWatchedMutation.mutateAsync(movie);
  };

  const handleRemoveFromWatched = async (
    movieId: number,
    e: React.MouseEvent
  ) => {
    e.preventDefault();
    await removeWatchedMutation.mutateAsync(movieId);
  };

  const handleAddToWatchlist = async (movie: Movie, e: React.MouseEvent) => {
    e.preventDefault();
    await addWatchlistMutation.mutateAsync(movie);
  };

  const handleRemoveFromWatchlist = async (
    movieId: number,
    e: React.MouseEvent
  ) => {
    e.preventDefault();
    await removeWatchlistMutation.mutateAsync(movieId);
  };

  const handleMoveToWatched = async (movie: Movie, e: React.MouseEvent) => {
    e.preventDefault();
    await removeWatchlistMutation.mutateAsync(movie.id);
    await addWatchedMutation.mutateAsync(movie);
  };

  let movies: Movie[] = [];
  let isWatchedList = false;
  let isWatchlist = false;

  if (isShowingSearchResults) {
    movies = searchResults?.results || [];
  } else if (showWatchlist) {
    movies = watchlistMovies || [];
    isWatchlist = true;
  } else {
    movies = watchedMovies || [];
    isWatchedList = true;
  }
  console.log('movies', movies);

  if (movies.length === 0) {
    return (
      <div className='flex justify-center items-center h-64 text-gray-500'>
        {isWatchedList ? (
          <p>No movies watched yet</p>
        ) : isWatchlist ? (
          <p>No movies in watchlist yet</p>
        ) : (
          <p>No movies found</p>
        )}
      </div>
    );
  }

  return (
    <div className='grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-3'>
      {movies.map((movie, index) => (
        <div key={movie.id} className='flex flex-col'>
          {isWatchedList && (
            <span className='text-xs text-gray-500 mb-1 text-center font-mono'>
              {index + 1}
            </span>
          )}
          <Link
            to={`/movie/${movie.id}`}
            className='bg-white border border-gray-300 hover:border-black transition-colors group relative'>
            <div className='relative pb-[150%]'>
              <img
                src={getPosterUrl(movie.poster_path)}
                alt={`${movie.title} poster`}
                className='absolute inset-0 w-full h-full object-cover'
              />

              <div className='absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-end justify-start p-2 gap-1'>
                {isWatchedList ? (
                  <button
                    onClick={(e) => handleRemoveFromWatched(movie.id, e)}
                    className='bg-white text-black px-2 py-1 text-xs border border-black hover:bg-gray-100 cursor-pointer'>
                    Remove
                  </button>
                ) : isWatchlist ? (
                  <>
                    <button
                      onClick={(e) => handleRemoveFromWatchlist(movie.id, e)}
                      className='bg-white text-black px-2 py-1 text-xs border border-black hover:bg-gray-100 cursor-pointer'>
                      Remove
                    </button>
                    <button
                      onClick={(e) => handleMoveToWatched(movie, e)}
                      className='bg-white text-black px-2 py-1 text-xs border border-black hover:bg-gray-100 cursor-pointer'>
                      Watched
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={(e) => handleAddToWatchlist(movie, e)}
                      className='bg-white text-black px-2 py-1 text-xs border border-black hover:bg-gray-100 cursor-pointer'>
                      Watchlist
                    </button>
                    <button
                      onClick={(e) => handleAddToWatched(movie, e)}
                      className='bg-white text-black px-2 py-1 text-xs border border-black hover:bg-gray-100 cursor-pointer'>
                      Watched
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className='p-2'>
              {isWatchedList && movie.rating && (
                <div className='absolute bottom-2 right-2'>
                  <BoxRating rating={movie.rating} />
                </div>
              )}
              <p className='text-xs text-gray-600 truncate'>{movie.title}</p>
              <p className='text-xs text-gray-500'>
                {movie.release_date?.split('-')[0] || 'Unknown'}
              </p>
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
}
