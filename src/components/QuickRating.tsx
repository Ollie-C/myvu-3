import { useState } from 'react';
import { BoxRating } from './BoxRating';

interface QuickRatingProps {
  movie: {
    id: number;
    title: string;
    rating?: number | null;
  };
  onRatingChange: (movieId: number, rating: number) => void;
  onClose: () => void;
}

export function QuickRating({
  movie,
  onRatingChange,
  onClose,
}: QuickRatingProps) {
  const [currentRating, setCurrentRating] = useState(movie.rating || 5);

  const handleRatingChange = (change: number) => {
    const newRating = Math.max(0, Math.min(10, currentRating + change));
    setCurrentRating(newRating);
  };

  const handleSubmit = () => {
    onRatingChange(movie.id, currentRating);
    onClose();
  };

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white border border-black p-6 max-w-sm w-full'>
        <h3 className='text-lg font-bold mb-4 text-center'>{movie.title}</h3>

        <div className='flex items-center justify-center gap-6 mb-6'>
          {/* Decrease button */}
          <button
            onClick={() => handleRatingChange(-0.1)}
            className='w-8 h-8 border border-black bg-white hover:bg-gray-100 flex items-center justify-center text-lg'>
            ←
          </button>

          {/* Current rating display */}
          <div className='flex items-center gap-4'>
            <BoxRating rating={currentRating} className='h-20' />
            <div className='text-center'>
              <div className='text-2xl font-bold'>
                {currentRating.toFixed(1)}
              </div>
              <div className='text-xs text-gray-500'>out of 10</div>
            </div>
          </div>

          {/* Increase button */}
          <button
            onClick={() => handleRatingChange(0.1)}
            className='w-8 h-8 border border-black bg-white hover:bg-gray-100 flex items-center justify-center text-lg'>
            →
          </button>
        </div>

        {/* Quick rating buttons */}
        <div className='grid grid-cols-5 gap-2 mb-4'>
          {[2, 4, 6, 8, 10].map((rating) => (
            <button
              key={rating}
              onClick={() => setCurrentRating(rating)}
              className={`py-2 text-sm border border-black hover:bg-gray-100 ${
                currentRating === rating ? 'bg-black text-white' : 'bg-white'
              }`}>
              {rating}
            </button>
          ))}
        </div>

        {/* Action buttons */}
        <div className='flex gap-3'>
          <button
            onClick={onClose}
            className='flex-1 py-2 px-4 border border-black bg-white hover:bg-gray-100'>
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className='flex-1 py-2 px-4 bg-black text-white hover:bg-gray-800'>
            Save Rating
          </button>
        </div>
      </div>
    </div>
  );
}
