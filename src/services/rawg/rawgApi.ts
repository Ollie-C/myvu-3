import {
  gameSearchResponseSchema,
  type GameSearchResponse,
  gameSchema,
  type Game,
} from '../../types/rawg';

const RAWG_API_KEY = import.meta.env.VITE_RAWG_API_KEY;
const RAWG_BASE_URL = 'https://api.rawg.io/api';

export async function searchGames(query: string): Promise<GameSearchResponse> {
  if (!query.trim()) {
    return { results: [], count: 0, next: null, previous: null };
  }

  const url = new URL(`${RAWG_BASE_URL}/games`);
  url.searchParams.append('key', RAWG_API_KEY);
  url.searchParams.append('search', query);
  url.searchParams.append('page_size', '20');

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`RAWG API error: ${response.status}`);
  }

  const data = await response.json();
  console.log(data);
  return gameSearchResponseSchema.parse(data);
}

export async function getGameDetails(id: number): Promise<Game> {
  const url = new URL(`${RAWG_BASE_URL}/games/${id}`);
  url.searchParams.append('key', RAWG_API_KEY);

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`RAWG API error: ${response.status}`);
  }

  const data = await response.json();
  return gameSchema.parse(data);
}

export async function getPopularGames(): Promise<GameSearchResponse> {
  const url = new URL(`${RAWG_BASE_URL}/games`);
  url.searchParams.append('key', RAWG_API_KEY);
  url.searchParams.append('ordering', '-rating');
  url.searchParams.append('page_size', '20');

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`RAWG API error: ${response.status}`);
  }

  const data = await response.json();
  return gameSearchResponseSchema.parse(data);
}

export function getGameImageUrl(imagePath: string | null): string {
  if (!imagePath) {
    return '/placeholder-game.jpg';
  }
  return imagePath;
}

export function formatPlatforms(platforms: Game['platforms']): string {
  if (!platforms || platforms.length === 0) {
    return 'Unknown platforms';
  }

  const platformNames = platforms.slice(0, 3).map((p) => p.platform.name);
  const remaining = platforms.length - 3;

  if (remaining > 0) {
    return `${platformNames.join(', ')} +${remaining} more`;
  }

  return platformNames.join(', ');
}
