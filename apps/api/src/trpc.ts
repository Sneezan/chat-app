import { TRPCError } from "@trpc/server";
import { initTRPC } from "@trpc/server";
import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { parse } from "./auth.js";
import { db } from "./db";

export const createContext = async ({ req, res }: CreateExpressContextOptions) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "") ?? null;
  const payload = token ? await parse(token) : null;
  const user = payload
    ? await db.user.findUnique({ where: { id: payload.userId }, select: { id: true, username: true } })
    : null;
  return { req, res, db, user };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create();
export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
  return next({ ctx: { ...ctx, user: ctx.user } });
});
