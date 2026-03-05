import { getAllMois } from '@/lib/db/queries/mois';
import { MoisCard } from '@/components/historique/MoisCard';

export const dynamic = 'force-dynamic';

export default async function HistoriquePage() {
  const allMois = await getAllMois();

  return (
    <main className="p-4 pb-6">
      <h1 className="text-xl font-semibold mb-4">Historique</h1>
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
