import { Navigate } from 'react-router-dom';
import { Auth } from '../components/Auth';
import { useAuth } from '../context/AuthContext';

export default function AuthPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className='min-h-screen bg-background-primary flex items-center justify-center'>
        <div className='animate-spin rounded-full h-12 w-12 border-2 border-text-primary border-t-transparent'></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to='/' replace />;
  }

  return <Auth />;
}
