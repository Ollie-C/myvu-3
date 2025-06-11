import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { Movie } from '../types/tmdb';
import { getPosterUrl } from '../services/tmdb/tmdbApi';
import { BoxRating } from './BoxRating';
import { getRatingColour } from '../utils/getRatingColour'; // make sure the path is correct

interface MovieCardProps {
  movie: Movie;
  index: number;
  isWatchedList: boolean;
  isWatchlist: boolean;
  ratingMovieId: number | null;
  ratingInputRef: React.RefObject<HTMLInputElement | null>;
  onMovieClick: (movie: Movie, e: React.MouseEvent) => void;
  onRemoveFromWatched: (movieId: number, e: React.MouseEvent) => void;
  onRemoveFromWatchlist: (movieId: number, e: React.MouseEvent) => void;
  onMoveToWatched: (movie: Movie, e: React.MouseEvent) => void;
  onAddToWatchlist: (movie: Movie, e: React.MouseEvent) => void;
  onAddToWatched: (movie: Movie, e: React.MouseEvent) => void;
  onRatingCancel: () => void;
  onRatingSave: (movieId: number) => void;
}

export const MovieCard = React.memo(
  ({
    movie,
    index,
    isWatchedList,
    isWatchlist,
    ratingMovieId,
    ratingInputRef,
    onMovieClick,
    onRemoveFromWatched,
    onRemoveFromWatchlist,
    onMoveToWatched,
    onAddToWatchlist,
    onAddToWatched,
    onRatingCancel,
    onRatingSave,
  }: MovieCardProps) => {
    const [isHovered, setIsHovered] = useState(false);
    const [hasInitiallyExpanded, setHasInitiallyExpanded] = useState(false);
    const ratingColor = getRatingColour(movie.rating ?? 0);

    // Staggered shrinking animation on component mount
    useEffect(() => {
      const initialDelay = 200; // Wait 1 second before starting to shrink
      const staggerDelay = 70; // 100ms between each card shrinking

      let cardDelay = initialDelay + index * staggerDelay;

      if (index > 80) {
        cardDelay = 0;
      }

      const timer = setTimeout(() => {
        setHasInitiallyExpanded(true);
      }, cardDelay);

      return () => clearTimeout(timer);
    }, [index]);

    return (
      <div className='relative flex flex-col'>
        {isWatchedList && (
          <span
            className={`text-xs text-gray-800 mb-1 text-center font-retro font-bold ${
              index < 3 ? 'text-base' : 'text-xs'
            } ${index === 0 ? 'text-lg text-black' : ''}`}>
            #{index + 1}
          </span>
        )}

        {/* Colored backdrop */}
        <motion.div
          className='absolute inset-1 rounded-xl -z-10'
          style={{ backgroundColor: ratingColor }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        />

        <motion.div
          className='bg-white border border-gray-300 hover:border-black group relative shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] transition-all duration-200 rounded-xl overflow-hidden'
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}>
          <Link
            to={`/movie/${movie.id}`}
            onClick={(e) => onMovieClick(movie, e)}
            className='block'>
            <div className='relative pb-[150%] overflow-hidden'>
              {ratingMovieId === movie.id ? (
                <div className='absolute inset-0 bg-white flex flex-col items-center justify-center gap-4 z-10'>
                  <input
                    type='number'
                    min='0'
                    max='10'
                    step='0.1'
                    className='w-16 text-center text-lg font-bold border-b border-black p-2 outline-none font-retro'
                    autoFocus
                    ref={ratingInputRef}
                  />
                  <div className='flex gap-3 justify-between'>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        onRatingCancel();
                      }}>
                      ✕
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        onRatingSave(movie.id);
                      }}>
                      ✓
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <img
                    src={getPosterUrl(movie.poster_path)}
                    alt={`${movie.title} poster`}
                    className='absolute inset-0 w-full h-full object-cover'
                  />
                  <motion.div
                    className='absolute bottom-0 left-0 right-0 bg-white border-t border-gray-300'
                    animate={{
                      height: !hasInitiallyExpanded
                        ? '100%'
                        : isHovered
                        ? '100%'
                        : '40px',
                    }}
                    initial={{ height: '100%' }}
                    transition={{
                      type: 'spring',
                      stiffness: 300,
                      damping: 30,
                    }}>
                    <div className='px-2 py-1 flex flex-col'>
                      <p className='text-[9px] truncate text-gray-800 font-retro font-bold mb-[2px] text-center'>
                        {movie.title}
                      </p>
                      {isWatchedList &&
                        movie.rating &&
                        ratingMovieId !== movie.id && (
                          <BoxRating rating={movie.rating} />
                        )}
                      <AnimatePresence>
                        {(!hasInitiallyExpanded || isHovered) && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ delay: 0.1, duration: 0.2 }}
                            className='flex-1 flex flex-col justify-between items-center'>
                            <div>{movie.rating}</div>
                            <div className='my-2'>
                              <div className='grid grid-cols-2 gap-2 text-[9px]'>
                                <p className='text-gray-600 font-retro text-center'>
                                  DATE
                                </p>
                                {movie.vote_average && (
                                  <p className='text-gray-600 font-retro text-center'>
                                    IMDB
                                  </p>
                                )}
                              </div>
                              <div className='grid grid-cols-2 gap-2 text-[9px]'>
                                <p className='text-gray-600 font-retro text-center'>
                                  {movie.release_date?.split('-')[0] ||
                                    'Unknown'}
                                </p>
                                {movie.vote_average && (
                                  <p className='text-gray-600 font-retro text-center'>
                                    {movie.vote_average.toFixed(1)}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className='flex flex-col gap-1 mt-2'>
                              {isWatchedList ? (
                                <>
                                  <button
                                    onClick={(e) =>
                                      onRemoveFromWatched(movie.id, e)
                                    }
                                    className='bg-white text-black px-2 py-1 text-xs border border-black hover:bg-gray-100 cursor-pointer font-retro'>
                                    Remove
                                  </button>
                                  <button
                                    onClick={(e) => e.preventDefault()}
                                    className='bg-gray-100 text-gray-600 px-2 py-1 text-xs border border-gray-300 cursor-not-allowed font-retro'>
                                    Add to List
                                  </button>
                                </>
                              ) : isWatchlist ? (
                                <>
                                  <button
                                    onClick={(e) =>
                                      onRemoveFromWatchlist(movie.id, e)
                                    }
                                    className='bg-white text-black px-2 py-1 text-xs border border-black hover:bg-gray-100 cursor-pointer font-retro'>
                                    Remove
                                  </button>
                                  <button
                                    onClick={(e) => onMoveToWatched(movie, e)}
                                    className='bg-white text-black px-2 py-1 text-xs border border-black hover:bg-gray-100 cursor-pointer font-retro'>
                                    Watched
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={(e) => onAddToWatchlist(movie, e)}
                                    className='bg-white text-black px-2 py-1 text-xs border border-black hover:bg-gray-100 cursor-pointer font-retro'>
                                    Watchlist
                                  </button>
                                  <button
                                    onClick={(e) => onAddToWatched(movie, e)}
                                    className='bg-white text-black px-2 py-1 text-xs border border-black hover:bg-gray-100 cursor-pointer font-retro'>
                                    Watched
                                  </button>
                                </>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                </>
              )}
            </div>
          </Link>
        </motion.div>
      </div>
    );
  }
);

MovieCard.displayName = 'MovieCard';
