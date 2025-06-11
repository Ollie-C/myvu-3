import { useState, useRef, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  parseLetterboxdCSV,
  validateLetterboxdCSV,
  importFromLetterboxd,
  type ImportProgress,
  type ImportResult,
} from '../services/letterboxd/letterboxdImport';

interface LetterboxdImportProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LetterboxdImport({ isOpen, onClose }: LetterboxdImportProps) {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<ImportProgress | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const [showExportGuide, setShowExportGuide] = useState(false);

  // Use useCallback to ensure the progress handler doesn't cause re-renders
  const handleProgress = useCallback((newProgress: ImportProgress) => {
    setProgress({ ...newProgress });
  }, []);

  const importMutation = useMutation({
    mutationFn: async (csvContent: string) => {
      // Validate CSV
      const validation = validateLetterboxdCSV(csvContent);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Parse entries
      const entries = parseLetterboxdCSV(csvContent);
      if (entries.length === 0) {
        throw new Error('No movies found in the CSV file');
      }

      setStartTime(Date.now());

      // Import movies with optimized batching (5 concurrent requests)
      return importFromLetterboxd(entries, handleProgress, 5);
    },
    onSuccess: (result) => {
      setResult(result);
      queryClient.invalidateQueries({ queryKey: ['watchedMovies'] });
    },
    onError: (error) => {
      setError(error instanceof Error ? error.message : 'Import failed');
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setResult(null);
      setProgress(null);
      setStartTime(null);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    try {
      const csvContent = await file.text();
      importMutation.mutate(csvContent);
    } catch (error) {
      setError('Failed to read file');
    }
  };

  const handleClose = () => {
    setFile(null);
    setProgress(null);
    setResult(null);
    setError(null);
    setStartTime(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  // Calculate time estimates
  const getTimeEstimate = () => {
    if (!progress || !startTime || progress.processed === 0) return null;

    const elapsed = Date.now() - startTime;
    const avgTimePerMovie = elapsed / progress.processed;
    const remaining = progress.total - progress.processed;
    const estimatedTimeLeft = (remaining * avgTimePerMovie) / 1000; // in seconds

    if (estimatedTimeLeft < 60) {
      return `~${Math.round(estimatedTimeLeft)}s remaining`;
    } else {
      const minutes = Math.round(estimatedTimeLeft / 60);
      return `~${minutes}m remaining`;
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 font-retro'>
      <div className='bg-white border border-black max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
        <div className='p-6'>
          <div className='flex justify-between items-center mb-6'>
            <h2 className='text-2xl text-black font-bold'>
              Import from Letterboxd
            </h2>
            <button
              onClick={handleClose}
              className='text-black hover:bg-gray-100 p-2'
              disabled={importMutation.isPending}>
              ✕
            </button>
          </div>

          {!importMutation.isPending && !result && (
            <div className='space-y-4'>
              <button
                className='border border-black p-2 text-black bg-white hover:bg-gray-100 w-full text-left'
                onClick={() => setShowExportGuide(!showExportGuide)}>
                How to export from Letterboxd
              </button>
              {showExportGuide && (
                <div className='bg-gray-100 p-4 border border-gray-300'>
                  <ol className='list-decimal list-inside text-black space-y-1 text-sm'>
                    <li>Go to your Letterboxd profile settings</li>
                    <li>Click on "Import & Export"</li>
                    <li>Click "Export Your Data"</li>
                    <li>Download the ZIP file and extract it</li>
                    <li>Upload the "watched.csv" file below</li>
                  </ol>
                </div>
              )}

              <div>
                <label className='block text-black mb-2 font-medium'>
                  Select Letterboxd CSV file:
                </label>
                <input
                  ref={fileInputRef}
                  type='file'
                  accept='.csv'
                  onChange={handleFileChange}
                  className='w-full px-3 py-2 bg-white border border-black text-black file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-gray-100 file:text-black hover:file:bg-gray-200'
                />
              </div>

              {error && (
                <div className='bg-red-50 border border-red-400 text-red-700 p-4 text-sm'>
                  {error}
                </div>
              )}

              <div className='flex justify-end gap-3'>
                <button
                  onClick={handleClose}
                  className='px-4 py-2 text-black hover:bg-gray-100'>
                  Cancel
                </button>
                <button
                  onClick={handleImport}
                  disabled={!file}
                  className='px-6 py-2 bg-white border border-black text-black hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed'>
                  Import Movies
                </button>
              </div>
            </div>
          )}

          {importMutation.isPending && (
            <div className='space-y-6'>
              <div className='text-center'>
                <div className='flex items-center justify-center mb-4'>
                  <div className='text-black'>Loading...</div>
                </div>
                <h3 className='text-lg font-semibold text-black'>
                  Importing Movies...
                </h3>

                {progress && (
                  <>
                    <div className='mb-6 mt-4'>
                      <div className='flex justify-between text-sm text-gray-600 mb-2'>
                        <span>Progress</span>
                        <span>
                          {progress.processed} / {progress.total}
                        </span>
                      </div>
                      <div className='w-full bg-gray-200 h-3 border border-gray-300'>
                        <div
                          className='bg-black h-full transition-all duration-300 ease-out'
                          style={{
                            width: `${Math.max(
                              1,
                              (progress.processed / progress.total) * 100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>

                    {getTimeEstimate() && (
                      <p className='text-gray-600 text-sm'>
                        {getTimeEstimate()}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {result && (
            <div className='space-y-4'>
              <div className='text-center'>
                <div className='text-4xl mb-2'>🎉</div>
                <h3 className='text-lg font-semibold text-black mb-2'>
                  Import Complete!
                </h3>
                <p className='text-gray-600'>
                  Successfully imported {result.successful} movies to your
                  watched list
                </p>
              </div>

              {result.failed > 0 && (
                <div className='bg-yellow-50 border border-yellow-400 p-4 text-center'>
                  <p className='text-yellow-700 text-sm'>
                    {result.failed} movies could not be imported
                  </p>
                </div>
              )}

              <div className='flex justify-end'>
                <button
                  onClick={handleClose}
                  className='px-6 py-2 bg-white border border-black text-black hover:bg-gray-100'>
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
