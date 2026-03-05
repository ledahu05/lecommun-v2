export const dynamic = 'force-dynamic';

import { getOrCreateCurrentMois } from '@/lib/db/queries/mois';
import { getDepensesByMois } from '@/lib/db/queries/depenses';
import DepenseForm from '@/components/depenses/DepenseForm';
import DepensesList from '@/components/depenses/DepensesList';

export default async function DepensesPage() {
  const moisCourant = await getOrCreateCurrentMois();
  const depensesList = await getDepensesByMois(moisCourant.id);

  return (
    <main className="p-4">
      <h1 className="text-xl font-semibold mb-4">Dépenses</h1>
      <DepenseForm />
      <DepensesList depenses={depensesList} />
    </main>
  );
}
