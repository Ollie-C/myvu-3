import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

export function Navigation() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const navItems = [
    {
      path: '/',
      label: 'Movies',
    },
    {
      path: '/tv',
      label: 'TV',
    },
    {
      path: '/games',
      label: 'Games',
    },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return (
        location.pathname === '/' || location.pathname.startsWith('/movie')
      );
    }
    return location.pathname.startsWith(path);
  };

  const getCurrentLabel = () => {
    const currentItem = navItems.find((item) => isActive(item.path));
    return currentItem?.label || 'Movies';
  };

  return (
    <div className='flex items-center gap-6'>
      <Link to='/' className='text-xl font-bold text-black'>
        MYVU
      </Link>

      <div className='relative' ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className='flex items-center gap-2 px-3 py-2 border-none bg-white hover:bg-gray-100 text-sm cursor-pointer'>
          <span>{getCurrentLabel()}</span>
          <svg
            className={`w-4 h-4 transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={1}
              d='M19 9l-7 7-7-7'
            />
          </svg>
        </button>

        {isOpen && (
          <div className='absolute top-full left-0 mt-1 bg-white border border-black min-w-full z-10'>
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2 text-sm hover:bg-gray-100 ${
                  isActive(item.path) ? 'bg-gray-100 font-medium' : ''
                }`}>
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
