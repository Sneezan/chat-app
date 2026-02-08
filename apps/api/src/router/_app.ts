import { router } from "../trpc";

export const appRouter = router({
// todo auth, thread & message
});

export type AppRouter = typeof appRouter;