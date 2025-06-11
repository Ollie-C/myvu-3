import { useState, useCallback } from 'react';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { MovieGrid } from '../components/MovieGrid';
import { SecondaryHeader } from '../components/SecondaryHeader';
import { RankingButton } from '../components/RankingButton';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showWatchlist, setShowWatchlist] = useState(false);
  const [rankingMode, setRankingMode] = useState<string | null>(null);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleToggleWatchlist = () => {
    setShowWatchlist(!showWatchlist);
  };

  const handleMovieAdded = useCallback(() => {
    setSearchQuery('');
  }, []);

  const handleRankingModeChange = (mode: string | null) => {
    setRankingMode(mode);
  };

  return (
    <div className='min-h-screen bg-white text-black flex flex-col md:flex-row'>
      <Sidebar />
      <div className='flex-1 pb-12 md:pb-0 md:ml-12 flex flex-col'>
        <Header onSearch={handleSearch} />
        <SecondaryHeader
          showWatchlist={showWatchlist}
          onToggleWatchlist={handleToggleWatchlist}
        />
        <main className='flex-1 p-4'>
          <MovieGrid
            searchQuery={searchQuery}
            showWatchlist={showWatchlist}
            onMovieAdded={handleMovieAdded}
            rankingMode={rankingMode}
          />
        </main>
      </div>

      <RankingButton
        onRankingModeChange={handleRankingModeChange}
        currentMode={rankingMode}
      />
    </div>
  );
}
