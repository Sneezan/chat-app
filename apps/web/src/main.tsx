import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { trpc, createTRPCClient } from './trpc';
import './index.css';
import App from './App.tsx';

const queryClient = new QueryClient();

export default function Root() {
  const [trpcClient] = useState(() => createTRPCClient());

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter future={{ v7_startTransition: true }}>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </trpc.Provider>
  );
}

const root = createRoot(document.getElementById('root')!);
root.render(
  <StrictMode>
    <Root />
  </StrictMode>
);
