import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { updateMovieRating } from '../services/watchedMovies';
import { calculateElo } from '../utils/elo';
import { getPosterUrl } from '../services/tmdb/tmdbApi';
import type { Movie } from '../types/tmdb';

interface VersusModeProps {
  movies: Movie[];
  onClose: () => void;
}

interface RankingChange {
  movie: Movie;
  oldRating: number;
  newRating: number;
  oldPosition: number;
  newPosition: number;
}

export function VersusMode({ movies, onClose }: VersusModeProps) {
  const [movieA, setMovieA] = useState<Movie | null>(null);
  const [movieB, setMovieB] = useState<Movie | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [comparisonsCount, setComparisonsCount] = useState(0);
  const [showFinishScreen, setShowFinishScreen] = useState(false);
  const [rankingChanges, setRankingChanges] = useState<RankingChange[]>([]);
  const queryClient = useQueryClient();

  // Helper function to get movie position based on rating
  const getMoviePosition = (movieId: number, moviesList: Movie[]): number => {
    const sortedMovies = [...moviesList]
      .filter((m) => m.rating !== null && m.rating !== undefined)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0));

    const position = sortedMovies.findIndex((m) => m.id === movieId);
    return position === -1 ? moviesList.length : position + 1;
  };

  // Helper function to record ranking changes
  const recordRankingChange = (
    movie: Movie,
    oldRating: number,
    newRating: number
  ) => {
    const oldPosition = getMoviePosition(movie.id, movies);

    // Create updated movies list for new position calculation
    const updatedMovies = movies.map((m) =>
      m.id === movie.id ? { ...m, rating: newRating } : m
    );
    const newPosition = getMoviePosition(movie.id, updatedMovies);

    const change: RankingChange = {
      movie,
      oldRating,
      newRating,
      oldPosition,
      newPosition,
    };

    setRankingChanges((prev) => {
      const existingIndex = prev.findIndex((c) => c.movie.id === movie.id);
      if (existingIndex >= 0) {
        // Update existing change, keeping the original old rating
        const updated = [...prev];
        updated[existingIndex] = {
          ...change,
          oldRating: prev[existingIndex].oldRating,
        };
        return updated;
      } else {
        return [...prev, change];
      }
    });
  };

  // Get two random movies for comparison, prioritizing unrated movies
  const getRandomMovies = () => {
    if (movies.length < 2) return;

    const unratedMovies = movies.filter((movie) => !movie.rating);
    const ratedMovies = movies.filter((movie) => movie.rating);

    let movieA: Movie, movieB: Movie;

    if (unratedMovies.length >= 2) {
      // Prioritize: both movies unrated
      const shuffled = [...unratedMovies].sort(() => Math.random() - 0.5);
      movieA = shuffled[0];
      movieB = shuffled[1];
    } else if (unratedMovies.length === 1 && ratedMovies.length >= 1) {
      // Second priority: one unrated, one rated
      movieA = unratedMovies[0];
      const shuffledRated = [...ratedMovies].sort(() => Math.random() - 0.5);
      movieB = shuffledRated[0];
    } else {
      // Fallback: both movies rated
      const shuffled = [...movies].sort(() => Math.random() - 0.5);
      movieA = shuffled[0];
      movieB = shuffled[1];
    }

    console.log('movieA', movieA);
    console.log('movieB', movieB);

    setMovieA(movieA);
    setMovieB(movieB);
  };

  useEffect(() => {
    getRandomMovies();
  }, [movies]);

  const handleChoice = async (winner: 'A' | 'B') => {
    if (!movieA || !movieB || isUpdating) return;

    setIsUpdating(true);

    try {
      // Use current rating or default starting rating of 5.0
      const ratingA = movieA.rating || 5.0;
      const ratingB = movieB.rating || 5.0;

      const { newRatingA, newRatingB } = calculateElo(ratingA, ratingB, winner);

      const roundedRatingA = Math.round(newRatingA * 10) / 10;
      const roundedRatingB = Math.round(newRatingB * 10) / 10;

      // Record the changes before updating
      recordRankingChange(movieA, ratingA, roundedRatingA);
      recordRankingChange(movieB, ratingB, roundedRatingB);

      // Update both movies' ratings
      await Promise.all([
        updateMovieRating(movieA.id, roundedRatingA),
        updateMovieRating(movieB.id, roundedRatingB),
      ]);

      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['movies'] });

      setComparisonsCount((prev) => prev + 1);

      // Get next pair of movies
      getRandomMovies();
    } catch (error) {
      console.error('Failed to update ratings:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSkip = () => {
    getRandomMovies();
  };

  const handleFinish = () => {
    setShowFinishScreen(true);
  };

  if (!movieA || !movieB) {
    return (
      <div className='fixed inset-0 bg-white bg-opacity-95 flex items-center justify-center z-10'>
        <div className='text-center'>
          <p className='text-lg mb-4'>
            Need at least 2 watched movies for versus mode
          </p>
          <button
            onClick={onClose}
            className='px-4 py-2 border border-black bg-white hover:bg-gray-50'>
            Close
          </button>
        </div>
      </div>
    );
  }

  // Finish screen showing ranking changes
  if (showFinishScreen) {
    return (
      <div className='fixed inset-0 bg-white bg-opacity-95 z-10 pt-16 md:pt-0 md:pl-12'>
        <div className='flex items-center justify-center min-h-screen p-4'>
          <div className='max-w-4xl w-full'>
            <div className='text-center mb-6'>
              <h2 className='text-2xl font-bold mb-2'>Versus Mode Complete</h2>
              <p className='text-gray-600 mb-4'>
                {comparisonsCount} comparisons completed
              </p>

              {rankingChanges.length > 0 ? (
                <div className='bg-white border border-black p-6 text-left'>
                  <h3 className='text-lg font-bold mb-4'>Ranking Changes</h3>
                  <div className='space-y-3'>
                    {rankingChanges
                      .sort((a, b) => a.newPosition - b.newPosition)
                      .map((change) => (
                        <div
                          key={change.movie.id}
                          className='flex items-center gap-4 py-2 border-b border-gray-200 last:border-b-0'>
                          <img
                            src={getPosterUrl(change.movie.poster_path)}
                            alt={change.movie.title}
                            className='w-12 h-18 object-cover border border-gray-300'
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder-poster.jpg';
                            }}
                          />
                          <div className='flex-1'>
                            <h4 className='font-medium text-sm truncate max-w-48'>
                              {change.movie.title}
                            </h4>
                            <div className='text-xs text-gray-600 mt-1'>
                              <div className='flex gap-4'>
                                <span>
                                  Position: #{change.oldPosition} → #
                                  {change.newPosition}
                                  {change.newPosition < change.oldPosition && (
                                    <span className='text-green-600 ml-1'>
                                      ↑
                                    </span>
                                  )}
                                  {change.newPosition > change.oldPosition && (
                                    <span className='text-red-600 ml-1'>↓</span>
                                  )}
                                </span>
                                <span>
                                  Rating: {change.oldRating.toFixed(1)} →{' '}
                                  {change.newRating.toFixed(1)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ) : (
                <p className='text-gray-500'>
                  No rankings were changed during this session.
                </p>
              )}

              <button
                onClick={onClose}
                className='mt-6 px-6 py-2 border border-black bg-white hover:bg-gray-50'>
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='fixed inset-0 bg-white bg-opacity-95 z-10 pt-16 md:pt-0 md:pl-12'>
      <div className='flex items-center justify-center min-h-screen p-4'>
        <div className='max-w-5xl w-full'>
          <div className='text-center mb-6'>
            <p className='text-gray-600 mb-2'>
              Which movie did you enjoy more?
            </p>
            <p className='text-sm text-gray-500'>
              Comparisons completed: {comparisonsCount}
            </p>
          </div>

          <div className='flex flex-col md:flex-row gap-6 md:gap-8 items-center justify-center'>
            {/* Movie A */}
            <div className='text-center flex-shrink-0'>
              <button
                onClick={() => handleChoice('A')}
                disabled={isUpdating}
                className='group relative border border-black bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed block'>
                <img
                  src={getPosterUrl(movieA.poster_path)}
                  alt={movieA.title}
                  className='w-40 h-60 md:w-48 md:h-72 object-cover block'
                  onError={(e) => {
                    console.log(
                      'Image failed to load:',
                      getPosterUrl(movieA.poster_path)
                    );
                    e.currentTarget.src = '/placeholder-poster.jpg';
                  }}
                />
              </button>
              <h3 className='mt-3 font-medium text-base md:text-lg max-w-40 md:max-w-48 mx-auto truncate'>
                {movieA.title}
              </h3>
              <p className='text-sm text-gray-600'>
                Rating: {movieA.rating?.toFixed(1) || '5.0'}
              </p>
            </div>

            {/* VS */}
            <div className='text-2xl md:text-4xl font-bold text-gray-400 px-4 md:px-8 flex-shrink-0'>
              VS
            </div>

            {/* Movie B */}
            <div className='text-center flex-shrink-0'>
              <button
                onClick={() => handleChoice('B')}
                disabled={isUpdating}
                className='group relative border border-black bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed block'>
                <img
                  src={getPosterUrl(movieB.poster_path)}
                  alt={movieB.title}
                  className='w-40 h-60 md:w-48 md:h-72 object-cover block'
                  onError={(e) => {
                    console.log(
                      'Image failed to load:',
                      getPosterUrl(movieB.poster_path)
                    );
                    e.currentTarget.src = '/placeholder-poster.jpg';
                  }}
                />
              </button>
              <h3 className='mt-3 font-medium text-base md:text-lg max-w-40 md:max-w-48 mx-auto truncate'>
                {movieB.title}
              </h3>
              <p className='text-sm text-gray-600'>
                Rating: {movieB.rating?.toFixed(1) || '5.0'}
              </p>
            </div>
          </div>

          <div className='text-center mt-6'>
            <div className='flex flex-col sm:flex-row gap-3 justify-center items-center'>
              <button
                onClick={handleSkip}
                disabled={isUpdating}
                className='w-[100px] px-2 py-2 border border-black bg-white hover:bg-gray-50 disabled:opacity-50 text-sm'>
                Skip
              </button>
              <button
                onClick={handleFinish}
                className='w-[100px] px-2 py-2 border border-black bg-white hover:bg-gray-50 text-sm'>
                Finish
              </button>
            </div>
          </div>

          {isUpdating && (
            <div className='absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center'>
              <p className='text-lg'>Updating ratings...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
