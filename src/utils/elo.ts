export function calculateElo(
  ratingA: number,
  ratingB: number,
  winner: 'A' | 'B',
  k = 0.5 // Much smaller K-factor for 0-10 scale
): { newRatingA: number; newRatingB: number } {
  // Scale ratings to traditional ELO range for calculation (multiply by 200, add 200)
  // This maps 0-10 to 200-2200
  const scaledRatingA = ratingA * 200 + 200;
  const scaledRatingB = ratingB * 200 + 200;

  const expectedA = 1 / (1 + 10 ** ((scaledRatingB - scaledRatingA) / 400));
  const expectedB = 1 / (1 + 10 ** ((scaledRatingA - scaledRatingB) / 400));

  const scoreA = winner === 'A' ? 1 : 0;
  const scoreB = winner === 'B' ? 1 : 0;

  const newScaledRatingA = scaledRatingA + k * 200 * (scoreA - expectedA);
  const newScaledRatingB = scaledRatingB + k * 200 * (scoreB - expectedB);

  // Scale back to 0-10 range (subtract 200, divide by 200)
  const newRatingA = Math.max(0, Math.min(10, (newScaledRatingA - 200) / 200));
  const newRatingB = Math.max(0, Math.min(10, (newScaledRatingB - 200) / 200));

  return { newRatingA, newRatingB };
}
