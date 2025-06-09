import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { GameGrid } from '../components/GameGrid';
import { searchGames, getPopularGames } from '../services/rawg/rawgApi';
import { getPlayedGames } from '../services/playedGames';

export default function GamesPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ['games', searchQuery],
    queryFn: () => searchGames(searchQuery),
    enabled: searchQuery.trim().length > 0,
  });

  const { data: playedGames, isLoading: isLoadingPlayed } = useQuery({
    queryKey: ['playedGames'],
    queryFn: getPlayedGames,
  });

  const { data: popularGames, isLoading: isLoadingPopular } = useQuery({
    queryKey: ['popularGames'],
    queryFn: getPopularGames,
    enabled:
      searchQuery.trim().length === 0 &&
      (!playedGames || playedGames.length === 0),
  });

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleGameAdded = useCallback(() => {
    setSearchQuery('');
  }, []);

  const isShowingSearchResults = searchQuery.trim().length > 0;
  const isShowingPlayedGames =
    !isShowingSearchResults && playedGames && playedGames.length > 0;

  let games, isLoading, isPlayedList;

  if (isShowingSearchResults) {
    games = searchResults?.results || [];
    isLoading = isSearching;
    isPlayedList = false;
  } else if (isShowingPlayedGames) {
    games = playedGames;
    isLoading = isLoadingPlayed;
    isPlayedList = true;
  } else {
    games = popularGames?.results || [];
    isLoading = isLoadingPopular;
    isPlayedList = false;
  }

  return (
    <div className='min-h-screen bg-[#161616] text-white flex flex-col md:flex-row'>
      <Sidebar />
      <div className='flex-1 pb-16 md:pb-0 md:ml-12 flex flex-col'>
        <Header onSearch={handleSearch} />
        <main className='flex-1'>
          <GameGrid
            games={games}
            isLoading={isLoading}
            isPlayedList={isPlayedList}
            onGameAdded={handleGameAdded}
          />
        </main>
      </div>
    </div>
  );
}
