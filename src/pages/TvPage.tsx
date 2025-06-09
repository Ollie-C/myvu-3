import { useState, useCallback } from 'react';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';

export default function TvPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    // TODO: Implement TV search functionality
  }, []);

  return (
    <div className='min-h-screen bg-[#161616] text-white flex flex-col md:flex-row'>
      <Sidebar />
      <div className='flex-1 pb-16 md:pb-0 md:ml-12 flex flex-col'>
        <Header onSearch={handleSearch} />
        <main className='flex-1 p-4'>
          <div className='text-center py-16'>
            <h1 className='text-4xl font-bold mb-4'>TV Shows</h1>
            <p className='text-gray-400'>Coming soon...</p>
            {searchQuery && (
              <p className='text-gray-500 mt-2'>
                Searching for: "{searchQuery}"
              </p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
