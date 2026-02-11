import { TRPCError } from '@trpc/server';
import { tracked } from '@trpc/server';
import { z } from 'zod';
import { emitNewMessage, toMessageIterable } from '../events.js';
import { protectedProcedure, router } from '../trpc.js';

export const messagesRouter = router({
  list: protectedProcedure
    .input(z.object({ threadId: z.number() }))
    .query(async ({ ctx, input }) => {
      const participant = await ctx.db.threadParticipant.findUnique({
        where: {
          threadId_userId: { threadId: input.threadId, userId: ctx.user.id },
        },
      });
      if (!participant) throw new TRPCError({ code: 'FORBIDDEN' });

      const messages = await ctx.db.message.findMany({
        where: { threadId: input.threadId },
        orderBy: { createdAt: 'asc' },
        include: { sender: { select: { id: true, username: true } } },
      });
      return messages;
    }),

  send: protectedProcedure
    .input(z.object({ threadId: z.number(), content: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const participant = await ctx.db.threadParticipant.findUnique({
        where: {
          threadId_userId: { threadId: input.threadId, userId: ctx.user.id },
        },
      });
      if (!participant) throw new TRPCError({ code: 'FORBIDDEN' });

      const message = await ctx.db.message.create({
        data: {
          threadId: input.threadId,
          senderId: ctx.user.id,
          content: input.content,
        },
        include: { sender: { select: { id: true, username: true } } },
      });

      const participants = await ctx.db.threadParticipant.findMany({
        where: { threadId: input.threadId },
        select: { userId: true },
      });
      emitNewMessage(
        input.threadId,
        message,
        participants.map((p) => p.userId)
      );
      return message;
    }),

  onNewMessage: protectedProcedure
    .input(
      z.object({
        threadId: z.number(),
        lastEventId: z.string().nullish(),
      })
    )
    .subscription(async function* (opts) {
      const participant = await opts.ctx.db.threadParticipant.findUnique({
        where: {
          threadId_userId: { threadId: opts.input.threadId, userId: opts.ctx.user.id },
        },
      });
      if (!participant) throw new TRPCError({ code: 'FORBIDDEN' });

      const iterable = toMessageIterable(opts.signal);

      for await (const [threadId, message] of iterable) {
        if (threadId !== opts.input.threadId) continue;
        yield tracked(message.id, message);
      }
    }),
});
