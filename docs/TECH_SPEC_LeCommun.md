# Technical Specification — Le Commun
**Version 1.0 — Mars 2026**

| Champ | Valeur |
|---|---|
| Version | 1.0 |
| Statut | Draft |
| Stack | Next.js 15 · Turso · Drizzle ORM · shadcn/ui · Vercel |
| Auth | Credentials hardcodés en variables d'environnement |
| Cible | Mobile-first, 2 utilisateurs (Chris, Alex) |

---

## 1. Stack Technique

### 1.1 Vue d'ensemble

```
┌─────────────────────────────────────┐
│           Vercel (hosting)          │
│                                     │
│  ┌─────────────────────────────┐   │
│  │     Next.js 15 App Router   │   │
│  │                             │   │
│  │  /app          → Pages RSC  │   │
│  │  /app/api      → API Routes │   │
│  │  /components   → shadcn/ui  │   │
│  │  /lib/db       → Drizzle    │   │
│  └──────────────┬──────────────┘   │
└─────────────────┼───────────────────┘
                  │ @libsql/client (HTTPS)
                  ▼
         ┌────────────────┐
         │   Turso Cloud  │
         │  (SQLite DB)   │
         └────────────────┘
```

### 1.2 Dépendances principales

```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@libsql/client": "^0.14.0",
    "drizzle-orm": "^0.39.0",
    "next-auth": "^5.0.0",
    "date-fns": "^4.0.0",
    "zod": "^3.23.0",
    "lucide-react": "^0.400.0"
  },
  "devDependencies": {
    "drizzle-kit": "^0.30.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "@types/react": "^19.0.0"
  }
}
```

### 1.3 Versions cibles

| Outil | Version |
|---|---|
| Next.js | 15.x (App Router) |
| React | 19.x |
| Node.js | 22.x (LTS) |
| TypeScript | 5.x |
| Drizzle ORM | 0.39.x |
| Turso libSQL | 0.14.x |
| shadcn/ui | latest |
| Tailwind CSS | 3.4.x |

---

## 2. Architecture

### 2.1 Structure du projet

```
lecommun/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx
│   ├── (app)/
│   │   ├── layout.tsx
│   │   ├── page.tsx              # Dashboard → balance du mois courant
│   │   ├── depenses/
│   │   │   ├── page.tsx
│   │   │   └── new/page.tsx
│   │   ├── ajustements/
│   │   │   ├── page.tsx
│   │   │   └── new/page.tsx
│   │   └── historique/
│   │       ├── page.tsx
│   │       └── [monthId]/page.tsx
│   └── api/
│       ├── auth/[...nextauth]/route.ts
│       ├── depenses/
│       │   ├── route.ts          # GET / POST
│       │   └── [id]/route.ts     # PUT / DELETE
│       ├── ajustements/
│       │   ├── route.ts
│       │   └── [id]/route.ts
│       ├── mois/
│       │   ├── route.ts
│       │   └── [monthId]/route.ts
│       └── balance/route.ts
├── components/
│   ├── ui/                       # shadcn/ui (généré)
│   ├── layout/
│   │   ├── BottomNav.tsx
│   │   └── Header.tsx
│   ├── depenses/
│   │   ├── DepenseCard.tsx
│   │   ├── DepenseForm.tsx
│   │   └── DepenseList.tsx
│   ├── balance/
│   │   ├── BalanceCard.tsx
│   │   └── BalanceSynthese.tsx
│   └── ajustements/
│       ├── AjustementCard.tsx
│       └── AjustementForm.tsx
├── lib/
│   ├── db/
│   │   ├── index.ts
│   │   ├── schema.ts
│   │   └── queries/
│   │       ├── depenses.ts
│   │       ├── ajustements.ts
│   │       └── mois.ts
│   ├── auth/config.ts
│   ├── balance.ts
│   ├── categories.ts
│   └── utils.ts
├── types/index.ts
├── drizzle.config.ts
├── middleware.ts
└── next.config.ts
```

### 2.2 Pattern de données

