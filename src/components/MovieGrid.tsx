import React, { useState, useRef } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import type { Movie } from '../types/tmdb';
import { searchMovies } from '../services/tmdb/tmdbApi';
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
import { VersusMode } from './VersusMode';
import { updateMovieRating } from '../services/watchedMovies';
import { MovieCard } from './MovieCard';

interface MovieGridProps {
  searchQuery: string;
  showWatchlist: boolean;
  onMovieAdded?: () => void;
  rankingMode: string | null;
}

export function MovieGrid({
  searchQuery,
  showWatchlist,
  onMovieAdded,
  rankingMode,
}: MovieGridProps) {
  const queryClient = useQueryClient();
  const [ratingMovieId, setRatingMovieId] = useState<number | null>(null);
  const ratingInputRef = useRef<HTMLInputElement | null>(null);
  const hasSetInitialValue = useRef<boolean>(false);
  const [showVersusMode, setShowVersusMode] = useState(false);

  const isShowingSearchResults = searchQuery.trim().length > 0;

  // Handle ranking mode changes
  React.useEffect(() => {
    if (rankingMode === 'versus' && !isShowingSearchResults && !showWatchlist) {
      setShowVersusMode(true);
    } else {
      setShowVersusMode(false);
    }
  }, [rankingMode, isShowingSearchResults, showWatchlist]);

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

  const ratingMutation = useMutation({
    mutationFn: async ({
      movieId,
      rating,
    }: {
      movieId: number;
      rating: number;
    }) => {
      await updateMovieRating(movieId, rating);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchedMovies'] });
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

  const handleMovieClick = (movie: Movie, e: React.MouseEvent) => {
    if (rankingMode === 'manual' && isWatchedList) {
      e.preventDefault();
      setRatingMovieId(movie.id);
      hasSetInitialValue.current = false; // Reset flag for new movie
      // Set initial value in the input when it renders
      setTimeout(() => {
        if (ratingInputRef.current && !hasSetInitialValue.current) {
          ratingInputRef.current.value = (movie.rating || 5).toString();
          hasSetInitialValue.current = true;
        }
      }, 0);
    }
    // If not in manual ranking mode, let the Link handle the navigation
  };

  const handleQuickRating = async (movieId: number, rating: number) => {
    await ratingMutation.mutateAsync({ movieId, rating });
    setRatingMovieId(null);
  };

  const handleRatingSave = (movieId: number) => {
    const inputValue = ratingInputRef.current?.value;
    const rating = parseFloat(inputValue || '5');
    const clampedRating = Math.max(0, Math.min(10, rating));
    handleQuickRating(movieId, clampedRating);
  };

  const handleRatingCancel = () => {
    setRatingMovieId(null);
    hasSetInitialValue.current = false; // Reset flag when canceling
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

  // Show versus mode if enabled
  if (showVersusMode) {
    return (
      <VersusMode movies={movies} onClose={() => setShowVersusMode(false)} />
    );
  }

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
    <div className='grid grid-cols-5 sm:grid-cols-6 md:grid-cols-7 lg:grid-cols-9 xl:grid-cols-12 gap-2'>
      {movies.map((movie, index) => (
        <MovieCard
          key={movie.id}
          movie={movie}
          index={index}
          isWatchedList={isWatchedList}
          isWatchlist={isWatchlist}
          ratingMovieId={ratingMovieId}
          ratingInputRef={ratingInputRef}
          onMovieClick={handleMovieClick}
          onRemoveFromWatched={handleRemoveFromWatched}
          onRemoveFromWatchlist={handleRemoveFromWatchlist}
          onMoveToWatched={handleMoveToWatched}
          onAddToWatchlist={handleAddToWatchlist}
          onAddToWatched={handleAddToWatched}
          onRatingCancel={handleRatingCancel}
          onRatingSave={handleRatingSave}
        />
      ))}
    </div>
  );
}
