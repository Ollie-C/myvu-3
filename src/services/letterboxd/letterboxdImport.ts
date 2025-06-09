import Papa from 'papaparse';
import { searchMovies } from '../tmdb/tmdbApi';
import { addToWatched } from '../watchedMovies';
import type { Movie } from '../../types/tmdb';

export interface LetterboxdEntry {
  Name: string;
  Year: string;
  'Letterboxd URI': string;
  Rating: string;
  Rewatch: string;
  Tags: string;
  'Watched Date': string;
}

export interface ImportProgress {
  total: number;
  processed: number;
  successful: number;
  failed: number;
  currentBatch: number;
  totalBatches: number;
  currentMovies: string[];
  errors: string[];
}

export interface ImportResult {
  successful: number;
  failed: number;
  errors: string[];
  debugInfo?: {
    totalParsed: number;
    duplicatesSkipped: number;
    apiFailures: number;
    dbFailures: number;
    totalBatches: number;
    avgBatchTime: number;
  };
}

export function parseLetterboxdCSV(csvContent: string): LetterboxdEntry[] {
  const parseResult = Papa.parse<LetterboxdEntry>(csvContent, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header: string) => {
      const normalized = header.trim().replace(/"/g, '');
      const headerMap: Record<string, string> = {
        name: 'Name',
        year: 'Year',
        'letterboxd uri': 'Letterboxd URI',
        rating: 'Rating',
        rewatch: 'Rewatch',
        tags: 'Tags',
        'watched date': 'Watched Date',
      };
      return headerMap[normalized.toLowerCase()] || normalized;
    },
    transform: (value: string) => value.trim(),
  });

  if (parseResult.errors.length > 0) {
    console.warn('CSV parsing errors:', parseResult.errors);
  }

  const entries = parseResult.data.filter((entry) => {
    return entry.Name && entry.Name.trim() !== '';
  });

  return entries;
}

/**
 * Convert Letterboxd rating to 0-10 scale
 */
function convertRating(letterboxdRating: string): number {
  if (!letterboxdRating || letterboxdRating === '') return 0;

  // Letterboxd uses 0.5-5.0 star rating, convert to 0-10
  const stars = parseFloat(letterboxdRating);
  return stars * 2;
}

/**
 * Search for movie on TMDB using title and year
 */
async function findMovieOnTMDB(
  title: string,
  year: string
): Promise<Movie | null> {
  try {
    // First try with year
    const searchQuery = year ? `${title} ${year}` : title;
    const results = await searchMovies(searchQuery);

    if (results.results.length === 0) {
      // Try without year if no results
      if (year) {
        const fallbackResults = await searchMovies(title);
        if (fallbackResults.results.length > 0) {
          return fallbackResults.results[0];
        }
      }
      return null;
    }

    // Find best match (prefer exact year match)
    if (year) {
      const exactYearMatch = results.results.find((movie: Movie) =>
        movie.release_date?.startsWith(year)
      );
      if (exactYearMatch) return exactYearMatch;
    }

    // Return first result if no exact year match
    return results.results[0];
  } catch (error) {
    console.error(`Error searching for movie "${title}":`, error);
    return null;
  }
}

/**
 * Process a single movie entry
 */
