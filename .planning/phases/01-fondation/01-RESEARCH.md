# Phase 1: Fondation - Research

**Researched:** 2026-03-04
**Domain:** Next.js 15 App Router + NextAuth v5 + Turso/Drizzle + Vercel deployment
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Login page**
- Boutons segmentés (Chris / Alex) pour le choix de l'utilisateur — pas de champ texte (cohérence mobile-first, même logique que paye_par)
- Un seul champ à saisir : le mot de passe
- Message d'erreur générique : "Identifiants incorrects" (pas de distinction "mauvais user" / "mauvais mot de passe" pour raisons de sécurité)
- Design épuré shadcn/ui, centré verticalement, pas de logo ou branding elaborate

**Post-login shell**
- Après connexion, l'utilisateur atterrit sur `/` (future dashboard)
- Phase 1 livre une page placeholder avec le nom de la route et un message court ("À venir")
- La navigation (bottom bar) est fonctionnelle et présente dès Phase 1, même si les routes pointent vers des placeholders

**Navigation scaffold**
- Bottom bar fixe avec 4 onglets : Accueil (`/`), Dépenses (`/depenses`), Ajustements (`/ajustements`), Historique (`/historique`)
- Labels courts, touch targets >= 48px, onglet actif mis en évidence

**Logout**
- Bouton de déconnexion accessible depuis la page `/`
- Session expirée -> middleware redirige silencieusement vers `/login` (pas de notification)

**Infrastructure**
- Vercel : CD automatique sur push `main`, pas de preview deployments configurés pour l'instant
- Turso : DB provisionnée, schéma appliqué via `drizzle-kit migrate`
- Variables d'environnement configurées sur Vercel : TURSO_DATABASE_URL, TURSO_AUTH_TOKEN, AUTH_SECRET, CHRIS_PASSWORD, ALEX_PASSWORD

### Claude's Discretion
- Exact styling de la login page (couleurs, spacing)
- Icônes choisies pour la bottom bar
- Placement exact du bouton logout
- Gestion des erreurs Turso (connexion DB indisponible)

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| INF-01 | L'application est déployée sur Vercel (CD automatique sur push main) | Vercel auto-deploys on push main when GitHub repo is linked — no config beyond initial import needed |
| INF-02 | La DB Turso est provisionnée et le schéma (mois, depenses, ajustements) est appliqué | Drizzle schema defined in TECH_SPEC; `drizzle-kit generate` + `migrate` applies it to Turso |
| INF-03 | Les variables d'environnement sont configurées (TURSO_DATABASE_URL, TURSO_AUTH_TOKEN, AUTH_SECRET, CHRIS_PASSWORD, ALEX_PASSWORD) | 5 env vars needed; set in Vercel dashboard for Production environment |
| AUTH-01 | L'utilisateur peut se connecter avec son nom (chris/alex) et mot de passe | NextAuth v5 Credentials provider with username from segmented buttons + password field |
| AUTH-02 | La session persiste 30 jours sans reconnexion | NextAuth v5 default JWT maxAge is 30 days (2592000s) — default matches requirement, explicit config recommended |
| AUTH-03 | Toutes les routes sauf /login sont protégées | NextAuth v5 `auth` exported as middleware with matcher config; redirect to `/login` when unauthenticated |
</phase_requirements>

---

## Summary

Phase 1 builds the complete infrastructure skeleton: Next.js 15 App Router project bootstrapped with `create-next-app`, Turso DB provisioned and schema migrated, NextAuth v5 Credentials-based authentication, and Vercel CD connected to GitHub main branch. The tech stack is fully specified in `docs/TECH_SPEC_LeCommun.md` — no ambiguity on library choices.

The most important technical constraint is that **NextAuth v5 Credentials provider requires a split configuration pattern** when middleware runs on the Edge runtime: `auth.config.ts` (no DB, Edge-compatible) and `auth.ts` (full config with session maxAge). Middleware imports from `auth.config.ts` only; the rest of the app imports from `auth.ts`. Failing to split causes silent failures on Vercel (Edge runtime) where database adapters are not available.

The login page UX is unusual — a segmented button (Chris/Alex) replaces the username text field. This means the `authorize()` function receives a pre-selected username, not a typed one. The form must POST the selected username as a hidden/managed value alongside the password field.

