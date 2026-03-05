import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { actionDeleteDepense } from '@/app/(app)/depenses/actions';
import type { Depense } from '@/types';

interface DepenseItemProps {
  depense: Depense;
}

export default function DepenseItem({ depense }: DepenseItemProps) {
  const displayLabel = depense.label ?? depense.sous_categorie;
  const montantFormate = depense.montant.toLocaleString('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  });

  return (
    <div
      data-testid="depense-item"
      className="flex items-center justify-between min-h-[48px] py-3 border-b last:border-b-0"
    >
      <div className="flex-1 min-w-0 pr-2">
        <p className="font-medium text-base truncate">{displayLabel}</p>
        <p className="text-sm text-muted-foreground">
          {depense.paye_par} — {montantFormate}
        </p>
      </div>
      <form action={actionDeleteDepense}>
        <input type="hidden" name="id" value={depense.id} />
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
