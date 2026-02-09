# Chat app

A small protoype of messaging app (DMs & threads) built with React, tRPC, and PostgreSQL.

### Preview

 <img width="724" height="600" alt="Screenshot 2026-02-08 at 19 06 48 (2)" src="https://github.com/user-attachments/assets/ea0c79dc-92f4-426b-9b93-b32a01f5691a" />

## Technologies used

| Layer          | Tech                                                                                                      |
| -------------- | --------------------------------------------------------------------------------------------------------- |
| **Frontend**   | React 19, TypeScript, Vite, Tailwind CSS 4, React Router, TanStack React Query, tRPC client, Lucide React |
| **Backend**    | Node.js, Express, tRPC (server), TypeScript                                                               |
| **API**        | tRPC (end-to-end type-safe)                                                                               |
| **Database**   | PostgreSQL, Prisma ORM                                                                                    |
| **Auth**       | JWT (jose), bcrypt                                                                                        |
| **Validation** | Zod                                                                                                       |
| **Monorepo**   | pnpm workspaces                                                                                           |

## File structure

```
chat-app/
├── apps/
│   ├── api/                    # Backend
│   │   ├── prisma/
│   │   │   ├── migrations/
│   │   │   └── schema.prisma
│   │   ├── src/
│   │   │   ├── router/        # tRPC routes
│   │   │   │   ├── _app.ts    # Root router (auth, thread, message)
│   │   │   │   ├── login.ts
│   │   │   │   ├── threads.ts
│   │   │   │   └── messages.ts
│   │   │   ├── auth.ts        # JWT + bcrypt
│   │   │   ├── db.ts          # Prisma client
│   │   │   ├── index.ts       # Express + tRPC mount
│   │   │   ├── seed.ts        # Seed users
│   │   │   └── trpc.ts        # Context, procedures
│   │   └── prisma.config.ts
│   │
│   └── web/                   # Frontend
│       ├── public/
│       ├── src/
│       │   ├── pages/
│       │   │   ├── chat/      # Thread list + message view
│       │   │   └── login/
│       │   ├── App.tsx
│       │   ├── main.tsx
│       │   ├── trpc.ts        # tRPC client + provider
│       │   ├── index.css      # Tailwind entry
│       │   └── vite-env.d.ts
│       ├── index.html
│       └── vite.config.ts
│
├── docker-compose.yml         # Postgres
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

## How to run

**Prerequisites:** Node > v.20, pnpm, Docker (for Postgres).

1. **Clone and install**

   ```bash
   pnpm install
   ```

2. **Start Postgres**

   ```bash
   docker-compose up -d
   ```

3. **Configure the API**
   Create `apps/api/.env` with:

   ```
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/chatapp?schema=public"
   ```

4. **Apply migrations**
   From the repo root:

   ```bash
   cd apps/api && npx prisma migrate deploy
   ```

5. **Generate Prisma client**
   The API uses a custom client output; generate it before seeding or running the app. From the repo root:

   ```bash
   pnpm --filter api exec prisma generate
   ```

   Run this again after cloning, after changing `schema.prisma`, or after a fresh DB.

6. **Seed users (required)**
   The app has no sign-up; logins use seeded users. Run the seed once (and after a fresh DB). From the repo root:

   ```bash
   pnpm --filter api seed
   ```

   Seeded users: **oliver**, **greg**, **alice**, **oscar** — password for all: **password**.

7. **Start API and web**
   From the repo root:

   ```bash
   pnpm dev
   ```

   API: http://localhost:3000  
   Web: http://localhost:5173 (or the port Vite prints). Log in with any seeded user.
