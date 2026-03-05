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
      <h1 className="text-xl font-semibold mb-4">Ajustements</h1>
      <AjustementForm />
      <AjustementsList ajustements={ajustementsList} />
    </main>
  );
}
