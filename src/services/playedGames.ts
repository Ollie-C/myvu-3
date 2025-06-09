import { supabase } from '../supabase';
import type { Game } from '../types/rawg';

export async function addToPlayed(game: Game) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('User must be logged in');

  const { data, error } = await supabase
    .from('played_games')
    .upsert({
      id: game.id,
      name: game.name,
      background_image: game.background_image,
      description_raw: game.description_raw,
      released: game.released,
      rating: game.rating,
      metacritic: game.metacritic,
      playtime: game.playtime,
      added_at: new Date().toISOString(),
      user_id: user.id,
      user_rating: game.user_rating,
    })
    .select();

  if (error) throw error;
  return data;
}

export async function updateGameRating(gameId: number, rating: number) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('User must be logged in');

  const { error } = await supabase
    .from('played_games')
    .update({ user_rating: rating })
    .eq('id', gameId)
    .eq('user_id', user.id);

  if (error) throw error;
}

export async function removeFromPlayed(gameId: number) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('User must be logged in');

  const { error } = await supabase
    .from('played_games')
    .delete()
    .eq('id', gameId)
    .eq('user_id', user.id);

  if (error) throw error;
}

export async function getPlayedGames() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('played_games')
    .select('*')
    .eq('user_id', user.id)
    .order('added_at', { ascending: false });

  if (error) throw error;
  return data as Game[];
}

export async function isGamePlayed(gameId: number) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from('played_games')
    .select('id')
    .eq('id', gameId)
    .eq('user_id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return !!data;
}

export async function getPlayedGame(gameId: number) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('played_games')
    .select('*')
    .eq('id', gameId)
    .eq('user_id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data as Game | null;
}