- **Pages** : React Server Components (RSC) — fetch direct en DB, zéro JS inutile côté client
- **Formulaires** : Server Actions pour les mutations
- **Balance** : recalculée côté serveur à chaque affichage, jamais mise en cache
- **Navigation** : Client Components uniquement pour les interactions UI (bottom nav, modals)

---

## 3. Base de Données

### 3.1 Schéma Drizzle (`lib/db/schema.ts`)

```typescript
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const mois = sqliteTable('mois', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  annee: integer('annee').notNull(),
  mois: integer('mois').notNull(),                 // 1-12
  balance_reportee: real('balance_reportee').notNull().default(0),
  cree_le: integer('cree_le', { mode: 'timestamp' })
    .notNull().$defaultFn(() => new Date()),
});

export const depenses = sqliteTable('depenses', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  mois_id: integer('mois_id').notNull()
    .references(() => mois.id, { onDelete: 'cascade' }),
  categorie: text('categorie').notNull(),
  // 'alimentation' | 'habitation' | 'loisirs' | 'vie_quotidienne'
  sous_categorie: text('sous_categorie').notNull(),
  paye_par: text('paye_par').notNull(),            // 'chris' | 'alex'
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
  de: text('de').notNull(),                        // 'chris' | 'alex'
  vers: text('vers').notNull(),                    // 'chris' | 'alex'
  montant: real('montant').notNull(),
  label: text('label').notNull(),
  date_ajustement: integer('date_ajustement', { mode: 'timestamp' }).notNull(),
  cree_le: integer('cree_le', { mode: 'timestamp' })
    .notNull().$defaultFn(() => new Date()),
});
```

### 3.2 Connexion Turso (`lib/db/index.ts`)

```typescript
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

export const db = drizzle(client, { schema });
```

### 3.3 Migrations

```bash
npx drizzle-kit generate   # génère les fichiers SQL
npx drizzle-kit migrate    # applique en DB
npx drizzle-kit studio     # interface web locale
```

---

## 4. Authentification

### 4.1 Stratégie

NextAuth v5 avec provider `Credentials`. Les utilisateurs et leurs mots de passe sont stockés **uniquement dans les variables d'environnement** — aucune table `users` en base.

### 4.2 Configuration (`lib/auth/config.ts`)

```typescript
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

export const { handlers, signIn, signOut, auth } = NextAuth({
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
  pages: { signIn: '/login' },
  session: { strategy: 'jwt' },
});
```

### 4.3 Protection des routes (`middleware.ts`)

