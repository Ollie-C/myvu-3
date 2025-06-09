import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getGameDetails,
  getGameImageUrl,
  formatPlatforms,
} from '../services/rawg/rawgApi';
import {
  addToPlayed,
  removeFromPlayed,
  isGamePlayed,
  updateGameRating,
  getPlayedGame,
} from '../services/playedGames';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { RatingModal } from './RatingModal';

export function GameDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const gameId = parseInt(id || '0', 10);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);

  const {
    data: game,
    isLoading: isLoadingGame,
    error: gameError,
  } = useQuery({
    queryKey: ['game', gameId],
    queryFn: () => getGameDetails(gameId),
    enabled: !!gameId,
  });

  const { data: playedGame, isLoading: isLoadingPlayed } = useQuery({
    queryKey: ['playedGames', gameId],
    queryFn: () => getPlayedGame(gameId),
    enabled: !!gameId,
  });

  const { data: isPlayed } = useQuery({
    queryKey: ['isPlayed', gameId],
    queryFn: () => isGamePlayed(gameId),
    enabled: !!gameId,
  });

  const addMutation = useMutation({
    mutationFn: addToPlayed,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playedGames'] });
      queryClient.invalidateQueries({ queryKey: ['isPlayed', gameId] });
      navigate('/games');
    },
  });

  const removeMutation = useMutation({
    mutationFn: removeFromPlayed,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playedGames'] });
      queryClient.invalidateQueries({ queryKey: ['isPlayed', gameId] });
    },
  });

  const ratingMutation = useMutation({
    mutationFn: async (rating: number) => {
      await updateGameRating(gameId, rating);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playedGames'] });
      queryClient.invalidateQueries({ queryKey: ['playedGames', gameId] });
    },
  });

  const handlePlayedClick = async () => {
    if (isPlayed) {
      await removeMutation.mutateAsync(gameId);
    } else {
      await addMutation.mutateAsync({ ...game!, user_rating: 0 });
    }
  };

  const handleRatingClick = () => {
    setIsRatingModalOpen(true);
  };

  const handleRatingSubmit = async (rating: number) => {
    await ratingMutation.mutateAsync(rating);
  };

  const isLoading = isLoadingGame || isLoadingPlayed;

  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-screen bg-[#161616]'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white'></div>
      </div>
    );
  }

  if (gameError || !game) {
    return (
      <div className='flex justify-center items-center h-screen bg-[#161616] text-white'>
        <p>Failed to load game details</p>
      </div>
    );
  }

  return (
    <div className='flex flex-col md:flex-row min-h-screen bg-[#161616]'>
      <Sidebar />
      <div className='relative min-h-screen bg-[#161616] flex-1 pb-16 md:pb-0 md:ml-12'>
        <Header hideSearch={true} />

        {/* Background image */}
        <div className='absolute inset-0 z-0 opacity-70'>
          <img
            src={getGameImageUrl(game.background_image)}
            alt={`${game.name} background`}
            className='w-full h-full object-cover'
          />
        </div>

        {/* Gradient overlay */}
        <div className='absolute inset-0 z-10 bg-gradient-to-r from-black/95 via-black/85 to-black/10'></div>

        {/* Content */}
        <div className='relative z-20 container mx-auto px-4 py-16 flex flex-col h-screen'>
          <div className='max-w-2xl text-white mt-16'>
            <div className='flex items-start justify-between mb-6'>
              <h1 className='text-4xl font-bold'>{game.name}</h1>
              <button
                onClick={handlePlayedClick}
                disabled={removeMutation.isPending || addMutation.isPending}
                className='bg-[#424343] text-white px-6 py-2 rounded-full hover:bg-[#525252] transition-colors duration-200 ml-4 disabled:opacity-50 disabled:cursor-not-allowed'>
                {removeMutation.isPending || addMutation.isPending ? (
                  <div className='animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white'></div>
                ) : isPlayed ? (
                  'Remove from Played'
                ) : (
                  'Add to Played'
                )}
              </button>
            </div>

            <div className='mb-4 flex items-center gap-4'>
              {game.released && (
                <span className='text-gray-300'>
                  {game.released.split('-')[0]}
                </span>
              )}
              {game.playtime && (
                <span className='text-gray-300'>• {game.playtime}h avg</span>
              )}
              {game.rating && (
                <span className='bg-[#424343] text-white px-2 py-1 rounded-md text-sm font-bold'>
                  RAWG: {game.rating.toFixed(1)}/5
                </span>
              )}
              {game.metacritic && (
                <span className='bg-[#424343] text-white px-2 py-1 rounded-md text-sm font-bold'>
                  Meta: {game.metacritic}
                </span>
              )}
              {isPlayed && (
                <div className='flex items-center gap-2'>
                  <button
                    onClick={handleRatingClick}
                    className='bg-[#424343] text-white px-4 py-1 rounded-md hover:bg-[#525252] transition-colors'>
                    {playedGame?.user_rating
                      ? `Your Rating: ${playedGame.user_rating.toFixed(1)}`
                      : 'Rate Game'}
                  </button>
                </div>
              )}
            </div>

            {game.platforms && (
              <div className='mb-4'>
                <span className='text-gray-300 text-sm'>
                  Platforms: {formatPlatforms(game.platforms)}
                </span>
              </div>
            )}

            {game.genres && (
              <div className='flex flex-wrap gap-2 mb-6'>
                {game.genres.map((genre) => (
                  <span
                    key={genre.id}
                    className='bg-[#333333] text-white text-sm px-3 py-1 rounded-full'>
                    {genre.name}
                  </span>
                ))}
              </div>
            )}

            {game.description_raw && (
              <p className='text-lg text-gray-200 leading-relaxed'>
                {game.description_raw}
              </p>
            )}
          </div>
        </div>

        <RatingModal
          isOpen={isRatingModalOpen}
          onClose={() => setIsRatingModalOpen(false)}
          onSubmit={handleRatingSubmit}
          initialRating={playedGame?.user_rating ?? 0}
        />
      </div>
    </div>
  );
}
