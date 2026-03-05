import { db } from '@/lib/db';
import { ajustements } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function getAjustementsByMois(moisId: number) {
  return db.select().from(ajustements).where(eq(ajustements.mois_id, moisId));
}
