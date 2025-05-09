import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { ChangeEvent } from 'react';

interface HeaderProps {
  onSearch?: (query: string) => void;
  hideSearch?: boolean;
}

export function Header({ onSearch, hideSearch = false }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch?.(query);
  };

  return (
    <header className='p-4 sticky top-0 z-20'>
      <div className='flex items-center justify-between w-full'>
        <Link to='/' className='text-xl font-bold text-white'>
          MYVU
        </Link>

        {!hideSearch && (
          <div className='flex justify-center w-[80%] mx-8'>
            <div className='relative w-full'>
              <input
                type='text'
                className='w-full p-2 pl-10 rounded-2xl bg-[#424343] text-white focus:outline-none focus:ring-1'
                placeholder='Search for movies...'
                value={searchQuery}
                onChange={handleSearchChange}
              />
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-4 w-4 absolute left-3 top-3 text-slate-900'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                />
              </svg>
            </div>
          </div>
        )}

        <button className='text-white p-2 rounded-full hover:bg-slate-700'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-6 w-6'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z'
            />
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
            />
          </svg>
        </button>
      </div>
    </header>
  );
}
