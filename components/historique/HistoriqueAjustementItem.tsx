import type { Ajustement } from '@/types';

interface Props {
  ajustement: Ajustement;
}

export function HistoriqueAjustementItem({ ajustement }: Props) {
  const montant = ajustement.montant.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });

  return (
    <div
      data-testid="historique-ajustement-item"
      className="flex items-center justify-between min-h-[48px] py-3 border-b last:border-b-0"
    >
      <div>
        <p className="font-medium text-base">{ajustement.label}</p>
        <p className="text-sm text-muted-foreground">
          {ajustement.de} → {ajustement.vers}
        </p>
      </div>
      <span className="text-base font-medium">{montant}</span>
    </div>
  );
}
