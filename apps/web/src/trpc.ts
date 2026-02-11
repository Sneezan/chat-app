import { createTRPCReact } from '@trpc/react-query';
import {
  httpBatchLink,
  httpSubscriptionLink,
  splitLink,
} from '@trpc/client';
import { EventSourcePolyfill } from 'event-source-polyfill';
import type { AppRouter } from '../../api/src/router/_app';

const API_URL = 'http://localhost:3000/trpc';

const getToken = () => localStorage.getItem('token');

export const trpc = createTRPCReact<AppRouter>();

export const trpcClient = trpc.createClient({
  links: [
    splitLink({
      condition: (op) => op.type === 'subscription',
      true: httpSubscriptionLink({
        url: API_URL,
        EventSource: EventSourcePolyfill,
        eventSourceOptions() {
          const token = getToken();
          return {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          };
        },
      }),
      false: httpBatchLink({
        url: API_URL,
        headers() {
          const token = getToken();
          return token ? { Authorization: `Bearer ${token}` } : {};
        },
      }),
    }),
  ],
});
