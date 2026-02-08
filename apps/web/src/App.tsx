import { useState, useEffect } from 'react';
import { LogOut } from 'lucide-react';
import Login from './pages/login';
import { Chat } from './pages/chat';

const TOKEN_KEY = 'token';

export default function App() {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_KEY)
  );

  useEffect(() => {
    const onStorage = () => setToken(localStorage.getItem(TOKEN_KEY));
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  if (!token) return <Login />;

  return (
    <div className="min-h-screen p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Chat</h1>
        <button
          onClick={() => {
            localStorage.removeItem(TOKEN_KEY);
            setToken(null);
            window.dispatchEvent(new Event('storage'));
          }}
          className="text-sm text-gray-600 hover:underline"
        >
          <LogOut className="w-4 h-4" />
        </button>{' '}
        <p className="text-gray-500">LOG OUT</p>
      </div>
      <Chat />
    </div>
  );
}
