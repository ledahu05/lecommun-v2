import { Repeat } from 'lucide-react';
import type { Depense } from '@/types';

interface Props {
  depense: Depense;
}

export function HistoriqueDepenseItem({ depense }: Props) {
  const displayLabel = depense.label ?? depense.sous_categorie;
  const montant = depense.montant.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });

  return (
    <div
      data-testid="historique-depense-item"
      className="flex items-center justify-between min-h-[48px] py-3 border-b last:border-b-0"
    >
      <div>
        <p className="font-medium text-base">
          {displayLabel}
          {depense.recurrent === 1 && (
            <Repeat className="h-3.5 w-3.5 text-primary inline-block ml-1 shrink-0" />
          )}
        </p>
        <p className="text-sm text-muted-foreground">
          {depense.paye_par} — {montant}
        </p>
      </div>
      <span className="text-base font-medium">{montant}</span>
    </div>
  );
}