async function processMovieEntry(
  entry: LetterboxdEntry,
  processedMovieIds: Set<number>
): Promise<{
  success: boolean;
  movie?: Movie;
  error?: string;
  duplicate?: boolean;
}> {
  try {
    // Find movie on TMDB
    const movie = await findMovieOnTMDB(entry.Name, entry.Year);

    if (!movie) {
      return {
        success: false,
        error: `Movie not found: ${entry.Name} (${entry.Year})`,
      };
    }

    // Check for duplicates
    if (processedMovieIds.has(movie.id)) {
      return {
        success: true,
        duplicate: true,
        movie,
      };
    }

    processedMovieIds.add(movie.id);

    // Add rating from Letterboxd
    const rating = convertRating(entry.Rating);
    const movieWithRating: Movie = {
      ...movie,
      rating: rating > 0 ? rating : undefined,
    };

    // Add to watched list
    await addToWatched(movieWithRating);

    return {
      success: true,
      movie: movieWithRating,
    };
  } catch (error) {
    return {
      success: false,
      error: `Error processing ${entry.Name}: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
    };
  }
}

/**
 * Create batches of entries for concurrent processing
 */
function createBatches<T>(array: T[], batchSize: number): T[][] {
  const batches: T[][] = [];
  for (let i = 0; i < array.length; i += batchSize) {
    batches.push(array.slice(i, i + batchSize));
  }
  return batches;
}

/**
 * Process a batch of movie entries with concurrency control
 */
async function processBatch(
  batch: LetterboxdEntry[],
  processedMovieIds: Set<number>
): Promise<{
  successful: number;
  failed: number;
  duplicates: number;
  errors: string[];
}> {
  const promises = batch.map((entry) =>
    processMovieEntry(entry, processedMovieIds)
  );

  const results = await Promise.allSettled(promises);

  let successful = 0;
  let failed = 0;
  let duplicates = 0;
  const errors: string[] = [];

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      const { success, error, duplicate } = result.value;
      if (success) {
        if (duplicate) {
          duplicates++;
        } else {
          successful++;
        }
      } else {
        failed++;
        if (error) errors.push(error);
      }
    } else {
      failed++;
      errors.push(
        `Unexpected error processing ${batch[index].Name}: ${result.reason}`
      );
    }
  });

  return { successful, failed, duplicates, errors };
}

/**
 * Import movies from Letterboxd entries with optimized batching and concurrency
 */
export async function importFromLetterboxd(
  entries: LetterboxdEntry[],
  onProgress?: (progress: ImportProgress) => void,
  concurrency: number = 5
): Promise<ImportResult> {
  const startTime = Date.now();
  const batches = createBatches(entries, concurrency);
  const batchTimes: number[] = [];

  const result: ImportResult = {
    successful: 0,
    failed: 0,
    errors: [],
    debugInfo: {
      totalParsed: entries.length,
      duplicatesSkipped: 0,
      apiFailures: 0,
      dbFailures: 0,
      totalBatches: batches.length,
      avgBatchTime: 0,
    },
  };

  const progress: ImportProgress = {
    total: entries.length,
    processed: 0,
    successful: 0,
    failed: 0,
    currentBatch: 0,
    totalBatches: batches.length,
    currentMovies: [],
    errors: [],
  };

  console.log(
    `Starting optimized import of ${entries.length} movies in ${batches.length} batches (concurrency: ${concurrency})`
  );

  const processedMovieIds = new Set<number>();

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    const batchStartTime = Date.now();

    progress.currentBatch = i + 1;
    progress.currentMovies = batch.map((entry) => entry.Name);

    console.log(
      `Processing batch ${i + 1}/${batches.length} (${batch.length} movies)`
    );

    try {
      const batchResult = await processBatch(batch, processedMovieIds);

      // Update results
      result.successful += batchResult.successful;
      result.failed += batchResult.failed;
      result.errors.push(...batchResult.errors);
      result.debugInfo!.duplicatesSkipped += batchResult.duplicates;

      // Update progress
      progress.processed += batch.length;
      progress.successful = result.successful;
      progress.failed = result.failed;
      progress.errors = result.errors;

      const batchTime = Date.now() - batchStartTime;
      batchTimes.push(batchTime);

      console.log(
        `Batch ${i + 1} completed in ${batchTime}ms: ${
          batchResult.successful
        } successful, ${batchResult.failed} failed, ${
          batchResult.duplicates
        } duplicates`
      );

      // Report progress
      onProgress?.(progress);

      // Small delay between batches to be respectful to the API
      if (i < batches.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 250));
      }
    } catch (error) {
      console.error(`Error processing batch ${i + 1}:`, error);
      const errorMsg = `Batch ${i + 1} failed: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`;
      result.errors.push(errorMsg);
      progress.errors.push(errorMsg);
      result.failed += batch.length;
      progress.failed = result.failed;
      progress.processed += batch.length;
    }
  }

  // Calculate average batch time
  if (batchTimes.length > 0) {
    result.debugInfo!.avgBatchTime =
      batchTimes.reduce((sum, time) => sum + time, 0) / batchTimes.length;
  }

  const totalTime = Date.now() - startTime;
  console.log(`Import completed in ${totalTime}ms. Results:`, {
    successful: result.successful,
    failed: result.failed,
    duplicates: result.debugInfo!.duplicatesSkipped,
    avgBatchTime: Math.round(result.debugInfo!.avgBatchTime),
  });

  return result;
}

/**
 * Validate Letterboxd CSV format using papaparse
 */
export function validateLetterboxdCSV(csvContent: string): {
  valid: boolean;
  error?: string;
} {
  try {
    // Quick parse to check format
    const parseResult = Papa.parse(csvContent, {
      header: true,
      preview: 1, // Only parse first row to check headers
    });

    if (parseResult.errors.length > 0) {
      const criticalErrors = parseResult.errors.filter(
        (error) => error.type === 'Delimiter' || error.type === 'Quotes'
      );
      if (criticalErrors.length > 0) {
        return {
          valid: false,
          error: `CSV format error: ${criticalErrors[0].message}`,
        };
      }
    }

    if (!parseResult.meta.fields || parseResult.meta.fields.length === 0) {
      return {
        valid: false,
        error: 'CSV file appears to have no headers',
      };
    }

    // Check for required headers (case-insensitive)
    const headers = parseResult.meta.fields.map((h) => h.toLowerCase().trim());
    const hasNameColumn = headers.some((h) => h.includes('name'));

    if (!hasNameColumn) {
      return {
        valid: false,
        error:
          'Missing required column: Name. Make sure this is a Letterboxd export file.',
      };
    }

    if (parseResult.data.length === 0) {
      return {
        valid: false,
        error: 'CSV file appears to be empty or has no data rows',
      };
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: 'Invalid CSV format. Please check your file.',
    };
  }
}