```typescript
import { auth } from '@/lib/auth/config';

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

---

## 5. Logique Métier

### 5.1 Calcul de la balance (`lib/balance.ts`)

```typescript
export function calculerBalance(
  depenses: Depense[],
  ajustements: Ajustement[],
  balance_reportee: number
): BalanceResult {
  const total_chris = depenses
    .filter((d) => d.paye_par === 'chris')
    .reduce((sum, d) => sum + d.montant, 0);

  const total_alex = depenses
    .filter((d) => d.paye_par === 'alex')
    .reduce((sum, d) => sum + d.montant, 0);

  // Écart normalisé 50/50
  const balance_mensuelle = (total_alex - total_chris) / 2;

  // Ajustements Chris → Alex (inclut le report)
  const total_chris_vers_alex =
    balance_reportee +
    ajustements
      .filter((a) => a.de === 'chris' && a.vers === 'alex')
      .reduce((sum, a) => sum + a.montant, 0);

  // Ajustements Alex → Chris (virements)
  const total_alex_vers_chris = ajustements
    .filter((a) => a.de === 'alex' && a.vers === 'chris')
    .reduce((sum, a) => sum + a.montant, 0);

  // Solde final : > 0 = Chris doit à Alex, < 0 = Alex doit à Chris
  const balance_finale = total_chris_vers_alex - total_alex_vers_chris;

  return { total_chris, total_alex, balance_mensuelle,
           total_chris_vers_alex, total_alex_vers_chris, balance_finale };
}
```

### 5.2 Report automatique de la balance

À chaque nouveau mois, `balance_reportee` est récupérée automatiquement depuis la `balance_finale` du mois précédent — **aucune saisie manuelle requise**.

```typescript
export async function creerMoisSuivant() {
  const maintenant = new Date();
  const moisPrec = await getMoisPrecedent(
    maintenant.getFullYear(), maintenant.getMonth() + 1
  );
  const balance_reportee = moisPrec
    ? await getBalanceFinale(moisPrec.id) : 0;

  return db.insert(mois).values({
    annee: maintenant.getFullYear(),
    mois: maintenant.getMonth() + 1,
    balance_reportee,
  });
}
```

### 5.3 Catégories (`lib/categories.ts`)

```typescript
export const CATEGORIES = {
  alimentation: {
    label: 'Alimentation', emoji: '🛒',
    sous_categories: [
      { value: 'marche_pain', label: 'Marché / Pain' },
      { value: 'intermarche', label: 'Intermarché' },
      { value: 'viande', label: 'Viande' },
      { value: 'autre', label: 'Autre' },
    ],
  },
  habitation: {
    label: 'Habitation', emoji: '🏠',
    sous_categories: [
      { value: 'loyer', label: 'Loyer' },
      { value: 'energie', label: 'Énergie (EDF)' },
      { value: 'internet', label: 'Internet' },
      { value: 'eau', label: 'Eau' },
      { value: 'assurance', label: 'Assurance' },
      { value: 'netflix', label: 'Netflix' },
      { value: 'amazon', label: 'Amazon Prime' },
      { value: 'autre', label: 'Autre' },
    ],
  },
  loisirs: {
    label: 'Loisirs', emoji: '🎿',
    sous_categories: [
      { value: 'restaurant', label: 'Restaurant' },
      { value: 'vacances', label: 'Week-end / Vacances' },
      { value: 'sport', label: 'Sport' },
      { value: 'autre', label: 'Autre' },
    ],
  },
  vie_quotidienne: {
    label: 'Vie quotidienne', emoji: '💊',
    sous_categories: [
      { value: 'pharmacie', label: 'Pharmacie' },
      { value: 'animaux', label: 'Animaux (Berlioz)' },
      { value: 'cadeaux', label: 'Cadeaux' },
      { value: 'appartement', label: 'Appartement' },
      { value: 'autre', label: 'Autre' },
    ],
  },
} as const;
```

---

## 6. UI & Design System

### 6.1 Principes mobile-first

- **Navigation** : Bottom bar fixe (4 onglets), pas de sidebar
- **Touch targets** : minimum 48px de hauteur
- **Typographie** : minimum 16px pour éviter le zoom auto iOS
- **Formulaires** : keyboard-aware, champs bien espacés

### 6.2 Bottom navigation

```
┌─────────────────────────────────────┐
│          Contenu de la page         │
├─────────────────────────────────────┤
│  🏠        📋        🔄        📅   │
│ Accueil  Dépenses  Ajustements Histo│
└─────────────────────────────────────┘
```

### 6.3 Dashboard — wireframe

```
┌─────────────────────────────────────┐
│  Le Commun              👤 Chris    │
├─────────────────────────────────────┤
│  Mars 2026                          │
│  ┌─────────────────────────────┐   │
│  │    Chris doit               │   │
│  │    267 € à Alex             │   │
│  └─────────────────────────────┘   │
│                                     │
│  Chris : 234 €    Alex : 581 €     │
│                                     │
│  🛒 Alimentation     89 €/pers.    │
│  🏠 Habitation      186 €/pers.    │
│  🎿 Loisirs          72 €/pers.    │
│  💊 Vie quot.        27 €/pers.    │
│                                     │
│  Report mois préc.   -27 €         │
├─────────────────────────────────────┤
│  🏠        📋        🔄        📅   │
└─────────────────────────────────────┘
```

### 6.4 Composants shadcn/ui à installer

```bash
npx shadcn@latest add button card input label select
npx shadcn@latest add sheet badge separator skeleton
npx shadcn@latest add toast alert dialog
```

---

## 7. API Routes

Toutes les routes requièrent une session valide (vérification NextAuth sur chaque handler). Les Server Actions sont préférées pour les mutations depuis le client.

| Méthode | Route | Description |
|---|---|---|
| GET | `/api/balance` | Balance calculée du mois courant |
| GET | `/api/depenses?moisId=` | Liste des dépenses d'un mois |
| POST | `/api/depenses` | Créer une dépense |
| DELETE | `/api/depenses/:id` | Supprimer une dépense |
| GET | `/api/ajustements?moisId=` | Liste des ajustements |
| POST | `/api/ajustements` | Créer un ajustement |
| DELETE | `/api/ajustements/:id` | Supprimer un ajustement |
| GET | `/api/mois` | Liste de tous les mois |
| GET | `/api/mois/:id` | Détail + balance d'un mois |

---

## 8. Variables d'Environnement

### 8.1 `.env.local`

```bash
# Turso
TURSO_DATABASE_URL=libsql://lecommun-[org].turso.io
TURSO_AUTH_TOKEN=eyJhbGci...

