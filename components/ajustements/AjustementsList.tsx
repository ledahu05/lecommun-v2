import type { Ajustement } from '@/types';
import AjustementItem from './AjustementItem';

interface AjustementsListProps {
  ajustements: Ajustement[];
}

export default function AjustementsList({ ajustements }: AjustementsListProps) {
  if (ajustements.length === 0) {
    return (
      <p
        className="text-muted-foreground text-center py-8"
        data-testid="ajustements-vides"
      >
        Aucun ajustement ce mois-ci.
      </p>
    );
  }

  return (
    <div data-testid="ajustements-list">
      {ajustements.map((a) => (
        <AjustementItem key={a.id} ajustement={a} />
      ))}
    </div>
  );
}
