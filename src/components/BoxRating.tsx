interface BoxRatingProps {
  rating: number;
  className?: string;
}

export function BoxRating({ rating, className = '' }: BoxRatingProps) {
  const maxRating = 10;
  const fullBoxes = Math.floor(rating);
  const decimal = rating - fullBoxes;

  return (
    <div
      className={`flex  gap-0.5 p-1 bg-white backdrop-blur-sm ${className} h-full`}>
      {Array.from({ length: maxRating }, (_, index) => {
        const boxNumber = index + 1;
        let boxOpacity = 0;

        if (boxNumber <= fullBoxes) {
          // Fully filled box
          boxOpacity = 1;
        } else if (boxNumber === fullBoxes + 1 && decimal > 0) {
          // Partially filled box based on decimal
          boxOpacity = decimal;
        }
        // else boxOpacity remains 0 (empty box)

        return (
          <div
            key={boxNumber}
            className='w-1.5 h-1.5 border border-black'
            style={{
              backgroundColor:
                boxOpacity > 0 ? `rgba(0, 0, 0, ${boxOpacity})` : 'transparent',
            }}
          />
        );
      })}
    </div>
  );
}
