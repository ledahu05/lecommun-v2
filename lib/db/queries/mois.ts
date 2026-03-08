import { db } from '@/lib/db';
import { mois, depenses, ajustements } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import type { Mois } from '@/types';
import { calculerBalance } from '@/lib/balance';

export async function getMoisByAnneeEtMois(annee: number, moisNum: number): Promise<Mois | null> {
  const rows = await db
    .select()
    .from(mois)
    .where(and(eq(mois.annee, annee), eq(mois.mois, moisNum)))
    .limit(1);
  return rows[0] ?? null;
}

export async function insertMois(data: {
  annee: number;
  moisNum: number;
  balance_reportee: number;
}): Promise<Mois> {
  const [inserted] = await db
    .insert(mois)
    .values({ annee: data.annee, mois: data.moisNum, balance_reportee: data.balance_reportee })
    .returning();
  return inserted;
}

export async function deleteMois(id: number): Promise<void> {
  await db.delete(mois).where(eq(mois.id, id));
}

export async function getOrCreateCurrentMois() {
  const now = new Date();
  const annee = now.getFullYear();
  const moisNum = now.getMonth() + 1; // 1-12

  // Chercher le mois courant existant
  const existing = await db
    .select()
    .from(mois)
    .where(and(eq(mois.annee, annee), eq(mois.mois, moisNum)))
    .limit(1);

  if (existing.length > 0) return existing[0];

  // Pas trouvé — calculer la balance_reportee depuis le mois précédent (RPT-01)
  const balance_reportee = await computeBalanceReportee(annee, moisNum);

  // Insérer le nouveau mois
  // onConflictDoUpdate protège contre les race conditions rares
  const [inserted] = await db
    .insert(mois)
    .values({ annee, mois: moisNum, balance_reportee })
    .onConflictDoUpdate({
      target: [mois.annee, mois.mois],
      set: { balance_reportee }, // no-op si déjà créé en parallèle
    })
    .returning();

  return inserted;
}

export async function getAllMois(): Promise<Array<{ mois: Mois; balance_finale: number }>> {
  const allMois = await db
    .select()
    .from(mois)
    .orderBy(desc(mois.annee), desc(mois.mois));

  const results = await Promise.all(
    allMois.map(async (m) => {
      const deps = await db.select().from(depenses).where(eq(depenses.mois_id, m.id));
      const adjs = await db.select().from(ajustements).where(eq(ajustements.mois_id, m.id));
      const balance = calculerBalance(deps, adjs, m.balance_reportee);
      return { mois: m, balance_finale: balance.balance_finale };
    })
  );

  return results;
}

export async function hasPreviousMois(annee: number, moisNum: number): Promise<boolean> {
  const prevMoisNum = moisNum === 1 ? 12 : moisNum - 1;
  const prevAnnee = moisNum === 1 ? annee - 1 : annee;

  const rows = await db
    .select({ id: mois.id })
    .from(mois)
    .where(and(eq(mois.annee, prevAnnee), eq(mois.mois, prevMoisNum)))
    .limit(1);

  return rows.length > 0;
}

export async function updateBalanceReportee(id: number, value: number): Promise<void> {
  await db.update(mois).set({ balance_reportee: value }).where(eq(mois.id, id));
}

async function computeBalanceReportee(annee: number, moisNum: number): Promise<number> {
  // Mois précédent calendaire
  const prevMoisNum = moisNum === 1 ? 12 : moisNum - 1;
  const prevAnnee   = moisNum === 1 ? annee - 1 : annee;

  const prevRows = await db
    .select()
    .from(mois)
    .where(and(eq(mois.annee, prevAnnee), eq(mois.mois, prevMoisNum)))
    .limit(1);

  if (prevRows.length === 0) return 0; // Premier mois — balance_reportee = 0

  const prevMois = prevRows[0];

  const prevDepenses = await db
    .select()
    .from(depenses)
    .where(eq(depenses.mois_id, prevMois.id));

  const prevAjustements = await db
    .select()
    .from(ajustements)
    .where(eq(ajustements.mois_id, prevMois.id));

  const { balance_finale } = calculerBalance(
    prevDepenses,
    prevAjustements,
    prevMois.balance_reportee,
  );

  return balance_finale;
}
