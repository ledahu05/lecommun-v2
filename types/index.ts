import type { InferSelectModel } from 'drizzle-orm';
import type { mois, depenses, ajustements } from '@/lib/db/schema';

export type Mois       = InferSelectModel<typeof mois>;
export type Depense    = InferSelectModel<typeof depenses>;
export type Ajustement = InferSelectModel<typeof ajustements>;
