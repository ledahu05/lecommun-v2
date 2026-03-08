import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { actionDeleteDepense } from '@/app/(app)/depenses/actions';
import type { Depense } from '@/types';

interface TwoColumnDepensesProps {
  depenses: Depense[];
  readOnly?: boolean;
}

export default function TwoColumnDepenses({ depenses, readOnly = false }: TwoColumnDepensesProps) {
  const chrisDepenses = depenses.filter((d) => d.paye_par === 'chris');
  const alexDepenses = depenses.filter((d) => d.paye_par === 'alex');

  const totalChris = chrisDepenses.reduce((sum, d) => sum + d.montant, 0);
  const totalAlex = alexDepenses.reduce((sum, d) => sum + d.montant, 0);

  const formatMontant = (n: number) =>
    n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });

  if (depenses.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-8 text-base" data-testid="depenses-vides">
        Aucune dépense ce mois-ci.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2" data-testid="depenses-list">
      {/* Headers */}
      <div className="font-semibold text-sm py-2 border-b">
        Chris — {formatMontant(totalChris)}
      </div>
      <div className="font-semibold text-sm py-2 border-b">
        Alex — {formatMontant(totalAlex)}
      </div>

      {/* Columns */}
      <div>
        {chrisDepenses.map((d) => (
          <DepenseColumnItem key={d.id} depense={d} readOnly={readOnly} />
        ))}
      </div>
      <div>
        {alexDepenses.map((d) => (
          <DepenseColumnItem key={d.id} depense={d} readOnly={readOnly} />
        ))}
      </div>
    </div>
  );
}

function DepenseColumnItem({ depense, readOnly }: { depense: Depense; readOnly: boolean }) {
  const displayLabel = depense.label ?? depense.sous_categorie;
  const montantFormate = depense.montant.toLocaleString('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  });

  return (
    <div
      data-testid="depense-item"
      className="min-h-12 py-2 border-b last:border-b-0"
    >
      <div className="flex items-center justify-between">
        <p className="font-medium text-base truncate flex-1 min-w-0">{displayLabel}</p>
        {!readOnly && (
          <form action={actionDeleteDepense}>
            <input type="hidden" name="id" value={depense.id} />
            <Button
              variant="ghost"
              size="icon"
              type="submit"
              className="min-h-12 min-w-12 -mr-3"
              aria-label="Supprimer"
            >
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </form>
        )}
      </div>
      <p className="text-sm text-muted-foreground">{montantFormate}</p>
    </div>
  );
}
