import { notFound } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { mois } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getDepensesByMois } from '@/lib/db/queries/depenses';
import { getAjustementsByMois } from '@/lib/db/queries/ajustements';
import { calculerBalance } from '@/lib/balance';
import { CATEGORIES } from '@/lib/categories';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Depense, Ajustement } from '@/types';

export const dynamic = 'force-dynamic';

function formatEur(amount: number): string {
  return amount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
}

function formatEurAbs(amount: number): string {
  return Math.abs(amount).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
}

function sousCategLabel(sc: string): string {
  return sc
    .replace(/_/g, ' ')
    .replace(/^./, (c) => c.toUpperCase());
}

function DepenseRow({ depense }: { depense: Depense }) {
  const cat = CATEGORIES[depense.categorie as keyof typeof CATEGORIES];
  return (
    <div className="flex justify-between items-center py-1 text-sm" data-testid="detail-depense-row">
      <span>
        {cat?.emoji ?? '•'} {sousCategLabel(depense.sous_categorie)}
        {depense.label ? ` — ${depense.label}` : ''}
      </span>
      <span className="tabular-nums font-medium">{formatEur(depense.montant)}</span>
    </div>
  );
}

function DepenseSection({ title, depenses, total, testId }: {
  title: string;
  depenses: Depense[];
  total: number;
  testId: string;
}) {
  return (
    <section className="space-y-1" data-testid={testId}>
      <h2 className="text-base font-semibold">{title}</h2>
      {depenses.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aucune dépense</p>
      ) : (
        depenses.map((d) => <DepenseRow key={d.id} depense={d} />)
      )}
      <div className="border-t pt-1 flex justify-between items-center font-semibold text-sm">
        <span>Total</span>
        <span className="tabular-nums" data-testid={`${testId}-total`}>{formatEur(total)}</span>
      </div>
    </section>
  );
}

function CalcRow({ label, value, testId }: { label: string; value: string; testId?: string }) {
  return (
    <div className="flex justify-between items-center py-1 text-sm">
      <span>{label}</span>
      <span className="tabular-nums font-medium" data-testid={testId}>{value}</span>
    </div>
  );
}

export default async function BalanceDetailPage({
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

  const depensesChris = depensesList.filter((d) => d.paye_par === 'chris');
  const depensesAlex = depensesList.filter((d) => d.paye_par === 'alex');

  const ajustementsChrisVersAlex = ajustementsList.filter((a) => a.de === 'chris' && a.vers === 'alex');
  const ajustementsAlexVersChris = ajustementsList.filter((a) => a.de === 'alex' && a.vers === 'chris');

  const moisLabel = format(new Date(moisRow.annee, moisRow.mois - 1, 1), 'MMMM yyyy', { locale: fr });

  let conclusionText: string;
  if (balance.balance_finale > 0) {
    conclusionText = `Chris doit ${formatEurAbs(balance.balance_finale)} à Alex`;
  } else if (balance.balance_finale < 0) {
    conclusionText = `Alex doit ${formatEurAbs(balance.balance_finale)} à Chris`;
  } else {
    conclusionText = 'Équilibre';
  }

  return (
    <main className="p-4 space-y-6 pb-6" data-testid="balance-detail">
      <Link href={`/historique/${moisRow.id}`} className="text-sm text-muted-foreground inline-block mb-2">
        ← Retour
      </Link>

      <h1 className="text-lg font-semibold capitalize">Détail — {moisLabel}</h1>

      {/* Bloc 1: Dépenses Chris */}
      <DepenseSection
        title="Dépenses Chris"
        depenses={depensesChris}
        total={balance.total_chris}
        testId="detail-chris"
      />

      {/* Bloc 2: Dépenses Alex */}
      <DepenseSection
        title="Dépenses Alex"
        depenses={depensesAlex}
        total={balance.total_alex}
        testId="detail-alex"
      />

      {/* Bloc 3: Calcul pas à pas */}
      <section className="space-y-1" data-testid="detail-calcul">
        <h2 className="text-base font-semibold">Calcul de la balance</h2>

        <CalcRow
          label={`(${formatEur(balance.total_alex)} − ${formatEur(balance.total_chris)}) / 2`}
          value={formatEur(balance.balance_mensuelle)}
          testId="detail-balance-mensuelle"
        />

        <CalcRow
          label="+ Balance reportée"
          value={formatEur(balance.balance_reportee)}
          testId="detail-balance-reportee"
        />

        {ajustementsChrisVersAlex.map((a) => (
          <CalcRow
            key={a.id}
            label={`+ ${a.label} (Chris→Alex)`}
            value={formatEur(a.montant)}
          />
        ))}

        {ajustementsAlexVersChris.map((a) => (
          <CalcRow
            key={a.id}
            label={`− ${a.label} (Alex→Chris)`}
            value={`−\u00a0${formatEur(a.montant)}`}
          />
        ))}

        <div className="border-t-2 border-foreground pt-2 flex justify-between items-center font-bold text-base">
          <span>Balance finale</span>
          <span className="tabular-nums" data-testid="detail-balance-finale">{formatEur(balance.balance_finale)}</span>
        </div>

        <p className="text-sm text-muted-foreground pt-1" data-testid="detail-conclusion">
          → {conclusionText}
        </p>
      </section>
    </main>
  );
}
