import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { BalanceResult } from '@/lib/balance';
import type { Mois } from '@/types';
import { InitialBalanceForm } from '@/components/balance/InitialBalanceForm';

function formatEur(amount: number): string {
  return Math.abs(amount).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
}

function formatSigned(amount: number): string {
  return (amount >= 0 ? '+' : '-') + '\u00a0' + formatEur(amount);
}

interface Props {
  balance: BalanceResult;
  mois: Mois;
  editableBalanceReportee?: boolean;
}

export function BalanceCard({ balance, mois, editableBalanceReportee }: Props) {
  const { balance_finale, total_chris, total_alex, balance_mensuelle, balance_reportee } = balance;
  const moisLabel = format(new Date(mois.annee, mois.mois - 1, 1), 'MMMM yyyy', { locale: fr });

  let debiteurText: string;
  let badgeVariant: 'destructive' | 'default' | 'outline' | 'secondary';
  if (balance_finale > 0) {
    debiteurText = `Chris doit ${formatEur(balance_finale)} à Alex`;
    badgeVariant = 'destructive';
  } else if (balance_finale < 0) {
    debiteurText = `Alex doit ${formatEur(Math.abs(balance_finale))} à Chris`;
    badgeVariant = 'default';
  } else {
    debiteurText = 'Équilibre';
    badgeVariant = 'outline';
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground capitalize">{moisLabel}</p>

      <Card>
        <CardContent className="pt-6 pb-6 text-center space-y-3">
          <Badge
            variant={badgeVariant}
            className="text-base px-4 py-2 min-h-[48px] flex items-center justify-center w-full"
          >
            <span data-testid="balance-debiteur">{debiteurText}</span>
          </Badge>
          <p className="text-3xl font-bold" data-testid="balance-finale">
            {formatEur(balance_finale)}
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3 text-base">
        <div className="bg-muted rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1">Chris</p>
          <p className="font-semibold" data-testid="total-chris">
            {formatEur(total_chris)}
          </p>
        </div>
        <div className="bg-muted rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1">Alex</p>
          <p className="font-semibold" data-testid="total-alex">
            {formatEur(total_alex)}
          </p>
        </div>
      </div>

      <div className="text-base space-y-2">
        <div className="flex justify-between items-center min-h-[48px]">
          <span className="text-muted-foreground">Balance mensuelle</span>
          <span data-testid="balance-mensuelle">{formatSigned(balance_mensuelle)}</span>
        </div>
        <Separator />
        {editableBalanceReportee ? (
          <InitialBalanceForm moisId={mois.id} currentValue={balance_reportee} />
        ) : (
          <div className="flex justify-between items-center min-h-[48px]">
            <span className="text-muted-foreground">Report mois préc.</span>
            <span data-testid="balance-reportee">{formatSigned(balance_reportee)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
