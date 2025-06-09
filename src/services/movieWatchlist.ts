import { supabase } from '../supabase';
import type { Movie } from '../types/tmdb';

export async function addToWatchlist(movie: Movie) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('User must be logged in');

  const { data, error } = await supabase
    .from('movie_watchlist')
    .upsert({
      id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path,
      overview: movie.overview,
      release_date: movie.release_date,
      vote_average: movie.vote_average,
      backdrop_path: movie.backdrop_path,
      added_at: new Date().toISOString(),
      user_id: user.id,
    })
    .select();

  if (error) throw error;
  return data;
}

export async function removeFromWatchlist(movieId: number) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('User must be logged in');

  const { error } = await supabase
    .from('movie_watchlist')
    .delete()
    .eq('id', movieId)
    .eq('user_id', user.id);

  if (error) throw error;
}

export async function getWatchlistMovies() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('movie_watchlist')
    .select('*')
    .eq('user_id', user.id)
    .order('added_at', { ascending: false });

  if (error) throw error;
  return data as Movie[];
}

export async function isMovieInWatchlist(movieId: number) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from('movie_watchlist')
    .select('id')
    .eq('id', movieId)
    .eq('user_id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return !!data;
}

export async function getWatchlistMovie(movieId: number) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('movie_watchlist')
    .select('*')
    .eq('id', movieId)
    .eq('user_id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data as Movie | null;
}
