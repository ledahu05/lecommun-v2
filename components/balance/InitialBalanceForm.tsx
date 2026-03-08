'use client';

import { useTransition, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { actionUpdateBalanceReportee } from '@/app/(app)/actions';

interface Props {
  moisId: number;
  currentValue: number;
}

export function InitialBalanceForm({ moisId, currentValue }: Props) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const errorRef = useRef<HTMLParagraphElement>(null);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await actionUpdateBalanceReportee(formData);
      if (result?.error && errorRef.current) {
        errorRef.current.textContent = result.error;
      } else {
        if (errorRef.current) errorRef.current.textContent = '';
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">Balance initiale (report du tableur)</p>
      <form
        action={handleSubmit}
        data-testid="initial-balance-form"
        className="flex items-center gap-2"
      >
        <input type="hidden" name="mois_id" value={moisId} />
        <Input
          name="balance_reportee"
          type="number"
          step="0.01"
          defaultValue={currentValue}
          className="min-h-[48px] text-base"
          placeholder="ex: 891.50 ou -150.00"
          data-testid="initial-balance-input"
        />
        <Button
          type="submit"
          className="min-h-[48px] px-6"
          disabled={isPending}
          data-testid="initial-balance-submit"
        >
          {isPending ? '...' : 'OK'}
        </Button>
      </form>
      <p className="text-xs text-muted-foreground">
        Positif = Chris doit a Alex, negatif = Alex doit a Chris
      </p>
      <p ref={errorRef} className="text-xs text-destructive" data-testid="initial-balance-error" />
    </div>
  );
}
