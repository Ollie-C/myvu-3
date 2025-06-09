import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import type { ChangeEvent } from 'react';
import Search from './Search';
import { Navigation } from './Navigation';

interface HeaderProps {
  onSearch?: (query: string) => void;
  hideSearch?: boolean;
}

export function Header({ onSearch, hideSearch = false }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const previousPathname = useRef(location.pathname);
  const onSearchRef = useRef(onSearch);

  // Update the ref when onSearch changes
  onSearchRef.current = onSearch;

  // Reset search only when route actually changes
  useEffect(() => {
    if (previousPathname.current !== location.pathname) {
      setSearchQuery('');
      onSearchRef.current?.('');
      previousPathname.current = location.pathname;
    }
  }, [location.pathname]);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch?.(query);
  };

  return (
    <header className='p-4 sticky top-0 z-20 bg-transparent backdrop-blur-xl border-b border-black'>
      <div className='flex items-center justify-between w-full'>
        <Navigation />
        {!hideSearch && (
          <Search
            searchQuery={searchQuery}
            handleSearchChange={handleSearchChange}
          />
        )}
      </div>
    </header>
  );
}
