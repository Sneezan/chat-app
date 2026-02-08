import { createTRPCReact } from "@trpc/react-query";
import { httpLink } from "@trpc/client";
import type { AppRouter } from "../../api/src/router/_app";

const getToken = () => localStorage.getItem("token");

export const trpc = createTRPCReact<AppRouter>();

export function createTRPCClient() {
  return trpc.createClient({
    links: [
      httpLink({
        url: "http://localhost:3000/trpc",
        headers: () => (getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      }),
    ],
  });
}
