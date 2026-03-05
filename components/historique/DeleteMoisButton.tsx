'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { AlertDialog } from 'radix-ui';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { actionDeleteMois } from '@/app/(app)/historique/actions';

interface Props {
  moisId: number;
  moisLabel: string;
}

export function DeleteMoisButton({ moisId, moisLabel }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const formData = new FormData();
      formData.append('id', String(moisId));
      await actionDeleteMois(formData);
      router.refresh();
    });
  }

  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger asChild>
        <Button
          data-testid="delete-mois-button"
          variant="ghost"
          size="icon"
          type="button"
          className="min-h-[48px] min-w-[48px] shrink-0"
          aria-label={`Supprimer ${moisLabel}`}
          disabled={isPending}
        >
          <Trash2 className="w-4 h-4 text-destructive" />
        </Button>
      </AlertDialog.Trigger>

      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
        <AlertDialog.Content
          className={cn(
            'fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
            'w-[calc(100vw-2rem)] max-w-md',
            'rounded-xl border bg-background p-6 shadow-lg',
            'flex flex-col gap-4'
          )}
        >
          <AlertDialog.Title className="text-lg font-semibold">
            Supprimer ce mois ?
          </AlertDialog.Title>
          <AlertDialog.Description className="text-sm text-muted-foreground">
            <span className="capitalize font-medium">{moisLabel}</span> et toutes ses dépenses et
            ajustements seront définitivement supprimés. Cette action est irréversible.
          </AlertDialog.Description>

          <div className="flex gap-3 justify-end">
            <AlertDialog.Cancel asChild>
              <Button variant="outline" className="min-h-[48px]">
                Annuler
              </Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <Button
                variant="destructive"
                className="min-h-[48px]"
                onClick={handleDelete}
                disabled={isPending}
              >
                Supprimer
              </Button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
