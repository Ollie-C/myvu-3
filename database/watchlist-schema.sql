-- Create movie_watchlist table
CREATE TABLE movie_watchlist (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  poster_path TEXT,
  overview TEXT,
  release_date TEXT,
  vote_average REAL,
  backdrop_path TEXT,
  added_at TIMESTAMP DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  UNIQUE(id, user_id)
);

-- Enable RLS (Row Level Security)
ALTER TABLE movie_watchlist ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to only see their own watchlist items
CREATE POLICY "Users can view their own watchlist" ON movie_watchlist
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own watchlist items
CREATE POLICY "Users can insert their own watchlist" ON movie_watchlist
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own watchlist items
CREATE POLICY "Users can update their own watchlist" ON movie_watchlist
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own watchlist items
CREATE POLICY "Users can delete their own watchlist" ON movie_watchlist
  FOR DELETE USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_movie_watchlist_user_id ON movie_watchlist(user_id);
CREATE INDEX idx_movie_watchlist_added_at ON movie_watchlist(added_at); 