**Primary recommendation:** Follow the code patterns in `docs/TECH_SPEC_LeCommun.md` verbatim — they are production-ready and verified against the current stack. The split auth config is the single most important deviation from a naive implementation.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | ^15.0.0 | App Router, RSC, Server Actions, middleware | Decided; project is Next.js 15 |
| react / react-dom | ^19.0.0 | UI rendering | Bundled with Next.js 15 |
| next-auth | ^5.0.0 (beta) | JWT auth, session management, middleware | Decided; Credentials provider for 2-user private app |
| @libsql/client | ^0.14.0 | Turso SQLite cloud client | Required by Drizzle for Turso |
| drizzle-orm | ^0.39.0 | Type-safe ORM queries | Decided; used with Turso |
| zod | ^3.23.0 | Input validation | Project convention for all inputs |
| lucide-react | ^0.400.0 | Icon library | shadcn/ui dependency; bottom bar icons |
| tailwindcss | ^3.4.0 | Utility CSS | Decided; mobile-first styling |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| drizzle-kit | ^0.30.0 | Migration generation + DB studio | Dev only; schema changes |
| shadcn/ui | latest (CLI) | Pre-built accessible components | All UI components; button, card, input, label |
| typescript | ^5.0.0 | Type safety | Dev only; entire codebase |
| date-fns | ^4.0.0 | Date formatting | Not used in Phase 1, install now for later phases |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| NextAuth v5 Credentials | Custom JWT implementation | Don't hand-roll auth — NextAuth handles CSRF, session rotation, cookie management |
| Turso + Drizzle | Prisma + PlanetScale | Stack is locked; Drizzle is lighter and works natively with Turso's libSQL |
| shadcn/ui | Radix primitives directly | shadcn/ui gives styled components with copy-paste ownership; correct choice for this project |

**Installation:**
```bash
# Bootstrap
npx create-next-app@latest lecommun --typescript --tailwind --app --eslint

# Core dependencies
npm install next-auth@beta @libsql/client drizzle-orm zod date-fns lucide-react

# Dev dependencies
npm install -D drizzle-kit

# shadcn/ui init (interactive — choose default style, slate base color)
npx shadcn@latest init

# Phase 1 shadcn components
npx shadcn@latest add button card input label

# Note: npm + React 19 may require --legacy-peer-deps for shadcn components
npx shadcn@latest add button card input label --legacy-peer-deps
```

---

## Architecture Patterns

### Recommended Project Structure
```
lecommun/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx          # Public login page
│   ├── (app)/
│   │   ├── layout.tsx            # Protected layout with BottomNav
│   │   ├── page.tsx              # Placeholder "Accueil — À venir"
│   │   ├── depenses/page.tsx     # Placeholder
│   │   ├── ajustements/page.tsx  # Placeholder
│   │   └── historique/page.tsx   # Placeholder
│   └── api/
│       └── auth/[...nextauth]/route.ts  # NextAuth handler
├── components/
│   ├── ui/                       # shadcn/ui generated components
│   └── layout/
│       └── BottomNav.tsx         # Client Component — active tab detection
├── lib/
│   ├── db/
│   │   ├── index.ts              # Drizzle client
│   │   └── schema.ts             # 3 tables
│   └── auth/
│       ├── config.ts             # auth.config.ts — Edge-compatible, no DB
│       └── index.ts              # Full auth.ts — session maxAge, callbacks
├── middleware.ts                 # Imports from auth.config.ts only
├── drizzle.config.ts
├── drizzle/                      # Generated migration files
└── next.config.ts
```

### Pattern 1: Split Auth Configuration (CRITICAL for Vercel Edge)
**What:** NextAuth v5 with Credentials on Vercel Edge runtime requires two auth files — a minimal Edge-safe config and the full config.
**When to use:** Always when deploying to Vercel with `middleware.ts` and Credentials provider.
**Example:**
```typescript
// lib/auth/config.ts — Edge-compatible (no DB imports, no Node-only libs)
// Source: https://authjs.dev/getting-started/migrating-to-v5
import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      credentials: {
        username: { label: 'Utilisateur', type: 'text' },
        password: { label: 'Mot de passe', type: 'password' },
      },
      async authorize(credentials) {
        const users = [
          { id: 'chris', name: 'Chris', username: 'chris',
            password: process.env.CHRIS_PASSWORD! },
          { id: 'alex', name: 'Alex', username: 'alex',
            password: process.env.ALEX_PASSWORD! },
        ];
        const user = users.find(
          (u) => u.username === credentials.username &&
                 u.password === credentials.password
        );
        return user ?? null;
      },
    }),
  ],
  pages: { signIn: '/login' },
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
  callbacks: {
    jwt({ token, user }) {
      if (user) token.userId = user.id;
      return token;
    },
    session({ session, token }) {
      session.user.id = token.userId as string;
      return session;
    },
  },
};

// lib/auth/index.ts — Full export used by Server Components, Server Actions
import NextAuth from 'next-auth';
import { authConfig } from './config';

export const { handlers, signIn, signOut, auth } = NextAuth(authConfig);
```

