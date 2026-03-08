import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { actionDeleteAjustement } from '@/app/(app)/ajustements/actions';
import type { Ajustement } from '@/types';

interface TwoColumnAjustementsProps {
  ajustements: Ajustement[];
  readOnly?: boolean;
}

interface AjustementColonne {
  ajustement: Ajustement;
  role: 'donneur' | 'receveur';
}

export default function TwoColumnAjustements({ ajustements, readOnly = false }: TwoColumnAjustementsProps) {
  const chrisItems: AjustementColonne[] = ajustements
    .filter((a) => a.de === 'chris' || a.vers === 'chris')
    .map((a) => ({ ajustement: a, role: a.de === 'chris' ? 'donneur' : 'receveur' }));

  const alexItems: AjustementColonne[] = ajustements
    .filter((a) => a.de === 'alex' || a.vers === 'alex')
    .map((a) => ({ ajustement: a, role: a.de === 'alex' ? 'donneur' : 'receveur' }));

  const totalChris = chrisItems
    .filter((i) => i.role === 'donneur')
    .reduce((sum, i) => sum + i.ajustement.montant, 0);
  const totalAlex = alexItems
    .filter((i) => i.role === 'donneur')
    .reduce((sum, i) => sum + i.ajustement.montant, 0);

  const formatMontant = (n: number) =>
    n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });

  if (ajustements.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-8" data-testid="ajustements-vides">
        Aucun ajustement ce mois-ci.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2" data-testid="ajustements-list">
      {/* Headers */}
      <div className="font-semibold text-sm py-2 border-b">
        Chris — {formatMontant(totalChris)}
      </div>
      <div className="font-semibold text-sm py-2 border-b">
        Alex — {formatMontant(totalAlex)}
      </div>

      {/* Columns */}
      <div>
        {chrisItems.map((item) => (
          <AjustementColumnItem
            key={`chris-${item.ajustement.id}`}
            item={item}
            readOnly={readOnly}
          />
        ))}
      </div>
      <div>
        {alexItems.map((item) => (
          <AjustementColumnItem
            key={`alex-${item.ajustement.id}`}
            item={item}
            readOnly={readOnly}
          />
        ))}
      </div>
    </div>
  );
}

function AjustementColumnItem({ item, readOnly }: { item: AjustementColonne; readOnly: boolean }) {
  const { ajustement, role } = item;
  const montantFormate = ajustement.montant.toLocaleString('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  });
  const showDelete = !readOnly && role === 'donneur';

  return (
    <div
      data-testid="ajustement-item"
      className="min-h-12 py-2 border-b last:border-b-0"
    >
      <div className="flex items-center justify-between">
        <p className="font-medium text-base truncate flex-1 min-w-0">{ajustement.label}</p>
        {showDelete && (
          <form action={actionDeleteAjustement}>
            <input type="hidden" name="id" value={ajustement.id} />
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
      <p className="text-sm text-muted-foreground">
        {role === 'donneur' ? `donne ${montantFormate}` : `reçoit ${montantFormate}`}
      </p>
    </div>
  );
}
