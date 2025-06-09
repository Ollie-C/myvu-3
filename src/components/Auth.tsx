import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isSignUp) {
        await signUp(email, password);
        setError('Please check your email for a verification link');
      } else {
        await signIn(email, password);
        navigate('/');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-background-primary flex items-center justify-center px-4'>
      <div className='max-w-md w-full space-y-8'>
        <div>
          <h1 className='text-4xl font-bold text-text-primary text-center mb-2'>
            MYVU
          </h1>
          <h2 className='text-xl text-center text-text-tertiary'>
            {isSignUp ? 'Create your account' : 'Sign in to your account'}
          </h2>
        </div>

        <form className='mt-8 space-y-6' onSubmit={handleSubmit}>
          {error && (
            <div className='bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-4 text-sm'>
              {error}
            </div>
          )}

          <div className='space-y-4'>
            <div>
              <label htmlFor='email' className='sr-only'>
                Email address
              </label>
              <input
                id='email'
                name='email'
                type='email'
                autoComplete='email'
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className='w-full px-4 py-2 bg-surface-primary border-2 border-transparent rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-text-primary transition-colors'
                placeholder='Email address'
              />
            </div>

            <div>
              <label htmlFor='password' className='sr-only'>
                Password
              </label>
              <input
                id='password'
                name='password'
                type='password'
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className='w-full px-4 py-2 bg-surface-primary border-2 border-transparent rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-text-primary transition-colors'
                placeholder='Password'
              />
            </div>
          </div>

          <div>
            <button
              type='submit'
              disabled={isLoading}
              className='w-full flex justify-center py-2 px-4 bg-surface-primary hover:bg-surface-secondary text-text-primary rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-text-primary focus:ring-offset-2 focus:ring-offset-background-primary disabled:opacity-50 disabled:cursor-not-allowed'>
              {isLoading ? (
                <div className='animate-spin rounded-full h-6 w-6 border-2 border-text-primary border-t-transparent' />
              ) : isSignUp ? (
                'Sign up'
              ) : (
                'Sign in'
              )}
            </button>
          </div>

          <div className='text-center'>
            <button
              type='button'
              onClick={() => setIsSignUp(!isSignUp)}
              className='text-text-tertiary hover:text-text-primary transition-colors'>
              {isSignUp
                ? 'Already have an account? Sign in'
                : "Don't have an account? Sign up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