### Pattern 2: Middleware Route Protection
**What:** Export `auth` as middleware to protect all routes except `/login` and static assets.
**When to use:** Always — this is the single middleware protecting the entire app.
**Example:**
```typescript
// middleware.ts — Source: docs/TECH_SPEC_LeCommun.md
import { auth } from '@/lib/auth/index';

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAuthPage = req.nextUrl.pathname.startsWith('/login');
  if (!isLoggedIn && !isAuthPage)
    return Response.redirect(new URL('/login', req.url));
  if (isLoggedIn && isAuthPage)
    return Response.redirect(new URL('/', req.url));
});

export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)'],
};
```

### Pattern 3: Login Form with Segmented User Selection
**What:** Login page uses segmented button group (Chris | Alex) instead of username text input. The selected username is managed in component state and passed to `signIn()`.
**When to use:** Phase 1 login page (locked decision).
**Example:**
```typescript
// app/(auth)/login/page.tsx — Client Component for interactivity
'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [selectedUser, setSelectedUser] = useState<'chris' | 'alex' | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedUser) return;
    const result = await signIn('credentials', {
      username: selectedUser,
      password,
      redirect: false,
    });
    if (result?.error) {
      setError('Identifiants incorrects');
    } else {
      router.push('/');
    }
  }
  // ... JSX with shadcn Button group + Input + error display
}
```

### Pattern 4: Drizzle + Turso Connection
**What:** Single db instance using Drizzle over libSQL, imported by all server-side code.
**When to use:** All DB queries in `lib/db/queries/`.
**Example:**
```typescript
// lib/db/index.ts — Source: docs/TECH_SPEC_LeCommun.md + orm.drizzle.team
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

export const db = drizzle(client, { schema });
```

### Pattern 5: Route Groups for Auth vs App
**What:** Next.js App Router route groups `(auth)` and `(app)` share no layout code. `(app)` layout contains BottomNav; `(auth)` layout is minimal.
**When to use:** Standard separation of authenticated vs public routes.
**Example:**
```typescript
// app/(app)/layout.tsx
import { BottomNav } from '@/components/layout/BottomNav';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen pb-16">
      {children}
      <BottomNav />
    </div>
  );
}
```

