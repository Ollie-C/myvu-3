import { supabase } from '../supabase';
import type { Movie } from '../types/tmdb';

export async function addToWatched(movie: Movie) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('User must be logged in');

  const { data, error } = await supabase
    .from('watched_movies')
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
      rating: movie.rating,
    })
    .select();

  if (error) throw error;
  return data;
}

export async function updateMovieRating(movieId: number, rating: number) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('User must be logged in');

  const { error } = await supabase
    .from('watched_movies')
    .update({ rating })
    .eq('id', movieId)
    .eq('user_id', user.id);

  if (error) throw error;
}

export async function removeFromWatched(movieId: number) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('User must be logged in');

  const { error } = await supabase
    .from('watched_movies')
    .delete()
    .eq('id', movieId)
    .eq('user_id', user.id);

  if (error) throw error;
}

export async function getWatchedMovies() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('watched_movies')
    .select('*')
    .eq('user_id', user.id)
    .order('rating', { ascending: false, nullsFirst: false })
    .order('added_at', { ascending: false });

  if (error) throw error;
  return data as Movie[];
}

export async function isMovieWatched(movieId: number) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from('watched_movies')
    .select('id')
    .eq('id', movieId)
    .eq('user_id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return !!data;
}

export async function getWatchedMovie(movieId: number) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('watched_movies')
    .select('*')
    .eq('id', movieId)
    .eq('user_id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data as Movie | null;
}
