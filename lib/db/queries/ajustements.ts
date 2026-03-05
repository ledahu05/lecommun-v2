import { db } from '@/lib/db';
import { ajustements } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import type { Ajustement } from '@/types';

export async function getAjustementsByMois(moisId: number): Promise<Ajustement[]> {
  return db
    .select()
    .from(ajustements)
    .where(eq(ajustements.mois_id, moisId))
    .orderBy(desc(ajustements.date_ajustement));
}

export async function insertAjustement(data: {
  mois_id: number;
  de: 'chris' | 'alex';
  vers: 'chris' | 'alex';
  montant: number;
  label: string;
  date_ajustement: Date;
}): Promise<void> {
  await db.insert(ajustements).values({
    mois_id: data.mois_id,
    de: data.de,
    vers: data.vers,
    montant: data.montant,
    label: data.label,
    date_ajustement: data.date_ajustement,
  });
}

export async function deleteAjustement(id: number): Promise<void> {
  await db.delete(ajustements).where(eq(ajustements.id, id));
}
