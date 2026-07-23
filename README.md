# DevBoard

A project management platform built with Next.js — workspaces, teams, projects, and issue tracking in one place.

## Status

🚧 In active development

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: PostgreSQL (via Supabase) + Prisma ORM
- **Auth**: NextAuth v5 (Auth.js) — Credentials provider, JWT sessions
- **File storage**: Supabase Storage (workspace logos)
- **Data fetching**: TanStack React Query
- **Forms & validation**: React Hook Form + Zod

## Core Entities

```
User
 └── Workspace (via WorkspaceMember, role: OWNER / ADMIN / MEMBER)
      └── WorkspaceInvite (pending team invitations)
      └── Project
           └── Issue
                └── Comment
```

## Features

- **Authentication** — email/password sign-up and sign-in via NextAuth Credentials provider, hashed passwords (bcrypt), JWT sessions
- **Workspaces** — create, edit, and delete workspaces, with a logo upload (compressed client-side, stored in Supabase Storage)
- **Workspace switcher** — move between workspaces you belong to
- **Members & roles** — role-based membership (Owner / Admin / Member), view members, update roles, remove members
- **Invites** — invite teammates by email, shareable invite link with expiry, accept-invite flow that handles sign-up/sign-in redirects and email mismatches
- **Route protection** — `proxy.ts` (Next.js 16+ middleware convention) guards dashboard routes and redirects authenticated users away from sign-in/sign-up

## Project Structure

```
src/
├── app/                  → routes, layouts, and API routes (App Router)
│   ├── (auth)/           → sign-in, sign-up pages
│   ├── api/              → route handlers (auth, workspaces, invites)
│   ├── dashboard/        → workspace-scoped dashboard routes
│   └── invite/[token]/   → public accept-invite page
├── auth.ts               → NextAuth full config (Credentials provider, Prisma adapter)
├── auth.config.ts        → edge-safe NextAuth config (used by proxy.ts)
├── proxy.ts              → Next.js 16 middleware — route protection
├── components/
│   ├── dashboard/        → sidebar, navbar, dashboard shell
│   ├── shared/           → reusable primitives (FormDialog, DialogActions, ConfirmDialog)
│   └── ui/                → shadcn/ui components
├── features/
│   ├── auth/             → login/register forms, schemas, hooks
│   └── workspace/        → settings, members, invite sub-features (components + hooks)
├── hooks/                → app-wide custom hooks
├── lib/                  → Prisma client, password hashing, Supabase clients, workspace auth helpers
└── locales/              → i18n strings
```

## Getting Started

### Prerequisites

- Node.js
- A [Supabase](https://supabase.com) project (Postgres + Storage)

### Setup

1. Clone the repo and install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` (or create `.env`) and fill in:

   ```env
   DATABASE_URL=              # Supabase pooled connection (port 6543)
   DIRECT_URL=                # Supabase direct connection (port 5432)
   AUTH_SECRET=                # generate via: npx auth secret (or node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   SUPABASE_SERVICE_ROLE_KEY=  # server-only, used for logo uploads
   NEXT_PUBLIC_APP_URL=        # e.g. http://localhost:3000
   ```

3. Run database migrations:

   ```bash
   npx prisma migrate dev
   ```

4. Start the dev server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

### Supabase Storage setup

Create a public bucket named `workspace-logos` with:

- Allowed MIME types: `image/jpeg`, `image/png`
- A reasonable max file size (e.g. 2MB)

Logo uploads are routed through a server-side API route using the Supabase service role key (not client-side RLS), since auth is handled by NextAuth rather than Supabase Auth.

## Scripts

| Command                  | Description                  |
| ------------------------ | ---------------------------- |
| `npm run dev`            | Start the development server |
| `npm run build`          | Build for production         |
| `npm run start`          | Run the production build     |
| `npm run lint`           | Run ESLint                   |
| `npx prisma migrate dev` | Run database migrations      |
| `npx prisma studio`      | Open Prisma's DB browser     |

## Roadmap

- [ ] Projects and issues (core entities beyond workspace/members)
- [ ] OAuth providers (Google/GitHub) — Prisma adapter already in place
- [ ] Email delivery for invites (currently generates a shareable link only)
- [ ] Automated tests (Jest + React Testing Library)
