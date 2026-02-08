import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { sign, verify } from '../auth.js';
import { protectedProcedure, publicProcedure, router } from '../trpc';

const loginInput = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const loginRouter = router({
  me: protectedProcedure.query(({ ctx }) => ctx.user),

  login: publicProcedure.input(loginInput).mutation(async ({ ctx, input }) => {
    const user = await ctx.db.user.findUnique({
      where: { username: input.username },
    });
    if (!user || !(await verify(input.password, user.password))) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Invalid username or password',
      });
    }
    const token = await sign({ userId: user.id, username: user.username });
    return { token, user: { id: user.id, username: user.username } };
  }),
});
