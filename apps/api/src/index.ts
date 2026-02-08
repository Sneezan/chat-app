import "dotenv/config";
import express from "express";
import cors from "cors";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "./router/_app";
import { createContext } from "./trpc";

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(cors({ origin: true }));
app.use(express.json());

app.use(
  "/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
