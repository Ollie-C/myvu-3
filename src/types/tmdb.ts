import { z } from 'zod';

// TMDB API Schema
export const movieSchema = z.object({
  id: z.number(),
  title: z.string(),
  poster_path: z.string().nullable(),
  backdrop_path: z.string().nullable(),
  overview: z.string(),
  release_date: z.string().optional(),
  vote_average: z.number().optional(),
  runtime: z.number().optional(),
  genres: z
    .array(
      z.object({
        id: z.number(),
        name: z.string(),
      })
    )
    .optional(),
});

export const searchResponseSchema = z.object({
  results: z.array(movieSchema),
  page: z.number(),
  total_pages: z.number(),
  total_results: z.number(),
});

// Typescript types
export type Movie = z.infer<typeof movieSchema>;
export type SearchResponse = z.infer<typeof searchResponseSchema>;
