import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { actionDeleteAjustement } from '@/app/(app)/ajustements/actions';
import type { Ajustement } from '@/types';

interface AjustementItemProps {
  ajustement: Ajustement;
}

export default function AjustementItem({ ajustement }: AjustementItemProps) {
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  const montantFormate = ajustement.montant.toLocaleString('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  });

  return (
    <div
      data-testid="ajustement-item"
      className="flex items-center justify-between min-h-[48px] py-3 border-b last:border-b-0"
    >
      <div className="flex-1 min-w-0 pr-2">
        <p className="font-medium text-base truncate">{ajustement.label}</p>
        <p className="text-sm text-muted-foreground">
          {capitalize(ajustement.vers)} donne à {capitalize(ajustement.de)} — {montantFormate}
        </p>
      </div>
      <form action={actionDeleteAjustement}>
        <input type="hidden" name="id" value={ajustement.id} />
        <Button
          variant="ghost"
          size="icon"
          type="submit"
          className="min-h-[48px] min-w-[48px]"
          aria-label="Supprimer"
        >
          <Trash2 className="w-4 h-4 text-destructive" />
        </Button>
      </form>
    </div>
  );
}
