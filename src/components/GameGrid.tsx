import { Link } from 'react-router-dom';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import type { Game } from '../types/rawg';
import { getGameImageUrl } from '../services/rawg/rawgApi';
import { addToPlayed, removeFromPlayed } from '../services/playedGames';

interface GameGridProps {
  games: Game[];
  isLoading: boolean;
  isPlayedList?: boolean;
  onGameAdded?: () => void;
}

export function GameGrid({
  games,
  isLoading,
  isPlayedList = false,
  onGameAdded,
}: GameGridProps) {
  const queryClient = useQueryClient();

  const addMutation = useMutation({
    mutationFn: addToPlayed,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playedGames'] });
      onGameAdded?.();
    },
  });

  const removeMutation = useMutation({
    mutationFn: removeFromPlayed,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playedGames'] });
    },
  });

  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white'></div>
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className='flex justify-center items-center h-64 text-gray-400'>
        {isPlayedList ? (
          <p>No games added to your played list yet</p>
        ) : (
          <p>No games found</p>
        )}
      </div>
    );
  }

  const handleAddGame = async (game: Game, e: React.MouseEvent) => {
    e.preventDefault();
    await addMutation.mutateAsync(game);
  };

  const handleRemoveGame = async (gameId: number, e: React.MouseEvent) => {
    e.preventDefault();
    await removeMutation.mutateAsync(gameId);
  };

  // Sort games by rating if it's the played list
  const sortedGames = isPlayedList
    ? [...games].sort((a, b) => {
        if (a.user_rating === undefined || a.user_rating === null) return 1;
        if (b.user_rating === undefined || b.user_rating === null) return -1;
        return b.user_rating - a.user_rating;
      })
    : games;

  return (
    <div className='grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-1 p-2 md:px-4'>
      {sortedGames.map((game, index) => (
        <Link
          key={game.id}
          to={`/game/${game.id}`}
          className='bg-[#424343] rounded overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer group relative'>
          <div className='relative pb-[130%]'>
            {isPlayedList &&
              game.user_rating !== undefined &&
              game.user_rating !== null && (
                <div className='absolute top-1 left-1 z-10 bg-black/80 text-white px-1.5 py-0.5 rounded text-xs font-medium'>
                  {index + 1}
                </div>
              )}
            <img
              src={getGameImageUrl(game.background_image)}
              alt={`${game.name} image`}
              className='absolute inset-0 w-full h-full object-cover'
              loading='lazy'
            />
            <div className='absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-start justify-end p-1'>
              {isPlayedList ? (
                <button
                  onClick={(e) => handleRemoveGame(game.id, e)}
                  className='bg-[#424343] text-white px-2 py-1 rounded-full hover:bg-[#525252] transition-colors duration-200 text-[9px] cursor-pointer'>
                  X
                </button>
              ) : (
                <button
                  onClick={(e) => handleAddGame(game, e)}
                  className='bg-[#424343] text-white px-4 py-2 rounded-full hover:bg-[#525252] transition-colors duration-200'>
                  Add to Played
                </button>
              )}
            </div>
          </div>

          <div className='p-2 right-0 bg-[#161616] min-h-12'>
            <div className='flex justify-between items-center'>
              <p className='text-white text-xs font-semibold'>{game.name}</p>

              {isPlayedList &&
                game.user_rating !== undefined &&
                game.user_rating !== null && (
                  <span className='text-white text-xs font-bold'>
                    {game.user_rating.toFixed(1)}
                  </span>
                )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
