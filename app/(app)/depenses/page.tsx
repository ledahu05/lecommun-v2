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
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Depenses</h1>
        <DepenseForm />
      </div>
      <DepensesList depenses={depensesList} />
    </main>
  );
}
