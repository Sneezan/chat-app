import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { toThreadListUpdateIterable } from '../events.js';
import { protectedProcedure, router } from '../trpc.js';

export const threadsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const threads = await ctx.db.thread.findMany({
      where: { participants: { some: { userId: ctx.user.id } } },
      orderBy: { createdAt: 'desc' },
      include: {
        participants: {
          include: { user: { select: { id: true, username: true } } },
        },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });
    return threads.map((t) => {
      const other = t.participants.find((p) => p.user.id !== ctx.user.id)?.user;
      return {
        id: t.id,
        createdAt: t.createdAt,
        otherUsername: other?.username ?? '?',
        lastMessage: t.messages[0] ?? null,
      };
    });
  }),

  create: protectedProcedure
    .input(z.object({ username: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      if (input.username === ctx.user.username) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot message yourself',
        });
      }
      const other = await ctx.db.user.findUnique({
        where: { username: input.username },
      });
      if (!other)
        throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });

      const existing = await ctx.db.thread.findFirst({
        where: {
          participants: { some: { userId: ctx.user.id } },
          AND: [{ participants: { some: { userId: other.id } } }],
        },
        include: { participants: true },
      });
      if (existing && existing.participants.length === 2) return existing;

      const thread = await ctx.db.thread.create({
        data: {
          participants: {
            createMany: {
              data: [{ userId: ctx.user.id }, { userId: other.id }],
            },
          },
        },
      });
      return thread;
    }),

  onThreadListUpdate: protectedProcedure.subscription(async function* (opts) {
    const iterable = toThreadListUpdateIterable(opts.ctx.user.id, opts.signal);
    for await (const _ of iterable) {
      yield null;
    }
  }),
});
