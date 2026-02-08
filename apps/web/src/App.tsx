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

  if (!token)
    return (
      <Login onSuccess={() => setToken(localStorage.getItem(TOKEN_KEY))} />
    );

  return (
    <div className="min-h-screen p-4 flex flex-col">
      <div className="flex justify-between items-center mb-4 shrink-0">
        <h1 className="text-xl font-semibold">Chat</h1>
        <button
          onClick={() => {
            localStorage.removeItem(TOKEN_KEY);
            setToken(null);
            window.dispatchEvent(new Event('storage'));
          }}
          className="text-sm text-grey-400 hover:text-cyan-600"
        >
          <LogOut className="w-6 h-6 cursor-pointer" />
        </button>
      </div>
      <div className="flex-1 flex items-center justify-center min-h-0">
        <Chat />
      </div>
    </div>
  );
}