### Pattern 6: BottomNav as Client Component
**What:** BottomNav must be a Client Component to read `usePathname()` for active tab highlighting.
**When to use:** Navigation component only.
**Example:**
```typescript
// components/layout/BottomNav.tsx
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Receipt, ArrowLeftRight, Clock } from 'lucide-react';

const links = [
  { href: '/', label: 'Accueil', icon: Home },
  { href: '/depenses', label: 'Dépenses', icon: Receipt },
  { href: '/ajustements', label: 'Ajustements', icon: ArrowLeftRight },
  { href: '/historique', label: 'Historique', icon: Clock },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-background border-t">
      <div className="grid grid-cols-4 h-full">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center justify-center gap-1 text-xs min-h-[48px]
              ${pathname === href ? 'text-primary' : 'text-muted-foreground'}`}
          >
            <Icon className="h-5 w-5" />
            <span>{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
```

### Anti-Patterns to Avoid
- **Importing from `lib/auth/index.ts` in middleware.ts:** Causes Edge runtime failure if `auth.ts` ever imports a Node.js-only library. Always import from `auth.config.ts` in middleware.
- **Using database session strategy with Credentials:** Credentials provider requires JWT session strategy in NextAuth v5. Database sessions are Edge-incompatible.
- **Relying solely on middleware for auth:** CVE-2025-29927 — middleware can be bypassed via `x-middleware-subrequest` header. For this private 2-user app the risk is low, but data reads in Server Components should use `auth()` as a secondary check.
- **Storing passwords in DB:** Explicitly out-of-scope — credentials live in env vars only, no `users` table.
- **Using `signIn()` with `redirect: true` on error:** Loses error message. Use `redirect: false` and handle the error in the component.
- **Creating `(app)` layout without `pb-16`:** Bottom bar (h-16) overlaps content without bottom padding on the page container.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Session JWT creation + rotation | Custom JWT cookies | NextAuth v5 | CSRF protection, secure cookie flags, expiry rotation, HttpOnly |
| Route protection | Manual auth check in every page | NextAuth middleware | Centralized, one location to audit |
| Password comparison | Custom timing-safe compare | Env var string compare (acceptable for 2-user private app) | Simple case; bcrypt overkill here |
| DB migrations | Manual SQL files | `drizzle-kit generate` + `migrate` | Type-safe, tracked, repeatable |
| Active route detection | URL string matching | `usePathname()` from Next.js | Handles dynamic routes correctly |
| Form validation | Manual `if` checks | Zod schemas | Type inference, reusable between server and client |

**Key insight:** NextAuth v5 is 90% of the auth work — don't replicate what it already handles (cookies, CSRF, JWT signing/verification, session expiry).

---

## Common Pitfalls

### Pitfall 1: Edge Runtime Crash with Full Auth Import in Middleware
**What goes wrong:** Vercel deploys middleware on Edge runtime. If `middleware.ts` imports from a file that later imports `drizzle-orm` or `@libsql/client`, the build or runtime fails with "Module not compatible with Edge runtime."
**Why it happens:** Drizzle/libSQL use Node.js APIs unavailable on Edge.
**How to avoid:** Keep `lib/auth/config.ts` completely free of DB imports. Middleware imports only from this file.
**Warning signs:** Build error mentioning "edge-incompatible" or "dynamic require", or runtime errors on Vercel but not locally.

### Pitfall 2: npm + React 19 Peer Dependency Conflicts with shadcn
**What goes wrong:** `npx shadcn@latest add` fails with peer dependency errors when using npm.
**Why it happens:** React 19 is not yet in the peer deps of some shadcn component dependencies.
**How to avoid:** Add `--legacy-peer-deps` flag: `npx shadcn@latest add button --legacy-peer-deps`
**Warning signs:** npm error mentioning "ERESOLVE" or "peer dependency conflict" during component installation.

### Pitfall 3: `signIn()` from `next-auth/react` vs `next-auth`
**What goes wrong:** Calling the wrong `signIn` in a Client Component causes "cannot use server-side function on client" errors.
**Why it happens:** NextAuth v5 exports two different `signIn` functions — one for server (Server Actions), one for client (`next-auth/react`).
**How to avoid:** In Client Components (login page), import from `next-auth/react`. In Server Actions, import from `@/lib/auth/index.ts`.
**Warning signs:** Runtime error mentioning "cannot be called from client" or hydration mismatch.

### Pitfall 4: BottomNav Active State on Nested Routes
**What goes wrong:** `pathname === href` fails to highlight the correct tab on `/depenses/new` because the path doesn't exactly match `/depenses`.
**Why it happens:** Exact string comparison misses sub-routes.
**How to avoid:** Use `pathname.startsWith(href)` except for `/` (root must be exact): `href === '/' ? pathname === '/' : pathname.startsWith(href)`.
**Warning signs:** No active tab highlighted when on sub-pages.

### Pitfall 5: Vercel Missing AUTH_SECRET in Production
**What goes wrong:** NextAuth throws "MissingSecret" error in production; sessions fail silently.
**Why it happens:** `AUTH_SECRET` is required by NextAuth v5 in production. It's often set locally but forgotten on Vercel.
**How to avoid:** Add all 5 env vars (TURSO_DATABASE_URL, TURSO_AUTH_TOKEN, AUTH_SECRET, CHRIS_PASSWORD, ALEX_PASSWORD) to Vercel dashboard before first deploy. Use `openssl rand -base64 32` to generate AUTH_SECRET.
**Warning signs:** "MissingSecret" error in Vercel logs; redirect loops to /login.

### Pitfall 6: drizzle.config.ts Dialect must be "turso"
**What goes wrong:** Using `dialect: 'sqlite'` instead of `dialect: 'turso'` causes migration errors when using libSQL/Turso.
**Why it happens:** Drizzle-kit has separate dialect handling for Turso vs plain SQLite.
**How to avoid:** Always set `dialect: 'turso'` in `drizzle.config.ts` when connecting to Turso.
**Warning signs:** `drizzle-kit migrate` fails or generates incompatible SQL.

---

## Code Examples

Verified patterns from official sources and project TECH_SPEC:

### Drizzle Config (drizzle.config.ts)
```typescript
// Source: https://orm.drizzle.team/docs/get-started/turso-new
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle',
  schema: './lib/db/schema.ts',
  dialect: 'turso',
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
});
```

### NextAuth API Route Handler
```typescript
// app/api/auth/[...nextauth]/route.ts
// Source: authjs.dev/reference/nextjs
import { handlers } from '@/lib/auth/index';

