import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Mois } from '@/types';
import { DeleteMoisButton } from './DeleteMoisButton';
import { ExportButton } from './ExportButton';

interface Props {
  mois: Mois;
  balance_finale: number;
}

export function MoisCard({ mois, balance_finale }: Props) {
  const moisLabel = format(new Date(mois.annee, mois.mois - 1, 1), 'MMMM yyyy', { locale: fr });
  const montantAbs = Math.abs(balance_finale).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });

  let debiteurText: string;
  if (balance_finale > 0) {
    debiteurText = `Chris doit ${montantAbs}`;
  } else if (balance_finale < 0) {
    debiteurText = `Alex doit ${montantAbs}`;
  } else {
    debiteurText = 'Equilibre';
  }

  return (
    <div
      data-testid="mois-card"
      className="flex items-center border-b last:border-b-0"
    >
      <Link
        href={`/historique/${mois.id}`}
        className="flex flex-1 items-center justify-between min-h-[48px] py-3 pr-2 hover:bg-muted/50 transition-colors"
      >
        <span className="font-medium text-base capitalize">{moisLabel}</span>
        <span className="text-sm text-muted-foreground">{debiteurText}</span>
      </Link>
      <ExportButton moisId={mois.id} />
      <DeleteMoisButton moisId={mois.id} moisLabel={moisLabel} />
    </div>
  );
}
