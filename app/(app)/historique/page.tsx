import { getAllMois } from '@/lib/db/queries/mois';
import { MoisCard } from '@/components/historique/MoisCard';
import { ImportButton } from '@/components/historique/ImportButton';

export const dynamic = 'force-dynamic';

export default async function HistoriquePage() {
  const allMois = await getAllMois();

  return (
    <main className="p-4 pb-6">
      <div className="flex items-start justify-between mb-4 gap-4">
        <h1 className="text-xl font-semibold">Historique</h1>
        <ImportButton />
      </div>
      {allMois.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">
          Aucun mois archivé pour l&apos;instant.
        </p>
      ) : (
        <div data-testid="historique-list">
          {allMois.map(({ mois, balance_finale }) => (
            <MoisCard key={mois.id} mois={mois} balance_finale={balance_finale} />
          ))}
        </div>
      )}
    </main>
  );
}
