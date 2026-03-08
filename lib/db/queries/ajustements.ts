import { db } from '@/lib/db';
import { ajustements } from '@/lib/db/schema';
import { eq, desc, and } from 'drizzle-orm';
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
  recurrent?: boolean;
}): Promise<void> {
  await db.insert(ajustements).values({
    mois_id: data.mois_id,
    de: data.de,
    vers: data.vers,
    montant: data.montant,
    label: data.label,
    date_ajustement: data.date_ajustement,
    recurrent: data.recurrent ? 1 : 0,
  });
}

export async function toggleAjustementRecurrent(id: number): Promise<void> {
  const [row] = await db.select({ recurrent: ajustements.recurrent }).from(ajustements).where(eq(ajustements.id, id)).limit(1);
  if (!row) return;
  await db.update(ajustements).set({ recurrent: row.recurrent ? 0 : 1 }).where(eq(ajustements.id, id));
}

export async function getRecurrentAjustementsByMois(moisId: number): Promise<Ajustement[]> {
  return db
    .select()
    .from(ajustements)
    .where(and(eq(ajustements.mois_id, moisId), eq(ajustements.recurrent, 1)));
}

export async function deleteAjustement(id: number): Promise<void> {
  await db.delete(ajustements).where(eq(ajustements.id, id));
}
