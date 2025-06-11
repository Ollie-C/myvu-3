import { useState } from 'react';

interface RankingButtonProps {
  onRankingModeChange: (mode: string | null) => void;
  currentMode: string | null;
}

export function RankingButton({
  onRankingModeChange,
  currentMode,
}: RankingButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const rankingMethods = [
    { id: 'manual', label: 'Manual', enabled: true },
    { id: 'versus', label: 'Versus', enabled: true },
    { id: 'tiers', label: 'Tiers', enabled: false },
    { id: 'custom', label: 'Custom', enabled: false },
  ];

  const handleMethodSelect = (methodId: string) => {
    if (currentMode === methodId) {
      // If already in this mode, turn off ranking mode
      onRankingModeChange(null);
      setIsExpanded(false);
    } else {
      onRankingModeChange(methodId);
      setIsExpanded(false);
    }
  };

  const handleMainButtonClick = () => {
    if (currentMode) {
      // If in ranking mode, turn it off
      onRankingModeChange(null);
    } else {
      // If not in ranking mode, expand to show options
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div className='fixed bottom-4 right-4 md:bottom-6 md:right-6 z-20'>
      <div className='flex items-center gap-2'>
        {/* Ranking method buttons - slide in from right */}
        <div
          className={`flex items-center gap-2 transition-all duration-300 overflow-hidden ${
            isExpanded ? 'w-auto opacity-100' : 'w-0 opacity-0'
          }`}>
          {rankingMethods.map((method) => (
            <button
              key={method.id}
              onClick={() => method.enabled && handleMethodSelect(method.id)}
              disabled={!method.enabled}
              className={`px-3 py-2 text-sm border border-black bg-white hover:bg-gray-100 whitespace-nowrap transition-colors ${
                !method.enabled
                  ? 'opacity-50 cursor-not-allowed'
                  : 'cursor-pointer'
              } ${currentMode === method.id ? 'bg-black text-white' : ''}`}>
              {method.label}
            </button>
          ))}
        </div>

        {/* Main ranking button */}
        <button
          onClick={handleMainButtonClick}
          className={`px-4 py-2 border border-black bg-white hover:bg-gray-100 font-medium transition-colors ${
            currentMode ? 'bg-black text-white' : ''
          }`}>
          {currentMode
            ? `${
                currentMode.charAt(0).toUpperCase() + currentMode.slice(1)
              } Mode`
            : 'Rank'}
        </button>
      </div>
    </div>
  );
}
