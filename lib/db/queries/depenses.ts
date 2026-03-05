import { db } from '@/lib/db';
import { depenses } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import type { Depense } from '@/types';

export async function getDepensesByMois(moisId: number): Promise<Depense[]> {
  return db
    .select()
    .from(depenses)
    .where(eq(depenses.mois_id, moisId))
    .orderBy(desc(depenses.date_depense));
}

export async function insertDepense(data: {
  mois_id: number;
  categorie: string;
  sous_categorie: string;
  paye_par: string;
  montant: number;
  label?: string;
  date_depense: Date;
}): Promise<Depense> {
  const [inserted] = await db
    .insert(depenses)
    .values({
      mois_id: data.mois_id,
      categorie: data.categorie,
      sous_categorie: data.sous_categorie,
      paye_par: data.paye_par,
      montant: data.montant,
      label: data.label ?? null,
      date_depense: data.date_depense,
    })
    .returning();
  return inserted;
}

export async function deleteDepense(id: number): Promise<void> {
  await db.delete(depenses).where(eq(depenses.id, id));
}