export const { GET, POST } = handlers;
```

### DB Schema (Complete — Phase 1 creates all 3 tables)
```typescript
// lib/db/schema.ts — Source: docs/TECH_SPEC_LeCommun.md
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const mois = sqliteTable('mois', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  annee: integer('annee').notNull(),
  mois: integer('mois').notNull(),
  balance_reportee: real('balance_reportee').notNull().default(0),
  cree_le: integer('cree_le', { mode: 'timestamp' })
    .notNull().$defaultFn(() => new Date()),
});

export const depenses = sqliteTable('depenses', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  mois_id: integer('mois_id').notNull()
    .references(() => mois.id, { onDelete: 'cascade' }),
  categorie: text('categorie').notNull(),
  sous_categorie: text('sous_categorie').notNull(),
  paye_par: text('paye_par').notNull(),
  montant: real('montant').notNull(),
  label: text('label'),
  date_depense: integer('date_depense', { mode: 'timestamp' }).notNull(),
  cree_le: integer('cree_le', { mode: 'timestamp' })
    .notNull().$defaultFn(() => new Date()),
});

export const ajustements = sqliteTable('ajustements', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  mois_id: integer('mois_id').notNull()
    .references(() => mois.id, { onDelete: 'cascade' }),
  de: text('de').notNull(),
  vers: text('vers').notNull(),
  montant: real('montant').notNull(),
  label: text('label').notNull(),
  date_ajustement: integer('date_ajustement', { mode: 'timestamp' }).notNull(),
  cree_le: integer('cree_le', { mode: 'timestamp' })
    .notNull().$defaultFn(() => new Date()),
});
```

### Session maxAge Configuration
```typescript
// In authConfig (lib/auth/config.ts)
// Source: https://next-auth.js.org/configuration/options
session: {
  strategy: 'jwt',
  maxAge: 30 * 24 * 60 * 60,  // 30 days in seconds = 2592000
},
```

### Generating AUTH_SECRET
```bash
# Run locally, paste result into Vercel env vars
openssl rand -base64 32
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `next-auth` v4 with `getServerSession()` | NextAuth v5 with `auth()` universal function | v5 beta (2024) | Single `auth()` works in RSC, Server Actions, middleware |
| `next-auth/middleware` import | Export `auth` from config as middleware | v5 | Simpler, no separate middleware import |
| `pages/api/auth/[...nextauth].ts` | `app/api/auth/[...nextauth]/route.ts` | App Router | Route Handler pattern |
| `drizzle-kit push` | `drizzle-kit generate` + `migrate` | Drizzle 0.30+ | Explicit migration files, safer for production |
| `driver: 'turso'` in drizzle config | `dialect: 'turso'` | Drizzle-kit 0.30+ | Config key renamed |

**Deprecated/outdated:**
- `NEXTAUTH_URL` env var: No longer required in NextAuth v5 (auto-detected). Still harmless if set.
- `NEXTAUTH_SECRET`: Renamed to `AUTH_SECRET` in v5.
- `getServerSession(authOptions)` pattern: Replaced by `auth()` in v5.

---

## Open Questions

1. **Turso DB provisioning — manual or automated**
   - What we know: The Turso CLI (`turso db create lecommun`) provisions the DB; credentials are then copied to env vars.
   - What's unclear: Whether the team has already created the Turso DB or if that's part of Phase 1 execution.
   - Recommendation: Plan includes a task to provision Turso DB and capture credentials as an explicit step.

2. **Vercel project — existing or new**
   - What we know: The project needs a Vercel project linked to the GitHub repo for CD.
   - What's unclear: Whether a Vercel project/team already exists or needs creation.
   - Recommendation: Plan includes step to create Vercel project, link repo, configure env vars.

