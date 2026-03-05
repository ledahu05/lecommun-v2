import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Mois } from '@/types';

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
    <Link
      href={`/historique/${mois.id}`}
      data-testid="mois-card"
      className="flex items-center justify-between min-h-[48px] py-3 border-b last:border-b-0 hover:bg-muted/50 transition-colors"
    >
      <span className="font-medium text-base capitalize">{moisLabel}</span>
      <span className="text-sm text-muted-foreground">{debiteurText}</span>
    </Link>
  );
}
