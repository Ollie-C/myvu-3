# MyVu

A React application to search and discover movies using the TMDB API.

## Technologies Used

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Tanstack Query
- Supabase
- Zod
- Typesense

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- TMDB API Key (get it from [https://www.themoviedb.org/settings/api](https://www.themoviedb.org/settings/api))

### Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   # or
   bun install
   ```
3. Create a `.env` file in the root directory with your TMDB API key:
   ```
   VITE_TMDB_API_KEY=your_tmdb_api_key_here
   ```
4. Start the development server:
   ```
   npm run dev
   # or
   bun dev
   ```

## Features

- Search for movies using the TMDB API
- Display movie posters in a responsive grid
- Settings button (functionality coming soon)

## Project Structure

- `src/components`: React components
- `src/services`: API services
- `src/types`: TypeScript types