3. **`next.config.ts` vs `next.config.js`**
   - What we know: `create-next-app` with `--typescript` now generates `next.config.ts` (TypeScript) by default in Next.js 15.
   - What's unclear: Minor — `.ts` is fine and preferred.
   - Recommendation: Use `next.config.ts`.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Playwright (E2E) |
| Config file | `playwright.config.ts` — Wave 0 creates it |
| Quick run command | `npx playwright test --project=chromium tests/auth.spec.ts` |
| Full suite command | `npx playwright test` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| AUTH-01 | Chris can log in with password | E2E | `npx playwright test tests/auth.spec.ts --grep "chris login"` | Wave 0 |
| AUTH-01 | Alex can log in with password | E2E | `npx playwright test tests/auth.spec.ts --grep "alex login"` | Wave 0 |
| AUTH-01 | Wrong password shows "Identifiants incorrects" | E2E | `npx playwright test tests/auth.spec.ts --grep "wrong password"` | Wave 0 |
| AUTH-02 | Session cookie maxAge is 30 days | E2E smoke | `npx playwright test tests/auth.spec.ts --grep "session persists"` | Wave 0 |
| AUTH-03 | Unauthenticated visit to `/` redirects to `/login` | E2E | `npx playwright test tests/auth.spec.ts --grep "redirect unauthenticated"` | Wave 0 |
| AUTH-03 | Authenticated user accessing `/login` redirects to `/` | E2E | `npx playwright test tests/auth.spec.ts --grep "redirect authenticated"` | Wave 0 |
| INF-01 | App responds to HTTP at production URL | Smoke (manual) | Manual: visit Vercel URL post-deploy | manual-only |
| INF-02 | DB tables exist and schema matches | Smoke (drizzle-kit) | `npx drizzle-kit studio` (manual inspection) | manual-only |
| INF-03 | Env vars present (app doesn't crash) | Inferred by auth test | Auth login test implicitly verifies env vars | AUTH-01 tests |

### Sampling Rate
- **Per task commit:** `npx playwright test tests/auth.spec.ts --project=chromium`
- **Per wave merge:** `npx playwright test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `playwright.config.ts` — base config with webServer pointing to `http://localhost:3000`
- [ ] `tests/auth.spec.ts` — covers AUTH-01, AUTH-02, AUTH-03
- [ ] Playwright install: `npm init playwright@latest` — no existing config detected

---

## Sources

### Primary (HIGH confidence)
- `docs/TECH_SPEC_LeCommun.md` — complete code patterns for all Phase 1 files; verified against stack
- [authjs.dev/getting-started/migrating-to-v5](https://authjs.dev/getting-started/migrating-to-v5) — NextAuth v5 config, split pattern, session options
- [orm.drizzle.team/docs/get-started/turso-new](https://orm.drizzle.team/docs/get-started/turso-new) — Drizzle+Turso config, dialect:turso
- [nextjs.org/docs/pages/guides/testing/playwright](https://nextjs.org/docs/pages/guides/testing/playwright) — Playwright setup with Next.js

### Secondary (MEDIUM confidence)
- [codevoweb.com Next.js 15 + NextAuth v5 2026](https://codevoweb.com/how-to-set-up-next-js-15-with-nextauth-v5/) — confirmed split config pattern
- [ui.shadcn.com/docs/installation/next](https://ui.shadcn.com/docs/installation/next) — shadcn install with --legacy-peer-deps for npm+React 19
- [dev.to NextAuth middleware](https://dev.to/taufiqul7756/nextjs-15-authentication-with-app-router-and-middleware-4f94) — middleware pattern verification

### Tertiary (LOW confidence)
- CVE-2025-29927 middleware bypass — confirmed by multiple sources; low risk for this private 2-user app but noted

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — All libraries specified in TECH_SPEC with exact versions; no ambiguity
- Architecture: HIGH — File structure and code patterns from TECH_SPEC; verified against NextAuth v5 and Drizzle docs
- Pitfalls: HIGH — Edge runtime split-config issue verified by official docs; React 19 peer deps issue confirmed by shadcn docs

**Research date:** 2026-03-04
**Valid until:** 2026-04-04 (stable stack; NextAuth v5 beta could change before then — check release notes if > 2 weeks pass)
