import { useState } from 'react';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number) => void;
  initialRating?: number;
}

export function RatingModal({
  isOpen,
  onClose,
  onSubmit,
  initialRating = 0,
}: RatingModalProps) {
  const [rating, setRating] = useState(initialRating);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(rating);
    onClose();
  };

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
      <div className='bg-[#161616] p-6 rounded-lg shadow-xl max-w-sm w-full mx-4'>
        <h2 className='text-xl font-bold text-white mb-4'>Rate this movie</h2>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label htmlFor='rating' className='block text-gray-300 mb-2'>
              Your Rating (0-10):
            </label>
            <input
              type='number'
              id='rating'
              min='0'
              max='10'
              step='0.1'
              value={rating}
              onChange={(e) => setRating(parseFloat(e.target.value))}
              className='w-full px-3 py-2 bg-[#424343] text-white rounded-md focus:outline-none focus:ring-1 focus:ring-white'
              placeholder='0.0'
            />
          </div>
          <div className='flex justify-end gap-2'>
            <button
              type='button'
              onClick={onClose}
              className='px-4 py-2 text-gray-300 hover:text-white transition-colors'>
              Cancel
            </button>
            <button
              type='submit'
              className='px-4 py-2 bg-[#424343] text-white rounded-md hover:bg-[#525252] transition-colors'>
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
