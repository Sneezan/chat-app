import { TRPCError } from '@trpc/server';
import { z } from 'zod';
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

      return ctx.db.message.create({
        data: {
          threadId: input.threadId,
          senderId: ctx.user.id,
          content: input.content,
        },
        include: { sender: { select: { id: true, username: true } } },
      });
    }),
});
