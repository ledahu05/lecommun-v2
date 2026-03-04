# CLAUDE.md — Le Commun

## Projet

Application web mobile-first de comptabilité partagée entre **Chris** et **Alex**.
Elle remplace un Google Sheets de 55 mois (juillet 2021 → mars 2026) qui gérait
une balance glissante de dépenses communes.

Toute la documentation de référence est dans `/docs` :
- `docs/PRD_Compta_Commune.md` — spécifications fonctionnelles complètes
- `docs/TECH_SPEC_LeCommun.md` — architecture, schéma DB, patterns de code
- `docs/fixtures_e2e.json` — données réelles extraites du tableur, 16 scénarios de test

---

## Stack

| Couche | Technologie |
|---|---|
| Framework | Next.js 15, App Router, React 19 |
| Langage | TypeScript 5 strict |
| Base de données | Turso (SQLite cloud) via `@libsql/client` |
| ORM | Drizzle ORM |
| Auth | NextAuth v5, provider Credentials, session JWT |
| UI | shadcn/ui + Tailwind CSS 3 |
| Déploiement | Vercel via `@vercel/sdk` |
| Tests E2E | Playwright |

---

## Règle d'or : mobile-first

L'app est utilisée à 99% sur mobile (saisie de dépenses en courses, au restaurant...).
- Touch targets minimum **48px** de hauteur
- Police minimum **16px** (évite le zoom auto iOS)
- Navigation par **bottom bar fixe** uniquement — pas de sidebar, pas de hamburger
- Formulaires **keyboard-aware**
- Tester systématiquement en viewport 390×844 (iPhone 14)

---

## Architecture

```
app/
├── (auth)/login/          # Page de connexion publique
├── (app)/                 # Groupe protégé (middleware auth)
│   ├── page.tsx           # Dashboard — balance du mois courant
│   ├── depenses/          # Liste + formulaire saisie
│   ├── ajustements/       # Virements et dettes ponctuelles
│   └── historique/        # Mois archivés + détail
└── api/                   # Routes REST (optionnelles, mutations via Server Actions)

lib/
├── db/
│   ├── index.ts           # Client Turso + instance Drizzle
│   ├── schema.ts          # Tables : mois, depenses, ajustements
│   └── queries/           # Requêtes typées par entité
├── auth/config.ts         # NextAuth config
├── balance.ts             # Logique métier pure (calcul balance)
└── categories.ts          # Constantes catégories/sous-catégories

middleware.ts              # Protège toutes les routes sauf /login
```

**Pattern à suivre :**
- Pages = React Server Components (fetch DB direct, zéro JS superflu)
- Mutations = Server Actions (pas de fetch côté client)
- Client Components = uniquement pour interactions UI (bottom nav, modals, toasts)

---

## Base de données

### 3 tables

```typescript
// mois — un enregistrement par mois calendaire
mois { id, annee, mois(1-12), balance_reportee, cree_le }

// depenses — chaque dépense saisie
depenses { id, mois_id, categorie, sous_categorie, paye_par, montant, label, date_depense, cree_le }

// ajustements — virements et dettes ponctuelles
ajustements { id, mois_id, de, vers, montant, label, date_ajustement, cree_le }
```

### Valeurs énumérées

```
categorie       : 'alimentation' | 'habitation' | 'loisirs' | 'vie_quotidienne'
paye_par / de / vers : 'chris' | 'alex'
```

### Migrations

```bash
npx drizzle-kit generate   # après toute modif de schema.ts
npx drizzle-kit migrate    # applique en DB
npx drizzle-kit studio     # UI locale pour inspecter
```

---

## Algorithme de balance (NE PAS MODIFIER sans relire le PRD)

```
total_chris        = SUM(depenses WHERE paye_par = 'chris')
total_alex         = SUM(depenses WHERE paye_par = 'alex')
balance_mensuelle  = (total_alex - total_chris) / 2

total_chris→alex   = balance_reportee
                   + SUM(ajustements WHERE de='chris' AND vers='alex')
total_alex→chris   = SUM(ajustements WHERE de='alex' AND vers='chris')

balance_finale     = total_chris→alex - total_alex→chris
  > 0  →  Chris doit à Alex
  < 0  →  Alex doit à Chris
  = 0  →  Équilibre
```

La `balance_reportee` du mois N+1 = `balance_finale` du mois N.
**Ce report est automatique** — jamais de saisie manuelle.

L'implémentation de référence est dans `lib/balance.ts`.

---

## Auth

