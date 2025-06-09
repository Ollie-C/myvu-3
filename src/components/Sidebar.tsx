import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LetterboxdImport } from './LetterboxdImport';

export function Sidebar() {
  const [showImport, setShowImport] = useState(false);

  return (
    <>
      <aside className='fixed bottom-0 left-0 right-0 h-12 w-full bg-transparent border-t border-black z-10 flex flex-row items-center justify-center gap-8 md:top-0 md:left-0 md:right-auto md:h-full md:w-12 md:border-t-0 md:border-r md:flex-col md:justify-start md:py-4 md:gap-4 md:pt-12'>
        <button
          onClick={() => setShowImport(true)}
          className='text-black p-2 hover:bg-gray-100'
          title='Import from Letterboxd'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-5 w-5'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={1}
              d='M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10'
            />
          </svg>
        </button>

        <Link
          to='/settings'
          className='text-black p-2 hover:bg-gray-100'
          title='Settings'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-5 w-5'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={1}
              d='M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z'
            />
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={1}
              d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
            />
          </svg>
        </Link>
      </aside>

      <LetterboxdImport
        isOpen={showImport}
        onClose={() => setShowImport(false)}
      />
    </>
  );
}
