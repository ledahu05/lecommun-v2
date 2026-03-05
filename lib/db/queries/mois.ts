import { db } from '@/lib/db';
import { mois, depenses, ajustements } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { calculerBalance } from '@/lib/balance';

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
