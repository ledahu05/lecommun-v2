import { Trash2, Repeat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { actionDeleteDepense, actionToggleDepenseRecurrent } from '@/app/(app)/depenses/actions';
import { CATEGORIES, type Categorie } from '@/lib/categories';
import type { Depense } from '@/types';

interface TwoColumnDepensesProps {
  depenses: Depense[];
  readOnly?: boolean;
}

const formatMontant = (n: number) =>
  n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });

function groupByCategorie(depenses: Depense[]) {
  const groups: Partial<Record<Categorie, Depense[]>> = {};
  for (const d of depenses) {
    const cat = d.categorie as Categorie;
    if (!groups[cat]) groups[cat] = [];
    groups[cat]!.push(d);
  }
  return groups;
}

export default function TwoColumnDepenses({ depenses, readOnly = false }: TwoColumnDepensesProps) {
  if (depenses.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-8 text-base" data-testid="depenses-vides">
        Aucune dépense ce mois-ci.
      </p>
    );
  }

  const chrisDepenses = depenses.filter((d) => d.paye_par === 'chris');
  const alexDepenses = depenses.filter((d) => d.paye_par === 'alex');

  const totalChris = chrisDepenses.reduce((sum, d) => sum + d.montant, 0);
  const totalAlex = alexDepenses.reduce((sum, d) => sum + d.montant, 0);

  const chrisGroups = groupByCategorie(chrisDepenses);
  const alexGroups = groupByCategorie(alexDepenses);

  // All categories that have at least one depense
  const activeCategories = Object.keys(CATEGORIES).filter(
    (cat) => chrisGroups[cat as Categorie]?.length || alexGroups[cat as Categorie]?.length
  ) as Categorie[];

  return (
    <div data-testid="depenses-list">
      {/* Headers */}
      <div className="grid grid-cols-2 gap-2 sticky top-0 bg-background z-10">
        <div className="font-semibold text-sm py-2 border-b">
          Chris — {formatMontant(totalChris)}
        </div>
        <div className="font-semibold text-sm py-2 border-b">
          Alex — {formatMontant(totalAlex)}
        </div>
      </div>

      {/* Grouped by category */}
      {activeCategories.map((cat) => {
        const info = CATEGORIES[cat];
        const chrisItems = chrisGroups[cat] ?? [];
        const alexItems = alexGroups[cat] ?? [];

        return (
          <div key={cat}>
            <div className="text-sm font-medium text-muted-foreground py-2 mt-2">
              {info.emoji} {info.label}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                {chrisItems.map((d) => (
                  <DepenseColumnItem key={d.id} depense={d} readOnly={readOnly} />
                ))}
              </div>
              <div>
                {alexItems.map((d) => (
                  <DepenseColumnItem key={d.id} depense={d} readOnly={readOnly} />
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DepenseColumnItem({ depense, readOnly }: { depense: Depense; readOnly: boolean }) {
  const displayLabel = depense.label ?? depense.sous_categorie;
  const montantFormate = formatMontant(depense.montant);

  return (
    <div
      data-testid="depense-item"
      className="min-h-12 py-2 border-b last:border-b-0"
    >
      <div className="flex items-center justify-between">
        <p className="font-medium text-base truncate flex-1 min-w-0">
          {displayLabel}
          {depense.recurrent === 1 && (
            <Repeat className="h-3.5 w-3.5 text-primary inline-block ml-1 shrink-0" />
          )}
        </p>
        {!readOnly && (
          <div className="flex items-center">
            <form action={actionToggleDepenseRecurrent}>
              <input type="hidden" name="id" value={depense.id} />
              <Button
                variant="ghost"
                size="icon"
                type="submit"
                className="min-h-12 min-w-12"
                aria-label="Basculer récurrent"
              >
                <Repeat className={`w-4 h-4 ${depense.recurrent === 1 ? 'text-primary' : 'text-muted-foreground'}`} />
              </Button>
            </form>
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
          </div>
        )}
      </div>
      <p className="text-sm text-muted-foreground">{montantFormate}</p>
    </div>
  );
}
