import { z } from 'zod';

// RAWG API Schema
export const gameSchema = z.object({
  id: z.number(),
  name: z.string(), // RAWG uses 'name' instead of 'title'
  background_image: z.string().nullable(),
  released: z.string().optional(),
  rating: z.number().optional(),
  rating_top: z.number().optional(), // RAWG's max rating (usually 5)
  playtime: z.number().optional(), // Average playtime in hours
  metacritic: z.number().nullable().optional(),
  genres: z
    .array(
      z.object({
        id: z.number(),
        name: z.string(),
      })
    )
    .optional(),
  platforms: z
    .array(
      z.object({
        platform: z.object({
          id: z.number(),
          name: z.string(),
        }),
      })
    )
    .optional(),
  description_raw: z.string().optional(), // Game description
  user_rating: z.number().nullable().optional(), // User's personal rating
});

export const gameSearchResponseSchema = z.object({
  results: z.array(gameSchema),
  count: z.number(), // RAWG uses 'count' instead of 'total_results'
  next: z.string().nullable(), // URL to next page
  previous: z.string().nullable(), // URL to previous page
});

// Typescript types
export type Game = z.infer<typeof gameSchema>;
export type GameSearchResponse = z.infer<typeof gameSearchResponseSchema>;
