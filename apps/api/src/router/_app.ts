import { router } from '../trpc';
import { loginRouter } from './login';
import { threadsRouter } from './threads';
import { messagesRouter } from './messages';

export const appRouter = router({
  auth: loginRouter,
  thread: threadsRouter,
  message: messagesRouter,
});

export type AppRouter = typeof appRouter;
