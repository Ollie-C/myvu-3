import {
  searchResponseSchema,
  type SearchResponse,
  movieSchema,
  type Movie,
} from '../types/tmdb';

// TMDB API configuration
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

/**
 * Search for movies by query
 */
export async function searchMovies(query: string): Promise<SearchResponse> {
  if (!query.trim()) {
    return { results: [], page: 1, total_pages: 0, total_results: 0 };
  }

  const url = new URL(`${TMDB_BASE_URL}/search/movie`);
  url.searchParams.append('api_key', TMDB_API_KEY);
  url.searchParams.append('query', query);
  url.searchParams.append('include_adult', 'false');
  url.searchParams.append('language', 'en-US');
  url.searchParams.append('page', '1');

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status}`);
  }

  const data = await response.json();
  return searchResponseSchema.parse(data);
}

/**
 * Get movie details by ID
 */
export async function getMovieDetails(id: number): Promise<Movie> {
  const url = new URL(`${TMDB_BASE_URL}/movie/${id}`);
  url.searchParams.append('api_key', TMDB_API_KEY);
  url.searchParams.append('language', 'en-US');
  url.searchParams.append('append_to_response', 'images');

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status}`);
  }

  const data = await response.json();
  return movieSchema.parse(data);
}

/**
 * Get the full image URL for a poster path
 */
export function getPosterUrl(posterPath: string | null): string {
  if (!posterPath) {
    return '/placeholder-poster.jpg';
  }
  return `https://image.tmdb.org/t/p/w500${posterPath}`;
}

/**
 * Get the full image URL for a backdrop path
 */
export function getBackdropUrl(backdropPath: string | null): string {
  if (!backdropPath) {
    return '/placeholder-backdrop.jpg';
  }
  return `https://image.tmdb.org/t/p/original${backdropPath}`;
}