# Auth
AUTH_SECRET=chaine-aleatoire-32-chars-minimum
CHRIS_PASSWORD=mot-de-passe-chris
ALEX_PASSWORD=mot-de-passe-alex
```

### 8.2 Variables Vercel (production)

| Variable | Environnement |
|---|---|
| `TURSO_DATABASE_URL` | Production, Preview |
| `TURSO_AUTH_TOKEN` | Production, Preview |
| `AUTH_SECRET` | Production, Preview |
| `CHRIS_PASSWORD` | Production, Preview |
| `ALEX_PASSWORD` | Production, Preview |

> ⚠️ Ne jamais committer `.env.local`

---

## 9. Déploiement

### 9.1 Setup initial

```bash
# 1. Créer le projet
npx create-next-app@latest lecommun --typescript --tailwind --app

# 2. Dépendances
npm install @libsql/client drizzle-orm next-auth zod date-fns lucide-react
npm install -D drizzle-kit

# 3. shadcn/ui
npx shadcn@latest init

# 4. Créer la DB Turso
turso db create lecommun
turso db tokens create lecommun   # → TURSO_AUTH_TOKEN
turso db show lecommun            # → TURSO_DATABASE_URL

# 5. Schema DB
npx drizzle-kit generate
npx drizzle-kit migrate

# 6. Déployer
npx vercel
```

### 9.2 CI/CD

- Push sur `main` → déploiement automatique Vercel
- Chaque PR → Preview URL dédiée (même DB Turso)

---

## 10. Sécurité

| Point | Décision |
|---|---|
| Auth | JWT via NextAuth, expiration 30 jours |
| Mots de passe | En variables d'env (acceptable pour 2 users privés) |
| HTTPS | Assuré par Vercel |
| Données en transit | TLS Vercel ↔ Turso via libSQL HTTPS |
| CSRF | Protégé nativement par NextAuth + Server Actions |
| Isolation | Les deux users voient toutes les données (volontaire) |

---

## 11. Plan de Développement

| Sprint | Contenu | Durée estimée |
|---|---|---|
| 1 — Fondations | Setup Next.js + Turso + Drizzle + Auth + Layout | 2-3h |
| 2 — Core | Dashboard balance + saisie dépense + liste | 3-4h |
| 3 — Ajustements | Formulaire virement + intégration balance | 2h |
| 4 — Historique | Liste mois + détail + report automatique | 2h |
| 5 — Polish | Loading states, toasts, PWA manifest | 2h |

---

## 12. Évolutions Futures (hors v1)

- Mode offline (Service Worker + IndexedDB)
- Export mensuel PDF
- Graphiques d'évolution de la balance
- Charges fixes récurrentes auto-injectées chaque mois
- Module immobilier (crédit, parts Chris/Alex)
- Notifications push si solde dépasse un seuil

---

*— Fin du document —*
