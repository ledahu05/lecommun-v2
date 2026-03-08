import { Repeat } from 'lucide-react';
import type { Ajustement } from '@/types';

interface Props {
  ajustement: Ajustement;
}

export function HistoriqueAjustementItem({ ajustement }: Props) {
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  const montant = ajustement.montant.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });

  return (
    <div
      data-testid="historique-ajustement-item"
      className="flex items-center justify-between min-h-[48px] py-3 border-b last:border-b-0"
    >
      <div>
        <p className="font-medium text-base">
          {ajustement.label}
          {ajustement.recurrent === 1 && (
            <Repeat className="h-3.5 w-3.5 text-primary inline-block ml-1 shrink-0" />
          )}
        </p>
        <p className="text-sm text-muted-foreground">
          {capitalize(ajustement.vers)} donne à {capitalize(ajustement.de)}
        </p>
      </div>
      <span className="text-base font-medium">{montant}</span>
    </div>
  );
}