- **2 utilisateurs seulement** : `chris` et `alex`
- Credentials stockés dans variables d'environnement (`CHRIS_PASSWORD`, `ALEX_PASSWORD`)
- Aucune table `users` en base
- Session JWT, expiration 30 jours
- Toutes les routes sauf `/login` sont protégées par `middleware.ts`
- Les deux users voient **toutes** les données (c'est voulu — app partagée)

---

## Variables d'environnement

Fichier `.env.local` à créer à la racine (ne jamais committer) :

```bash
TURSO_DATABASE_URL=libsql://lecommun-[org].turso.io
TURSO_AUTH_TOKEN=eyJhbGci...
AUTH_SECRET=chaine-aleatoire-minimum-32-caracteres
CHRIS_PASSWORD=choisir-un-mot-de-passe
ALEX_PASSWORD=choisir-un-mot-de-passe
```

Variables requises sur Vercel : `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`,
`AUTH_SECRET`, `CHRIS_PASSWORD`, `ALEX_PASSWORD`.

---

## Commandes du projet

```bash
npm run dev              # Serveur local http://localhost:3000
npm run build            # Build de production
npm run lint             # ESLint
npx drizzle-kit studio   # Interface DB locale
npx playwright test      # Tests E2E
npx playwright test --ui # Tests E2E avec interface graphique
```

---

## Setup initial (première fois)

```bash
# 1. Installer les dépendances
npm install

# 2. Créer .env.local avec les vraies valeurs (voir section Variables)

# 3. Appliquer le schéma DB
npx drizzle-kit generate
npx drizzle-kit migrate

# 4. Lancer en dev
npm run dev
```

---

## Tests E2E

Les fixtures sont dans `docs/fixtures_e2e.json`. Elles contiennent :
- 5 mois de données réelles (nov 2024 → mars 2026)
- 51 dépenses avec montants exacts issus du tableur original
- 12 ajustements (virements, appart 115€/mois, avances)
- Les `expected_balances` avec tous les résultats intermédiaires pré-calculés
- 16 scénarios de test nommés (`auth_01`, `balance_01`, `depense_01`...)

Le helper de seed Playwright doit :
1. Vider les tables `depenses`, `ajustements`, `mois` (dans cet ordre)
2. Insérer les `mois` demandés par le scénario (`seed_mois_ids`)
3. Insérer les `depenses` et `ajustements` correspondants
4. Lancer le test
5. Vérifier les valeurs dans `expected_balances`

```typescript
// Exemple d'usage dans un test Playwright
import fixtures from '../docs/fixtures_e2e.json';

test('balance novembre 2024', async ({ page }) => {
  await seedDatabase(fixtures, [1]); // mois_id 1 = novembre 2024
  await page.goto('/');
  const expected = fixtures.expected_balances.find(b => b.mois_id === 1);
  await expect(page.getByTestId('balance-finale'))
    .toContainText('891,50 €');
});
```

---

## Catégories & Sous-catégories

Définies dans `lib/categories.ts` — ne pas hardcoder ailleurs.

| Catégorie | Emoji | Sous-catégories principales |
|---|---|---|
| alimentation | 🛒 | marche_pain, intermarche, viande, miel |
| habitation | 🏠 | loyer, energie, internet, eau, assurance, amazon, netflix |
| loisirs | 🎿 | restaurant, vacances, sport, livres |
| vie_quotidienne | 💊 | pharmacie, animaux, cadeaux, appartement |

---

## Déploiement Vercel

Utiliser le SDK officiel `@vercel/sdk` pour toute gestion programmatique des déploiements.

```bash
npm install @vercel/sdk
```

```typescript
import { Vercel } from '@vercel/sdk';

const vercel = new Vercel({ bearerToken: process.env.VERCEL_TOKEN });

// Lister les déploiements
const deployments = await vercel.deployments.getDeployments({ projectId: '...' });

// Déclencher un déploiement
const deployment = await vercel.deployments.createDeployment({ ... });
```

Variables d'environnement supplémentaires :
```bash
VERCEL_TOKEN=...        # Token API Vercel (Personal Access Token)
VERCEL_PROJECT_ID=...   # ID du projet Vercel
VERCEL_TEAM_ID=...      # ID de l'équipe (si applicable)
```

Ne jamais utiliser `vercel deploy` en CLI dans le code applicatif — passer par le SDK.

---

## Skills obligatoires

- Utiliser le skill `vercel-react-best-practices` pour tout travail sur des composants React ou des pages Next.js.

---

## Conventions de code

- **Nommage** : snake_case pour les champs DB, camelCase pour les variables TS
- **Composants** : PascalCase, un composant par fichier
- **Server Actions** : préfixe `action` (ex: `actionCreateDepense`)
- **Queries DB** : fonctions nommées, exportées depuis `lib/db/queries/`
- **Validation** : Zod sur tous les inputs (formulaires et API)
- **Erreurs** : `try/catch` sur tous les appels DB, toast pour l'utilisateur
- **Formatage monétaire** : toujours `toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })`
- **Dates** : stocker en timestamp Unix (integer), afficher avec `date-fns/fr`

---

## Points d'attention

- Le champ `balance_reportee` dans la table `mois` ne se saisit **jamais manuellement** — il est toujours calculé depuis le mois précédent
- Une dépense avec `montant <= 0` doit être rejetée côté serveur (Zod) et côté client (validation formulaire)
- La balance se recalcule **à chaque requête** depuis les données brutes — pas de cache, pas de valeur stockée
- Sur iOS, vérifier que les `<select>` shadcn/ui s'ouvrent correctement (préférer des boutons segmentés pour `paye_par`)
- Le champ `label` dans `depenses` est optionnel ; le champ `label` dans `ajustements` est obligatoire

---

## Ce qui est hors scope (v1)

- Mode offline / PWA avec sync
- Export PDF mensuel
- Module immobilier (crédit, parts Chris/Alex)
- Graphiques d'évolution
- Charges fixes auto-injectées chaque mois
- Notifications push
