import { useState } from 'react';
import { TRPCClientError } from '@trpc/client';
import { trpc } from '../../trpc';
import { useNavigate } from 'react-router-dom';

const TOKEN_KEY = 'token';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const login = trpc.auth.login.useMutation({
    onSuccess: (res) => {
      localStorage.setItem(TOKEN_KEY, res.token);
      navigate('/chat');
    },
    onError: (err: unknown) => {
      setError(err instanceof TRPCClientError ? err.message : 'Login failed');
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    login.mutate({ username, password });
  };

  const disabled = login.isPending || !username || !password;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-md w-72"
      >
        <h1 className="text-xl font-semibold mb-4">Log in</h1>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full border rounded px-3 py-2 mb-2"
          autoComplete="username"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded px-3 py-2 mb-3"
          autoComplete="current-password"
        />

        {error && <p className="text-red-600 text-sm mb-2">{error}</p>}

        <button
          type="submit"
          disabled={disabled}
          className="w-full bg-blue-600 text-white rounded py-2 disabled:opacity-50"
        >
          {login.isPending ? '…' : 'Log in'}
        </button>
      </form>
    </div>
  );
}
