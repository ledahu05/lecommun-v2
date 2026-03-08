export const dynamic = 'force-dynamic';

import { getOrCreateCurrentMois } from '@/lib/db/queries/mois';
import { getAjustementsByMois } from '@/lib/db/queries/ajustements';
import AjustementForm from '@/components/ajustements/AjustementForm';
import AjustementsList from '@/components/ajustements/AjustementsList';

export default async function AjustementsPage() {
  const moisCourant = await getOrCreateCurrentMois();
  const ajustementsList = await getAjustementsByMois(moisCourant.id);

  return (
    <main className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Ajustements</h1>
        <AjustementForm />
      </div>
      <AjustementsList ajustements={ajustementsList} />
    </main>
  );
}
