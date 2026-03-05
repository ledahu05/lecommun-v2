import { CATEGORIES, type Categorie } from '@/lib/categories';
import type { Depense } from '@/types';

function formatEur(amount: number): string {
  return amount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
}

interface Props {
  depenses: Depense[];
}

export function BalanceSynthese({ depenses }: Props) {
  const categories = (Object.keys(CATEGORIES) as Categorie[]).map((cat) => {
    const catDepenses = depenses.filter((d) => d.categorie === cat);
    const total = catDepenses.reduce((sum, d) => sum + d.montant, 0);
    return {
      cat,
      label: CATEGORIES[cat].label,
      emoji: CATEGORIES[cat].emoji,
      total,
    };
  });

  if (categories.every((c) => c.total === 0)) {
    return (
      <p className="text-muted-foreground text-base text-center py-4">
        Aucune dépense ce mois
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        Par catégorie
      </h2>
      {categories.map(({ cat, label, emoji, total }) => (
        <div
          key={cat}
          className="flex justify-between items-center min-h-[48px] py-2"
          data-testid={`synthese-${cat}`}
        >
          <span className="text-base">
            {emoji} {label}
          </span>
          <span className="text-base font-medium">{formatEur(total)}</span>
        </div>
      ))}
    </div>
  );
}
