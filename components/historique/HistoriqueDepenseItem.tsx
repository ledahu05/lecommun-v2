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
        <p className="font-medium text-base">{displayLabel}</p>
        <p className="text-sm text-muted-foreground">
          {depense.paye_par} — {montant}
        </p>
      </div>
      <span className="text-base font-medium">{montant}</span>
    </div>
  );
}
