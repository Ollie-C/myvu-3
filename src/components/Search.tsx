import { useLocation } from 'react-router-dom';
import type { ChangeEvent } from 'react';

interface SearchProps {
  searchQuery: string;
  handleSearchChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

export default function Search({
  searchQuery,
  handleSearchChange,
}: SearchProps) {
  const location = useLocation();

  const getPlaceholderText = () => {
    if (location.pathname.startsWith('/tv')) {
      return 'Search TV shows...';
    } else if (location.pathname.startsWith('/games')) {
      return 'Search games...';
    } else {
      return 'Search movies...';
    }
  };

  return (
    <div className='flex items-center'>
      <input
        type='text'
        placeholder={getPlaceholderText()}
        value={searchQuery}
        onChange={handleSearchChange}
        className='px-3 py-2 border border-black bg-white text-black w-80 focus:outline-none focus:border-gray-400 font-retro text-xs'
      />
    </div>
  );
}
