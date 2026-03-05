import { notFound } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { mois } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getDepensesByMois } from '@/lib/db/queries/depenses';
import { getAjustementsByMois } from '@/lib/db/queries/ajustements';
import { calculerBalance } from '@/lib/balance';
import { BalanceCard } from '@/components/balance/BalanceCard';
import { BalanceSynthese } from '@/components/balance/BalanceSynthese';
import { HistoriqueDepenseItem } from '@/components/historique/HistoriqueDepenseItem';
import { HistoriqueAjustementItem } from '@/components/historique/HistoriqueAjustementItem';

export const dynamic = 'force-dynamic';

export default async function HistoriqueDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numId = Number(id);
  if (isNaN(numId)) notFound();

  const rows = await db.select().from(mois).where(eq(mois.id, numId)).limit(1);
  if (rows.length === 0) notFound();

  const moisRow = rows[0];
  const depensesList = await getDepensesByMois(moisRow.id);
  const ajustementsList = await getAjustementsByMois(moisRow.id);
  const balance = calculerBalance(depensesList, ajustementsList, moisRow.balance_reportee);

  return (
    <main className="p-4 space-y-6 pb-6" data-testid="historique-detail">
      <Link href="/historique" className="text-sm text-muted-foreground inline-block mb-2">
        ← Historique
      </Link>

      <BalanceCard balance={balance} mois={moisRow} />
      <BalanceSynthese depenses={depensesList} />

      <section>
        <h2 className="text-lg font-semibold mb-2">Dépenses</h2>
        {depensesList.length === 0 ? (
          <p className="text-muted-foreground text-sm">Aucune dépense ce mois-ci.</p>
        ) : (
          <div>
            {depensesList.map((depense) => (
              <HistoriqueDepenseItem key={depense.id} depense={depense} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">Ajustements</h2>
        {ajustementsList.length === 0 ? (
          <p className="text-muted-foreground text-sm">Aucun ajustement ce mois-ci.</p>
        ) : (
          <div>
            {ajustementsList.map((ajustement) => (
              <HistoriqueAjustementItem key={ajustement.id} ajustement={ajustement} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
