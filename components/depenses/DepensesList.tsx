import DepenseItem from './DepenseItem';
import type { Depense } from '@/types';

interface DepensesListProps {
  depenses: Depense[];
}

export default function DepensesList({ depenses }: DepensesListProps) {
  if (depenses.length === 0) {
    return (
      <p
        className="text-muted-foreground text-center py-8 text-base"
        data-testid="depenses-vides"
      >
        Aucune dépense ce mois-ci.
      </p>
    );
  }

  return (
    <div data-testid="depenses-list">
      {depenses.map((d) => (
        <DepenseItem key={d.id} depense={d} />
      ))}
    </div>
  );
}
