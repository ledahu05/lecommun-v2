import { db } from '@/lib/db';
import { depenses } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function getDepensesByMois(moisId: number) {
  return db.select().from(depenses).where(eq(depenses.mois_id, moisId));
}
