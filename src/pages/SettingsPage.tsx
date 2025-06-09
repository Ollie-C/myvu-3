import { useAuth } from '../context/AuthContext';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';

export default function SettingsPage() {
  const { signOut } = useAuth();

  return (
    <div className='min-h-screen bg-white text-black flex flex-col md:flex-row'>
      <Sidebar />
      <div className='flex-1 pb-12 md:pb-0 md:ml-12 flex flex-col'>
        <Header hideSearch={true} />
        <main className='flex-1 p-4'>
          <div className='max-w-md mx-auto mt-8'>
            <h1 className='text-2xl font-bold mb-8'>Settings</h1>

            <div className='space-y-4'>
              <button
                onClick={() => signOut()}
                className='w-full text-left p-3 border border-black hover:bg-gray-100'>
                Sign Out
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
