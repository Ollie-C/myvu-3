interface SecondaryHeaderProps {
  showWatchlist: boolean;
  onToggleWatchlist: () => void;
}

export function SecondaryHeader({
  showWatchlist,
  onToggleWatchlist,
}: SecondaryHeaderProps) {
  return (
    <div className='p-4 border-b border-gray-200'>
      <button
        onClick={onToggleWatchlist}
        className='px-4 py-2 border border-black bg-white text-black hover:bg-gray-100 cursor-pointer font-retro text-xs'>
        {showWatchlist ? 'Show Watched' : 'Show Watchlist'}
      </button>
    </div>
  );
}
