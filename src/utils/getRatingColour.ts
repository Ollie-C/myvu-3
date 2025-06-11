export const getRatingColour = (rating: number = 0): string => {
  const shades = [
    '#fff7e0', // 0
    '#fff0b3', // 1
    '#ffe680', // 2
    '#ffdb4d', // 3
    '#ffd11a', // 4
    '#ffc107', // 5
    '#ffb300', // 6
    '#ffa000', // 7
    '#ff8f00', // 8
    '#ff6f00', // 9
    '#ff5722', // 10
  ];
  const index = Math.min(10, Math.max(0, Math.round(rating)));
  return shades[index];
};
